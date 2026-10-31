'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { api } from '@/lib/api';
import type { Product, PageResult } from '@/types';
import { ShoppingCart, Filter, DollarSign, Tag, Search, X } from 'lucide-react';

const PAGE_SIZE = 10;

/**
 * Component danh sách sản phẩm dùng chung cho "/" và "/products".
 * Tất cả trạng thái (trang, lọc, tìm kiếm) lấy từ URL để giữ đồng bộ với Pagination.
 */
export default function ProductList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Trạng thái tiện lợi lấy từ URL (nguồn sự thật duy nhất)
  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const search = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<{ totalElements: number; totalPages: number }>({
    totalElements: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  // Đồng bộ lại input khi URL đổi (ví dụ tìm kiếm từ Navbar)
  useEffect(() => setSearchQuery(search), [search]);
  useEffect(() => setMinPriceInput(minPrice), [minPrice]);
  useEffect(() => setMaxPriceInput(maxPrice), [maxPrice]);

  const updateParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    });
    params.delete('page'); // đổi điều kiện lọc/tìm → về trang 1
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE));
      if (category) params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (search) params.set('search', search);

      const res = await api.get<PageResult<Product>>(`/api/products?${params.toString()}`);
      const data = res.data;
      setProducts(data.content || []);
      setMeta({
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 1,
      });
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, minPrice, maxPrice, search]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({
      search: searchQuery,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">
            {pathname === '/products' ? 'Tìm kiếm sản phẩm' : 'Sản phẩm'}
          </h1>
          <p className="text-muted-foreground">Duyệt và chọn sản phẩm yêu thích của bạn</p>
        </div>

        {/* Bộ lọc + tìm kiếm */}
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:block">Danh mục:</span>
            <select
              value={category}
              onChange={(e) => updateParams({ category: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tất cả</option>
              <option value="Điện tử">Điện tử</option>
              <option value="Thời trang">Thời trang</option>
              <option value="Gia đình">Gia đình</option>
              <option value="Thể thao">Thể thao</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:block">Giá từ:</span>
            <input
              type="number"
              min={0}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="0"
              className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm font-medium">đến</span>
            <input
              type="number"
              min={0}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              placeholder="0"
              className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition"
          >
            <Tag className="w-4 h-4 mr-2 inline" /> Lọc
          </button>
        </form>
      </div>

      {/* Chip kết quả tìm kiếm */}
      {search && (
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className="text-muted-foreground">Kết quả cho:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border">
            {search}
            <button
              onClick={() => updateParams({ search: null })}
              className="hover:text-destructive transition"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                <div className="aspect-[4/3] rounded-lg bg-muted mb-3" />
                <h3 className="h-4 w-3/4 rounded bg-muted mb-2" />
                <p className="h-3 w-1/2 rounded bg-muted mb-4" />
                <div className="flex items-baseline gap-2">
                  <span className="h-5 w-24 rounded bg-muted" />
                </div>
                <button className="w-full mt-3 py-2 rounded-lg bg-muted disabled:pointer-events-none" disabled />
              </div>
            ))
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Không tìm thấy sản phẩm */}
      {products.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
          <h3 className="text-lg font-medium">Không tìm thấy sản phẩm</h3>
          <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={meta.totalPages}
        totalElements={meta.totalElements}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
