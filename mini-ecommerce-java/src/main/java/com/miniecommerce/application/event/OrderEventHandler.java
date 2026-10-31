package com.miniecommerce.application.event;

/**
 * Interface Observer cho sự kiện OrderPlacedEvent.
 * Mỗi handler thực hiện một hành động cụ thể khi đơn hàng được đặt.
 */
public interface OrderEventHandler {

    /**
     * Xử lý sự kiện đơn hàng mới đặt.
     *
     * @param event sự kiện chứa thông tin đơn hàng
     */
    void handle(OrderPlacedEvent event);
}
