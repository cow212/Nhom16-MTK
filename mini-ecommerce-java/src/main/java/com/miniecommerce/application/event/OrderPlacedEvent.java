package com.miniecommerce.application.event;

import java.math.BigDecimal;

/**
 * Sự kiện được phát sinh sau khi đơn hàng được đặt thành công.
 * Chứa thông tin cần thiết để các observer phản ứng (gửi email, cập nhật kho, ...).
 */
public class OrderPlacedEvent {

    private final String orderId;
    private final String customerEmail;
    private final BigDecimal totalAmount;

    public OrderPlacedEvent(String orderId, String customerEmail, BigDecimal totalAmount) {
        this.orderId = orderId;
        this.customerEmail = customerEmail;
        this.totalAmount = totalAmount;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
}
