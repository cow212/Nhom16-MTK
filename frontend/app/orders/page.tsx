'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Package, Clock, ChevronRight, RefreshCw, LogIn } from 'lucide-react';

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

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Có đăng nhập → chỉ lấy đơn của người đó; guest xem tất cả (demo)
      const params = user ? { userId: user.userId } : {};
      const res = await api.get('/api/orders', { params });
      setOrders(res.data.content || res.data || []);
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {user ? 'Đơn hàng của tôi' : 'Tất cả đơn hàng (demo)'}
          </h1>
          <p className="text-muted-foreground">
            {user
              ? 'Theo dõi trạng thái các đơn hàng gần đây của bạn.'
              : 'Bạn đang xem ở chế độ khách — đăng nhập để xem riêng đơn của mình.'}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm hover:bg-muted transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Package className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium">
            {user ? 'Chưa có đơn hàng nào' : 'Bạn chưa đăng nhập'}
          </h3>
          <p className="text-sm">
            {user
              ? 'Bắt đầu mua sắm ngay để có đơn hàng đầu tiên.'
              : 'Đăng nhập để xem riêng đơn hàng của bạn.'}
          </p>
          {!user && (
            <Link
              href="/login"
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition inline-flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập ngay
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Mã đơn</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Ngày</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Tổng tiền</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Trạng thái</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium">{o.orderCode}</div>
                    <div className="text-xs text-muted-foreground">#{o.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(o.orderDate)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    {formatCurrency(o.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/orders/${o.id}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Xem chi tiết <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
