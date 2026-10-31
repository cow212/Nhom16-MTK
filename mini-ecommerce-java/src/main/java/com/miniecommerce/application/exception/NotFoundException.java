package com.miniecommerce.application.exception;

/**
 * Ngoại lệ ném ra khi không tìm thấy tài nguyên yêu cầu (ví dụ: sản phẩm, đơn hàng không tồn tại).
 * GlobalExceptionHandler sẽ bắt lỗi này và trả về HTTP 404.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
