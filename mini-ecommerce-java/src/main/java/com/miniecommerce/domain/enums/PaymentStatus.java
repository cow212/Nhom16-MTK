package com.miniecommerce.domain.enums;

/**
 * Trạng thái thanh toán.
 */
public enum PaymentStatus {
    PENDING,   // Chờ thanh toán
    PAID,      // Đã thanh toán thành công
    FAILED,    // Thanh toán thất bại
    REFUNDED   // Đã hoàn tiền
}
