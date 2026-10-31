'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalElements);

  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    if (end < totalPages) pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 pt-6 border-t">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        Hiển thị <b>{startItem}</b>-<b>{endItem}</b> trong <b>{totalElements}</b> kết quả
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-background disabled:opacity-50 disabled:pointer-events-none hover:bg-muted transition"
        >
          <ChevronLeft className="w-3 h-3" />
          Trước
        </button>

        {visiblePages.map((p, i) => {
          if (p === '...') {
            return (
              <span key={i} className="px-3 py-1.5 text-muted-foreground">
                ...
              </span>
            );
          }
          const active = p === page;
          return (
            <button
              key={i}
              onClick={() => setPage(p as number)}
              className={`flex w-8 h-8 items-center justify-center rounded-md text-sm font-medium transition ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-background disabled:opacity-50 disabled:pointer-events-none hover:bg-muted transition"
        >
          Tiếp
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </nav>
  );
}
