package com.miniecommerce.application.dto;

/**
 * DTO đăng ký tài khoản mới.
 */
public record RegisterRequest(
        String fullName,
        String username,
        String email,
        String password,
        String phoneNumber,
        String address
) {}
