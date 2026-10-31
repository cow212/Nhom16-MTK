package com.miniecommerce.application.exception;

import jakarta.persistence.OptimisticLockException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global Exception Handling Middleware (trong Spring Boot thực hiện qua @RestControllerAdvice).
 * Bắt tất cả các Exception chưa được xử lý trong ứng dụng và trả về JSON chuẩn:
 * { success: false, errorCode, message, statusCode }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý lỗi không tìm thấy tài nguyên (404).
     */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
                false,
                "NOT_FOUND",
                ex.getMessage(),
                404
        );
        return ResponseEntity.status(404).body(error);
    }

    /**
     * Xử lý lỗi yêu cầu không hợp lệ (400).
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        ErrorResponse error = new ErrorResponse(
                false,
                "BAD_REQUEST",
                ex.getMessage(),
                400
        );
        return ResponseEntity.status(400).body(error);
    }

    /**
     * Xử lý lỗi xung đột đồng thời (Concurrency) (409).
     */
    @ExceptionHandler(ConcurrencyException.class)
    public ResponseEntity<ErrorResponse> handleConcurrency(ConcurrencyException ex) {
        ErrorResponse error = new ErrorResponse(
                false,
                "CONCURRENCY_CONFLICT",
                ex.getMessage(),
                409
        );
        return ResponseEntity.status(409).body(error);
    }

    /**
     * Xử lý lỗi Optimistic Lock từ Hibernate/JPA (RowVersion không khớp).
     */
    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(OptimisticLockException ex) {
        ErrorResponse error = new ErrorResponse(
                false,
                "CONCURRENCY_CONFLICT",
                "Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại và thử lại.",
                409
        );
        return ResponseEntity.status(409).body(error);
    }

    /**
     * Xử lý tất cả các Exception còn lại chưa được xử lý (500).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        ErrorResponse error = new ErrorResponse(
                false,
                "INTERNAL_SERVER_ERROR",
                "Đã xảy ra lỗi hệ thống: " + ex.getMessage(),
                500
        );
        return ResponseEntity.status(500).body(error);
    }
}
