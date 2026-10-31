package com.miniecommerce.application.dto;

/**
 * Wrapper phân trang cho danh sách kết quả trả về từ API.
 */
public record PageResult<T>(
        int page,
        int pageSize,
        long totalElements,
        int totalPages,
        java.util.List<T> content
) {}
