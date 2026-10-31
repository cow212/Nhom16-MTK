package com.miniecommerce.application.payment.strategy;

import com.miniecommerce.domain.enums.PaymentMethod;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Factory chọn đúng PaymentStrategy dựa vào PaymentMethod.
 */
@Component
public class PaymentFactory {

    private final Map<PaymentMethod, IPaymentStrategy> strategyMap = new HashMap<>();

    public PaymentFactory(List<IPaymentStrategy> strategies) {
        for (IPaymentStrategy strategy : strategies) {
            strategyMap.put(strategy.getPaymentMethod(), strategy);
        }
    }

    /**
     * Lấy strategy tương ứng với phương thức thanh toán.
     *
     * @param method phương thức thanh toán (COD, MOMO, VNPAY)
     * @return IPaymentStrategy đã được cấu hình
     * @throws IllegalArgumentException nếu không hỗ trợ phương thức này
     */
    public IPaymentStrategy getStrategy(PaymentMethod method) {
        IPaymentStrategy strategy = strategyMap.get(method);
        if (strategy == null) {
            throw new IllegalArgumentException("Không hỗ trợ phương thức thanh toán: " + method);
        }
        return strategy;
    }
}
