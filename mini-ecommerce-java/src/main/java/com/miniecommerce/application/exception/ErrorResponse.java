package com.miniecommerce.application.exception;

/**
 * DTO chuẩn để trả về lỗi dưới dạng JSON cho client.
 * Format: { success: false, errorCode, message, statusCode }
 */
public record ErrorResponse(
        boolean success,
        String errorCode,
        String message,
        int statusCode
) {}
