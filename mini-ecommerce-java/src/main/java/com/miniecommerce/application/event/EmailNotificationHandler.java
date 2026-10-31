package com.miniecommerce.application.event;

import org.springframework.stereotype.Component;

/**
 * Observer gửi email xác nhận đơn hàng (mock).
 * Trong thực tế sẽ gọi email service (JavaMailSender, SMTP, ...) để gửi email thật.
 */
@Component
public class EmailNotificationHandler implements OrderEventHandler {

    @Override
    public void handle(OrderPlacedEvent event) {
        // MOCK: Gửi email xác nhận
        System.out.println("========================================");
        System.out.println("[MOCK EMAIL] Gửi email xác nhận đơn hàng");
        System.out.println("Đơn hàng: " + event.getOrderId());
        System.out.println("Khách hàng: " + event.getCustomerEmail());
        System.out.println("Tổng tiền: " + event.getTotalAmount() + " VND");
        System.out.println("Nội dung: Cảm ơn bạn đã đặt hàng. Chúng tôi đang xử lý đơn hàng của bạn.");
        System.out.println("========================================");
    }
}
