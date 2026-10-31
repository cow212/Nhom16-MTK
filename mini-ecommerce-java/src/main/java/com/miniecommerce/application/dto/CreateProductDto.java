package com.miniecommerce.application.dto;

import java.math.BigDecimal;

/**
 * DTO dùng để tạo mới sản phẩm.
 */
public record CreateProductDto(
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String sku,
        String category
) {}
