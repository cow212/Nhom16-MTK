'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import type { PaymentRequest, OrderDto } from '@/types';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Package,
  CheckCircle2,
  Loader2,
  Mail,
  Home,
  Phone,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AddressForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCartStore();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO' | 'VNPAY'>('COD');
  const [bill, setBill] = useState<OrderDto | null>(null);

  const [form, setForm] = useState<AddressForm>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  });

  const methods = [
    { id: 'COD', label: 'Tiền khi nhận hàng (COD)', icon: Wallet },
    { id: 'MOMO', label: 'Ví MoMo', icon: CreditCard },
    { id: 'VNPAY', label: 'VNPAY', icon: CreditCard },
  ];

  const generateIdempotencyKey = () =>
    `ord-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }
    if (!form.fullName || !form.phone || !form.address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = generateIdempotencyKey();

      const payload = {
        userId: user?.userId ?? 1, // Khách chưa đăng nhập dùng user demo Id = 1
        shippingAddress: `${form.fullName} - ${form.phone} - ${form.address}, ${form.ward}, ${form.district}, ${form.city}`,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        idempotencyKey,
      };

      const res = await api.post('/api/orders', payload, {
        headers: { 'X-Idempotency-Key': idempotencyKey },
      });
      const createdOrder = res.data as OrderDto; // backend trả OrderDto trực tiếp

      // Nếu chọn Momo/VNPay, gọi endpoint thanh toán cho chính đơn vừa tạo
      if (paymentMethod !== 'COD') {
        if (createdOrder?.id) {
          await api.post(
            `/api/payments/${createdOrder.id}`,
            { paymentMethod, amount: total() } as PaymentRequest
          );
        }
      }

      setBill(createdOrder); // giữ thông tin để hiển thị hoá đơn
      clearCart();
      setStep('success');
      toast.success('Đặt hàng thành công!');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại.'
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    const billItems = bill?.items || [];
    const payLabel =
      paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : `Đã thanh toán qua ${paymentMethod}`;
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Đặt hàng thành công!</h2>
          <p className="text-muted-foreground text-sm">Cảm ơn bạn đã mua sắm tại Mini E-commerce.</p>
        </div>

        {bill && (
          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            <div className="flex items-start justify-between border-b border-dashed border-border pb-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Mã đơn hàng</p>
                <p className="font-mono font-bold text-lg">{bill.orderCode}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Trạng thái</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  {payLabel}
                </span>
              </div>
            </div>

            {billItems.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {billItems.map((i) => (
                  <li key={i.productId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">×{i.quantity}</span>
                      {i.productName}
                    </span>
                    <span className="font-medium">{formatCurrency(i.unitPrice * i.quantity)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Đơn hàng của bạn đang được xử lý.
              </p>
            )}

            <div className="border-t border-dashed border-border pt-4 mb-1 flex items-center justify-between">
              <span className="font-semibold">Tổng tiền</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(bill.totalAmount)}
              </span>
            </div>
            {bill.shippingAddress && (
              <p className="text-xs text-muted-foreground mt-2">
                Giao tới: {bill.shippingAddress}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {bill && (
            <Link
              href={`/orders/${bill.id}`}
              className="px-5 py-3 border border-border rounded-lg hover:bg-muted text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" /> Xem hoá đơn chi tiết
            </Link>
          )}
          <Link
            href="/orders"
            className="px-5 py-3 border border-border rounded-lg hover:bg-muted text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" /> Đơn hàng của tôi
          </Link>
          <Link
            href="/"
            className="px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (itemCount() === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Link href="/" className="text-primary mb-4 inline-block">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại mua sắm
        </Link>
        <h2 className="text-xl font-bold">Giỏ hàng trống</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto">
        {/* Bước 1: Thông tin */}
        <div className="flex-1 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-background">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-semibold">Thông tin giao hàng</h3>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Họ và tên</label>
                <input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Số điện thoại</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0901234567"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium">Địa chỉ chi tiết</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Phường/Xã</label>
                <input
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Quận/Huyện</label>
                <input
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Tỉnh/Thành phố</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </form>
          </div>

          <div className="p-6 rounded-xl border border-border bg-background">
            <h3 className="font-semibold mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-xs">
                    {i.name} × {i.quantity}
                  </span>
                  <span className="font-medium">{formatCurrency(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t pt-3">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(total())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bước 2: Thanh toán */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-background sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-semibold">Phương thức thanh toán</h3>
            </div>

            <div className="space-y-3">
              {methods.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition text-sm ${
                      paymentMethod === m.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">
                Lưu ý: Mã Idempotency-Key sẽ được gửi tự động trong header mỗi lần đặt hàng để tránh trùng lặp đơn khi nhấn nút nhiều lần.
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Xác nhận đặt hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
