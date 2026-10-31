package com.miniecommerce.application.payment.dto;

/**
 * Kết quả xử lý thanh toán từ một PaymentStrategy.
 */
public record PaymentResult(
        boolean success,
        String transactionId,
        String message
) {}
