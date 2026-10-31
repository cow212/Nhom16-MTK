package com.miniecommerce.application.exception;

/**
 * Ngoại lệ ném ra khi yêu cầu từ client không hợp lệ (ví dụ: thiếu thông tin, giá trị sai).
 * GlobalExceptionHandler sẽ bắt lỗi này và trả về HTTP 400.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
