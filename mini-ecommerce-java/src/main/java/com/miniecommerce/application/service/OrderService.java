package com.miniecommerce.application.service;

import com.miniecommerce.application.dto.CreateOrderDto;
import com.miniecommerce.application.dto.CreateOrderItemDto;
import com.miniecommerce.application.dto.OrderDto;
import com.miniecommerce.application.dto.OrderItemDto;
import com.miniecommerce.application.event.EventPublisher;
import com.miniecommerce.application.event.OrderPlacedEvent;
import com.miniecommerce.application.exception.BadRequestException;
import com.miniecommerce.application.exception.NotFoundException;
import com.miniecommerce.application.payment.dto.PaymentResult;
import com.miniecommerce.application.payment.strategy.PaymentContext;
import com.miniecommerce.domain.entity.IdempotencyKey;
import com.miniecommerce.domain.entity.Order;
import com.miniecommerce.domain.entity.OrderItem;
import com.miniecommerce.domain.entity.Payment;
import com.miniecommerce.domain.entity.Product;
import com.miniecommerce.domain.entity.User;
import com.miniecommerce.domain.enums.OrderStatus;
import com.miniecommerce.domain.enums.PaymentMethod;
import com.miniecommerce.domain.enums.PaymentStatus;
import com.miniecommerce.infrastructure.repository.IUnitOfWork;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * Service quản lý đơn hàng (Application Layer).
 * Xử lý:
 *   - Idempotency: kiểm tra IdempotencyKey từ header để tránh tạo trùng đơn hàng.
 *   - Race Condition: sử dụng Database Transaction qua UnitOfWork để kiểm tra
 *     và trừ tồn kho an toàn khi nhiều yêu cầu cùng lúc.
 *   - Observer: phát sinh OrderPlacedEvent sau khi đặt hàng thành công.
 *   - Strategy: xử lý thanh toán qua PaymentContext.
 */
@Service
public class OrderService {

    private final IUnitOfWork unitOfWork;
    private final EventPublisher eventPublisher;
    private final PaymentContext paymentContext;

    public OrderService(IUnitOfWork unitOfWork,
                        EventPublisher eventPublisher,
                        PaymentContext paymentContext) {
        this.unitOfWork = unitOfWork;
        this.eventPublisher = eventPublisher;
        this.paymentContext = paymentContext;
    }

    /**
     * Tạo đơn hàng mới.
     *
     * @param dto            DTO chứa thông tin đơn hàng từ client.
     * @param idempotencyKey khóa idempotency từ header X-Idempotency-Key (tùy chọn).
     * @return OrderDto của đơn hàng vừa tạo (hoặc đơn hàng đã tồn tại nếu key trùng).
     */
    @Transactional
    public OrderDto createOrderAsync(CreateOrderDto dto, String idempotencyKey) {
        // Ưu tiên idempotencyKey từ header; nếu không có thì dùng từ DTO (nếu có).
        String effectiveKey = (idempotencyKey != null && !idempotencyKey.isBlank())
                ? idempotencyKey
                : dto.idempotencyKey();

        // ==================== IDEMPOTENCY CHECK ====================
        if (effectiveKey != null && !effectiveKey.isBlank()) {
            List<IdempotencyKey> allKeys = unitOfWork.repository(IdempotencyKey.class).findAll();
            IdempotencyKey existingKey = allKeys.stream()
                    .filter(k -> effectiveKey.equals(k.getIdempotencyKey()))
                    .findFirst()
                    .orElse(null);

            if (existingKey != null) {
                Integer existingOrderId = Integer.parseInt(existingKey.getOrderId());
                return getOrderById(existingOrderId);
            }
        }

        // ==================== VALIDATION ====================
        if (dto.items() == null || dto.items().isEmpty()) {
            throw new BadRequestException("Đơn hàng phải có ít nhất một mặt hàng.");
        }

        // ==================== DATABASE TRANSACTION (DO SPRING @Transactional QUẢN LÝ) ====================
        try {
            var productRepo = unitOfWork.repository(Product.class);
            var orderRepo = unitOfWork.repository(Order.class);
            var userRepo = unitOfWork.repository(User.class);

            BigDecimal totalAmount = BigDecimal.ZERO;
            List<OrderItem> orderItems = new ArrayList<>();

            for (CreateOrderItemDto itemDto : dto.items()) {
                Product product = productRepo.findById(itemDto.productId())
                        .orElseThrow(() -> new NotFoundException(
                                "Không tìm thấy sản phẩm Id = " + itemDto.productId()));

                // ==================== CHỐNG TRANH CHẤP KHO (RACE CONDITION) ====================
                if (product.getStockQuantity() < itemDto.quantity()) {
                    throw new BadRequestException(
                            "Sản phẩm '" + product.getName() + "' không đủ hàng trong kho (còn "
                                    + product.getStockQuantity() + ").");
                }

                product.setStockQuantity(product.getStockQuantity() - itemDto.quantity());
                productRepo.save(product);

                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(product);
                orderItem.setQuantity(itemDto.quantity());
                orderItem.setUnitPrice(product.getPrice());
                orderItem.setDiscount(BigDecimal.ZERO);
                orderItems.add(orderItem);

                totalAmount = totalAmount.add(
                        product.getPrice().multiply(BigDecimal.valueOf(itemDto.quantity())));
            }

            User user = userRepo.findById(dto.userId())
                    .orElseThrow(() -> new NotFoundException(
                            "Không tìm thấy người dùng Id = " + dto.userId()));

            String orderCode = "ORD-"
                    + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                    + "-" + (int) (Math.random() * 9000 + 1000);

            Order order = new Order();
            order.setOrderCode(orderCode);
            order.setUser(user);
            order.setOrderDate(LocalDateTime.now());
            order.setStatus(OrderStatus.PENDING);
            order.setTotalAmount(totalAmount);
            order.setShippingAddress(dto.shippingAddress());
            order.setOrderItems(orderItems);

            orderItems.forEach(oi -> oi.setOrder(order));

            orderRepo.save(order);

            // ==================== LƯU IDEMPOTENCY KEY ====================
            if (effectiveKey != null && !effectiveKey.isBlank()) {
                IdempotencyKey idempotencyKeyEntity = new IdempotencyKey();
                idempotencyKeyEntity.setIdempotencyKey(effectiveKey);
                idempotencyKeyEntity.setOrderId(String.valueOf(order.getId()));
                unitOfWork.repository(IdempotencyKey.class).save(idempotencyKeyEntity);
            }

            unitOfWork.commit();

            // ==================== XỬ LÝ THANH TOÁN (STRATEGY PATTERN) ====================
            PaymentMethod defaultMethod = PaymentMethod.COD;
            try {
                PaymentResult paymentResult = paymentContext.execute(
                                defaultMethod, totalAmount, orderCode)
                        .get();
                System.out.println("[PAYMENT] " + paymentResult.message());
            } catch (InterruptedException | ExecutionException e) {
                Thread.currentThread().interrupt();
                System.out.println("[PAYMENT] Lỗi xử lý thanh toán: " + e.getMessage());
            }

            // ==================== PHÁT SINH SỰ KIỆN (OBSERVER PATTERN) ====================
            eventPublisher.publish(new OrderPlacedEvent(
                    order.getOrderCode(),
                    user.getEmail(),
                    totalAmount
            ));

            return toDto(order);

        } catch (Exception e) {
            throw e; // @Transactional tự động rollback khi ném exception ra ngoài
        }
    }

