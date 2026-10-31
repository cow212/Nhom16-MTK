package com.miniecommerce.application.dto;

import java.math.BigDecimal;

/**
 * DTO chi tiết một mặt hàng trong đơn hàng.
 */
public record OrderItemDto(
        Integer id,
        Integer productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal discount
) {}
