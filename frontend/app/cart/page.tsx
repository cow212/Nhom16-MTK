'use client';

import Link from 'next/link';
import { useCartStore } from '@/components/CartProvider';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import CartDrawer from '@/components/CartDrawer';
import { useState } from 'react';

export default function CartPage() {
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } =
    useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (itemCount() === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary mb-6">
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-8">
            Bạn chưa có sản phẩm nào trong giỏ hàng.
          </p>
          <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Danh sách giỏ hàng */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">Giỏ hàng ({itemCount()})</h2>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col lg:flex-row gap-4 items-start lg:items-center border-b border-border pb-6 last:border-0"
              >
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative aspect-square w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        Ảnh
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                </div>

                {/* Điều khiển số lượng + xóa */}
                <div className="flex items-center gap-3 w-full lg:w-auto lg:justify-end">
                  <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity === 1}
                      className="p-2 w-8 h-8 border-r border-border bg-background hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 w-8 h-8 bg-background hover:bg-muted"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-medium text-lg ml-4 lg:ml-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-4 p-2 text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="p-6 rounded-xl border border-border bg-background">
            <h3 className="font-semibold mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sản phẩm ({itemCount()})</span>
                <span className="font-medium">{formatCurrency(total())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="font-medium text-primary">Miễn phí</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-3">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(total())}</span>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg border border-blue-100 bg-blue-50 text-blue-900 text-sm">
              💡 Giao hàng nhanh trong 1-3 ngày làm việc.
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Tiến hành thanh toán ({formatCurrency(total())})
          </button>
        </div>
      </div>

      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
