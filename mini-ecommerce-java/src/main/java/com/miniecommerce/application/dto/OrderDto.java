package com.miniecommerce.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.miniecommerce.domain.enums.OrderStatus;

/**
 * DTO dùng để trả về thông tin chi tiết đơn hàng (kèm các mặt hàng).
 */
public record OrderDto(
        Integer id,
        String orderCode,
        Integer userId,
        LocalDateTime orderDate,
        OrderStatus status,
        BigDecimal totalAmount,
        String shippingAddress,
        List<OrderItemDto> items
) {}
