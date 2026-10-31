'use client';

import { useState } from 'react';
import { X, ChevronRight, Loader2 } from 'lucide-react';
import { useCartStore } from './CartProvider';
import { useAuth } from './AuthProvider';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import type { CreateOrderDto } from '@/types';
import toast from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, itemCount, clearCart, removeItem, updateQuantity } =
    useCartStore();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const generateIdempotencyKey = () => {
    return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      const idempotencyKey = generateIdempotencyKey();

      const payload: CreateOrderDto = {
        userId: user?.userId ?? 1, // Khách chưa đăng nhập dùng user demo Id = 1
        shippingAddress: 'Đang xử lý', // sẽ điền đầy đủ ở trang Checkout
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        idempotencyKey,
      };

      const res = await api.post('/api/orders', payload, {
        headers: { 'X-Idempotency-Key': idempotencyKey },
      });

      toast.success('Đặt hàng thành công!');
      clearCart();
      onClose();
      window.location.href = '/orders';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Giỏ hàng</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <span className="text-muted-foreground text-sm">Giỏ hàng đang trống</span>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4 last:border-0"
                >
                  <div className="relative aspect-square w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        Ảnh
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 rounded-md border border-border bg-background hover:bg-muted transition"
                    >
                      <ChevronRight className="w-3 h-3 rotate-180" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 rounded-md border border-border bg-background hover:bg-muted transition"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatCurrency(total())}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatCurrency(total())}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-border bg-background/50">
          {items.length === 0 ? (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted transition"
            >
              Tiếp tục mua sắm
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Tiến hành thanh toán'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
