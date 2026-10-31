package com.miniecommerce.application.dto;

/**
 * DTO chi tiết mặt hàng khi tạo đơn hàng.
 */
public record CreateOrderItemDto(
        Integer productId,
        Integer quantity
) {}
