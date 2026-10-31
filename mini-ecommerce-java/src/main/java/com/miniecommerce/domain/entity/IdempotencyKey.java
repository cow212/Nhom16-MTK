package com.miniecommerce.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * Entity lưu trữ khóa idempotency để tránh tạo trùng đơn hàng
 * khi khách hàng gửi yêu cầu trùng lặp (ví dụ bấm nút đặt hàng 2 lần).
 */
@Entity
@Table(name = "idempotency_keys")
public class IdempotencyKey extends BaseEntity {

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 200)
    private String idempotencyKey;

    @Column(nullable = false, length = 100)
    private String orderId;

    // ==================== Getters / Setters ====================

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
}
