package com.miniecommerce.application.dto;

/**
 * DTO kết quả đăng nhập / đăng ký.
 */
public record AuthResponse(
        String token,
        Integer userId,
        String username,
        String fullName,
        String email,
        String role
) {}
