package com.miniecommerce.application.payment.strategy;

import com.miniecommerce.application.payment.dto.PaymentResult;
import com.miniecommerce.domain.enums.PaymentMethod;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

/**
 * Chiến lược thanh toán qua VNPAY.
 * Giả lập gọi API VNPAY để tạo URL thanh toán.
 */
@Component
public class VnPayPaymentStrategy implements IPaymentStrategy {

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.VNPAY;
    }

    @Override
    public CompletableFuture<PaymentResult> processPayment(BigDecimal amount, String orderId) {
        // Giả lập gọi API VNPAY (trong thực tế sẽ gọi RestClient/WebClient đến VNPAY gateway)
        String transactionId = "VNPAY-" + orderId;
        String message = "Tạo yêu cầu thanh toán VNPAY thành công cho đơn hàng " + orderId + ", số tiền " + amount + " VND.";
        return CompletableFuture.completedFuture(new PaymentResult(true, transactionId, message));
    }
}
