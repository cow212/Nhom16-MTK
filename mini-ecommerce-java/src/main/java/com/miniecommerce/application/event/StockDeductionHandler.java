package com.miniecommerce.application.event;

import org.springframework.stereotype.Component;

/**
 * Observer xác nhận đã trừ số lượng tồn kho sau khi đơn hàng đặt thành công.
 * Lưu ý: Việc trừ kho thực tế đã được thực hiện trong transaction của OrderService
 * trước khi sự kiện được phát sinh. Handler này ghi nhận và log hoàn tất quy trình tồn kho.
 */
@Component
public class StockDeductionHandler implements OrderEventHandler {

    @Override
    public void handle(OrderPlacedEvent event) {
        // Ghi nhận tồn kho đã được trừ trong quá trình đặt đơn
        System.out.println("----------------------------------------");
        System.out.println("[OBSERVER] Xử lý tồn kho cho đơn hàng: " + event.getOrderId());
        System.out.println("Trạng thái: Đã trừ tồn kho thành công trong transaction.");
        System.out.println("----------------------------------------");
    }
}
