package com.miniecommerce.application.payment.strategy;

import com.miniecommerce.application.payment.dto.PaymentResult;
import com.miniecommerce.domain.enums.PaymentMethod;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

/**
 * Chiến lược thanh toán COD (Tiền mặt khi nhận hàng).
 * Không cần gọi gateway bên ngoài, luôn trả về thành công ngay lập tức.
 */
@Component
public class CodPaymentStrategy implements IPaymentStrategy {

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.COD;
    }

    @Override
    public CompletableFuture<PaymentResult> processPayment(BigDecimal amount, String orderId) {
        String transactionId = "COD-" + orderId;
        String message = "Thanh toán COD đã được ghi nhận. Khách hàng sẽ thanh toán khi nhận hàng.";
        return CompletableFuture.completedFuture(new PaymentResult(true, transactionId, message));
    }
}
