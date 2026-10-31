'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/components/CartProvider';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
  ShoppingBag,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined = đang tải

  useEffect(() => {
    let cancelled = false;
    const fetchProduct = async () => {
      try {
        const res = await api.get<Product>(`/api/products/${params.id}`);
        if (!cancelled) setProduct(res.data);
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
        if (!cancelled) setProduct(null);
      }
    };
    fetchProduct();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // ============ Đang tải ============
  if (product === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Đang tải sản phẩm...</p>
      </div>
    );
  }

  // ============ Không tìm thấy ============
  if (product === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Sản phẩm không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Link>
      </div>
    );
  }

  const soldOut = product.stockQuantity === 0;

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    addItem(product);
    router.push('/cart');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category || '')}`}
          className="hover:text-primary transition"
        >
          {product.category || 'Sản phẩm'}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[220px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Ảnh */}
        <div className="md:w-1/2">
          <div className="rounded-2xl border border-border bg-background overflow-hidden">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center bg-muted">
                <span className="text-muted-foreground text-sm">Chưa có ảnh sản phẩm</span>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin */}
        <div className="md:w-1/2 flex flex-col">
          {product.category && (
            <span className="self-start px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-3">
              {product.category}
            </span>
          )}
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="flex items-baseline gap-3 mb-4">
            <span className={`text-2xl font-bold ${soldOut ? 'text-muted-foreground line-through' : 'text-primary'}`}>
              {formatCurrency(product.price)}
            </span>
            {soldOut && <span className="text-destructive text-sm font-medium">Hết hàng</span>}
          </p>

          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>
          )}

          <dl className="space-y-2 text-sm mb-8 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mã sản phẩm</dt>
              <dd className="font-medium">{product.sku || `#${product.id}`}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tồn kho</dt>
              <dd className={`font-medium ${soldOut ? 'text-destructive' : ''}`}>
                {product.stockQuantity}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={soldOut}
              className="flex-1 py-3 rounded-lg border border-primary text-primary font-medium text-sm hover:bg-primary/5 disabled:opacity-50 disabled:pointer-events-none transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              disabled={soldOut}
              className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition flex items-center justify-center gap-2"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
