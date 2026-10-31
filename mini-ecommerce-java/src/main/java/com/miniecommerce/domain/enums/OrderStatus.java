package com.miniecommerce.domain.enums;

/**
 * Trạng thái đơn hàng.
 */
public enum OrderStatus {
    PENDING,     // Chờ xác nhận
    PROCESSING,  // Đang xử lý
    COMPLETED,   // Hoàn thành
    CANCELLED    // Đã hủy
}
