'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderDto } from '@/types';
import { ArrowLeft, Loader2, PackageOpen, MapPin, Clock } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDto | null | undefined>(undefined); // undefined = đang tải

  useEffect(() => {
    let cancelled = false;
    const fetchOrder = async () => {
      try {
        const res = await api.get<OrderDto>(`/api/orders/${params.id}`);
        if (!cancelled) setOrder(res.data);
      } catch (err) {
        console.error('Lỗi tải đơn hàng:', err);
        if (!cancelled) setOrder(null);
      }
    };
    fetchOrder();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // ============ Đang tải ============
  if (order === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Đang tải đơn hàng...</p>
      </div>
    );
  }

  // ============ Không tìm thấy ============
  if (order === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <PackageOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
        <Link
          href="/orders"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Về danh sách đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Danh sách đơn hàng
      </Link>

      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng {order.orderCode}</h1>
          <p className="text-xs text-muted-foreground mt-1">#{order.id}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
        >
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {/* Danh sách mặt hàng */}
      <div className="rounded-xl border border-border bg-background overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border bg-muted/50 text-sm font-semibold">
          Chi tiết các mặt hàng
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="px-6 py-3 font-medium">Sản phẩm</th>
              <th className="px-6 py-3 font-medium text-center">SL</th>
              <th className="px-6 py-3 font-medium text-right">Đơn giá</th>
              <th className="px-6 py-3 font-medium text-right">Tạm tính</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id} className="border-t border-border text-sm">
                <td className="px-6 py-3">
                  <div className="font-medium">{item.productName || `Sản phẩm #${item.productId}`}</div>
                  {item.discount > 0 && (
                    <div className="text-xs text-primary">Giảm {formatCurrency(item.discount)}</div>
                  )}
                </td>
                <td className="px-6 py-3 text-center">{item.quantity}</td>
                <td className="px-6 py-3 text-right text-muted-foreground">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-6 py-3 text-right font-medium">
                  {formatCurrency(item.unitPrice * item.quantity - item.discount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-between">
          <span className="text-sm font-semibold">Tổng cộng</span>
          <span className="text-primary font-bold">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Thông tin giao hàng */}
      <div className="rounded-xl border border-border bg-background p-6 space-y-4 text-sm">
        <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">{order.shippingAddress || 'Không có'}</span>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">
            Đặt lúc: {order.orderDate ? formatDate(order.orderDate) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
