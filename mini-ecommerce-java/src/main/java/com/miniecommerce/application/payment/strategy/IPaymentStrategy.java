package com.miniecommerce.application.payment.strategy;

import com.miniecommerce.application.payment.dto.PaymentResult;
import com.miniecommerce.domain.enums.PaymentMethod;
import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

/**
 * Interface chiến lược thanh toán (Strategy Pattern).
 * Mỗi phương thức thanh toán (COD, MoMo, VNPAY) sẽ có một triển khai riêng.
 */
public interface IPaymentStrategy {

    /**
     * Trả về phương thức thanh toán mà strategy này hỗ trợ.
     */
    PaymentMethod getPaymentMethod();

    /**
     * Xử lý thanh toán bất đồng bộ.
     *
     * @param amount   số tiền cần thanh toán
     * @param orderId  mã đơn hàng
     * @return CompletableFuture chứa kết quả thanh toán
     */
    CompletableFuture<PaymentResult> processPayment(BigDecimal amount, String orderId);
}
