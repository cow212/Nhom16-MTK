package com.miniecommerce.application.dto;

/**
 * DTO thông tin người dùng hiện tại (từ token Bearer).
 */
public record MeResponse(
        Integer userId,
        String username,
        String fullName,
        String email,
        String role,
        String phoneNumber,
        String address
) {}
