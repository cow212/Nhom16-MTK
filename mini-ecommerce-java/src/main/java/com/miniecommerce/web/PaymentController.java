package com.miniecommerce.web;

import com.miniecommerce.application.dto.OrderDto;
import com.miniecommerce.application.dto.PaymentRequest;
import com.miniecommerce.application.payment.dto.PaymentResult;
import com.miniecommerce.application.payment.strategy.PaymentContext;
import com.miniecommerce.application.service.OrderService;
import com.miniecommerce.domain.enums.PaymentMethod;
import com.miniecommerce.domain.entity.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.concurrent.ExecutionException;

/**
 * API thanh toán cho đơn hàng.
 * Sử dụng Strategy Pattern để chọn phương thức thanh toán (COD, MOMO, VNPAY).
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final OrderService orderService;
    private final PaymentContext paymentContext;

    public PaymentController(OrderService orderService,
                             PaymentContext paymentContext) {
        this.orderService = orderService;
        this.paymentContext = paymentContext;
    }

    /**
     * Gọi thanh toán cho một đơn hàng.
     * Path variable: orderId (mã đơn hàng)
     * Body: PaymentRequest (paymentMethod, amount)
     */
    @PostMapping("/{orderId}")
    public ResponseEntity<PaymentResult> pay(
            @PathVariable Integer orderId,
            @RequestBody PaymentRequest request) {

        // Lấy đơn hàng để xác nhận tồn tại và lấy mã đơn hàng
        OrderDto orderDto = orderService.getOrderById(orderId);
        String orderCode = orderDto.orderCode();

        // Chuyển chuỗi paymentMethod từ client sang enum
        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(request.paymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Phương thức thanh toán không hỗ trợ: " + request.paymentMethod());
        }

        BigDecimal amount = (request.amount() != null) ? request.amount() : orderDto.totalAmount();

        // Gọi Strategy thực hiện thanh toán (bất đồng bộ)
        PaymentResult result;
        try {
            result = paymentContext.execute(method, amount, orderCode).get();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Lỗi xử lý thanh toán: " + e.getMessage());
        }

        // Lưu kết quả thanh toán vào DB và cập nhật trạng thái đơn hàng
        orderService.recordPayment(orderId, method, amount, result);

        return ResponseEntity.created(URI.create("/api/payments/" + orderId)).body(result);
    }
}
