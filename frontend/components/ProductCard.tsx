'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from './CartProvider';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Plus } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:shadow-lg hover:-translate-y-1',
        'cursor-default'
      )}
    >
      {/* Ảnh sản phẩm */}
      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted border border-dashed border-muted-foreground">
            <span className="text-muted-foreground text-xs">Không có ảnh</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {product.category && (
            <span className="flex items-center rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">
              {product.category}
            </span>
          )}
          {product.stockQuantity === 0 && (
            <span className="px-2 py-0.5 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-xs">
              Hết hàng
            </span>
          )}
        </div>

        <Link href={`/products/${product.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-semibold line-clamp-2">{product.name}</h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description || 'Không có mô tả.'}
        </p>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
          {product.stockQuantity > 0 && (
            <span className="text-xs text-muted-foreground">
              Còn {product.stockQuantity}
            </span>
          )}
        </div>
      </div>

      {/* Nút mua nhanh */}
      {product.stockQuantity > 0 && (
        <button
          onClick={handleAdd}
          disabled={added}
          className={cn(
            'w-full mt-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
            added
              ? 'bg-green-100 text-green-700'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {added ? (
            <>
              <span className="w-4 h-4 rounded-full border border-green-700/50 animate-spin" /> Thêm...
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Thêm vào giỏ
            </>
          )}
        </button>
      )}

      {product.stockQuantity === 0 && (
        <button disabled className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground bg-muted border border-border">
          Hết hàng
        </button>
      )}
    </article>
  );
}
