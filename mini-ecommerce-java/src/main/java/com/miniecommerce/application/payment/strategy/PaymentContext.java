package com.miniecommerce.application.payment.strategy;

import com.miniecommerce.application.payment.dto.PaymentResult;
import com.miniecommerce.domain.enums.PaymentMethod;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

/**
 * PaymentContext giữ tham chiếu đến PaymentStrategy hiện tại và ủy thác
 * việc xử lý thanh toán cho strategy được chọn thông qua PaymentFactory.
 */
@Component
public class PaymentContext {

    private final PaymentFactory paymentFactory;

    public PaymentContext(PaymentFactory paymentFactory) {
        this.paymentFactory = paymentFactory;
    }

    /**
     * Thực hiện thanh toán bằng phương thức chỉ định.
     *
     * @param method   phương thức thanh toán
     * @param amount   số tiền
     * @param orderId  mã đơn hàng
     * @return CompletableFuture chứa kết quả thanh toán
     */
    public CompletableFuture<PaymentResult> execute(PaymentMethod method, BigDecimal amount, String orderId) {
        IPaymentStrategy strategy = paymentFactory.getStrategy(method);
        return strategy.processPayment(amount, orderId);
    }
}
