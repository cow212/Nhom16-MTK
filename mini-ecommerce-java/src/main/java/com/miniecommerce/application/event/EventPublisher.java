package com.miniecommerce.application.event;

import org.springframework.stereotype.Component;
import java.util.List;

/**
 * EventPublisher giữ danh sách các OrderEventHandler (Observers)
 * và phát sinh sự kiện OrderPlacedEvent đến tất cả các handler.
 */
@Component
public class EventPublisher {

    private final List<OrderEventHandler> handlers;

    public EventPublisher(List<OrderEventHandler> handlers) {
        this.handlers = handlers;
    }

    /**
     * Phát sinh sự kiện đến tất cả các observer đã đăng ký.
     *
     * @param event sự kiện OrderPlacedEvent cần xử lý
     */
    public void publish(OrderPlacedEvent event) {
        for (OrderEventHandler handler : handlers) {
            handler.handle(event);
        }
    }
}
