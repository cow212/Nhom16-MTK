import { Suspense } from 'react';
import ProductList from '@/components/ProductList';

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
          Đang tải sản phẩm...
        </div>
      }
    >
      <ProductList />
    </Suspense>
  );
}
