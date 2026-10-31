package com.miniecommerce.application.payment.strategy;

import com.miniecommerce.application.payment.dto.PaymentResult;
import com.miniecommerce.domain.enums.PaymentMethod;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

/**
 * Chiến lược thanh toán qua ví MoMo.
 * Giả lập gọi API MoMo để tạo yêu cầu thanh toán.
 */
@Component
public class MomoPaymentStrategy implements IPaymentStrategy {

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.MOMO;
    }

    @Override
    public CompletableFuture<PaymentResult> processPayment(BigDecimal amount, String orderId) {
        // Giả lập gọi API MoMo (trong thực tế sẽ gọi RestClient/WebClient đến MoMo gateway)
        String transactionId = "MOMO-" + orderId;
        String message = "Tạo yêu cầu thanh toán MoMo thành công cho đơn hàng " + orderId + ", số tiền " + amount + " VND.";
        return CompletableFuture.completedFuture(new PaymentResult(true, transactionId, message));
    }
}
