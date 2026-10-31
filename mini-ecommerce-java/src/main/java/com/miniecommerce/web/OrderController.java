package com.miniecommerce.web;

import com.miniecommerce.application.dto.CreateOrderDto;
import com.miniecommerce.application.dto.OrderDto;
import com.miniecommerce.application.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * API quản lý đơn hàng (RESTful).
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getAll(
            @RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(orderService.getAllOrders(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /**
     * Tạo đơn hàng mới.
     * Client có thể gửi IdempotencyKey qua header X-Idempotency-Key để tránh tạo trùng đơn.
     */
    @PostMapping
    public ResponseEntity<OrderDto> create(
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody CreateOrderDto dto) {
        OrderDto created = orderService.createOrderAsync(dto, idempotencyKey);
        return ResponseEntity.created(URI.create("/api/orders/" + created.id())).body(created);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Integer id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }
}
