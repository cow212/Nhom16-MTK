package com.miniecommerce.application.dto;

import java.util.List;

/**
 * DTO dùng để tạo mới đơn hàng.
 * Thêm trường idempotencyKey để hỗ trợ idempotency (tránh tạo trùng đơn hàng).
 */
public record CreateOrderDto(
        Integer userId,
        String shippingAddress,
        List<CreateOrderItemDto> items,
        String idempotencyKey
) {}
