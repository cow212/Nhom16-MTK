package com.miniecommerce.application.dto;

/**
 * DTO đăng nhập (cho phép dùng username hoặc email).
 */
public record LoginRequest(
        String usernameOrEmail,
        String password
) {}
