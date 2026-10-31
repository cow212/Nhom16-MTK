package com.miniecommerce.application.dto;

/**
 * DTO dùng khi gọi API thanh toán cho một đơn hàng.
 */
public record PaymentRequest(
        String paymentMethod,   // COD, MOMO, VNPAY
        java.math.BigDecimal amount
) {}
