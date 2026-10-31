package com.miniecommerce.application.dto;

import java.math.BigDecimal;

/**
 * DTO dùng để trả về thông tin sản phẩm cho client.
 */
public record ProductDto(
        Integer id,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String sku,
        String category,
        String imageUrl,
        boolean active
) {}
