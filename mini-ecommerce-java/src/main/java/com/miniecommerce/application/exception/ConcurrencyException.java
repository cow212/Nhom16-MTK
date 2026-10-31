package com.miniecommerce.application.exception;

/**
 * Ngoại lệ ném ra khi phát hiện xung đột cùng lúc truy cập/chỉnh sửa cùng một tài nguyên
 * (ví dụ: hai đơn hàng cùng mua sản phẩm còn ít tồn kho, hoặc cập nhật sản phẩm bị RowVersion không khớp).
 * GlobalExceptionHandler sẽ bắt lỗi này và trả về HTTP 409 Conflict.
 */
public class ConcurrencyException extends RuntimeException {

    public ConcurrencyException(String message) {
        super(message);
    }
}