    /**
     * Lưu kết quả thanh toán cho một đơn hàng.
     * Được gọi từ PaymentController sau khi Strategy xử lý xong.
     */
    @Transactional
    public void recordPayment(Integer orderId, PaymentMethod method, BigDecimal amount, PaymentResult result) {
        Order order = unitOfWork.repository(Order.class).findById(orderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng có Id = " + orderId));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(method);
        payment.setAmount(amount);
        payment.setStatus(result.success() ? PaymentStatus.PAID : PaymentStatus.FAILED);
        payment.setTransactionId(result.transactionId());
        payment.setPaidAt(LocalDateTime.now());
        unitOfWork.repository(Payment.class).save(payment);

        // Thanh toán thành công → đơn chuyển sang đang xử lý
        if (result.success() && order.getStatus() != OrderStatus.CANCELLED) {
            order.setStatus(OrderStatus.PROCESSING);
            unitOfWork.repository(Order.class).save(order);
        }

        unitOfWork.commit();

        System.out.println("[PAYMENT] " + method + " cho đơn " + order.getOrderCode()
                + ": " + (result.success() ? "PAID" : "FAILED"));
    }

    /**
     * Lấy danh sách tất cả đơn hàng (lọc theo userId nếu có).
     */
    public List<OrderDto> getAllOrders(Integer userId) {
        return unitOfWork.repository(Order.class).findAll().stream()
                .filter(o -> userId == null || (o.getUser() != null && userId.equals(o.getUser().getId())))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết đơn hàng theo Id.
     */
    public OrderDto getOrderById(Integer id) {
        Order order = unitOfWork.repository(Order.class).findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng có Id = " + id));
        return toDto(order);
    }

    /**
     * Hủy đơn hàng (cập nhật trạng thái).
     */
    @Transactional
    public void cancelOrder(Integer id) {
        Order order = unitOfWork.repository(Order.class).findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng có Id = " + id));

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.COMPLETED) {
            throw new BadRequestException("Không thể hủy đơn hàng trong trạng thái hiện tại.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        unitOfWork.repository(Order.class).save(order);
        unitOfWork.commit();
    }

    private OrderDto toDto(Order o) {
        List<OrderItemDto> items = o.getOrderItems().stream()
                .map(oi -> new OrderItemDto(
                        oi.getId(),
                        oi.getProduct() != null ? oi.getProduct().getId() : null,
                        oi.getProduct() != null ? oi.getProduct().getName() : null,
                        oi.getQuantity(),
                        oi.getUnitPrice(),
                        oi.getDiscount()
                ))
                .collect(Collectors.toList());

        return new OrderDto(
                o.getId(),
                o.getOrderCode(),
                o.getUser() != null ? o.getUser().getId() : null,
                o.getOrderDate(),
                o.getStatus(),
                o.getTotalAmount(),
                o.getShippingAddress(),
                items
        );
    }
}
