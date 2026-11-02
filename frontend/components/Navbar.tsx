'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from './CartProvider';
import { useAuth } from './AuthProvider';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart,
  Menu,
  X,
  ShoppingBag,
  Search,
  Home,
  CreditCard,
  LogIn,
  LogOut,
  Package,
} from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount, total } = useCartStore();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-blur]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">Mini E-commerce</span>
        </Link>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-12">
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              className="flex-1 rounded-l-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="rounded-r-md border border-l-0 border-input bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Đăng nhập / Tài khoản */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="hidden lg:inline text-sm text-muted-foreground">
                Xin chào,{' '}
                <span className="font-medium text-foreground">
                  {user.fullName || user.username}
                </span>
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="font-medium">Đăng nhập</span>
            </Link>
          )}
          <Link
            href="/orders"
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <Package className="w-4 h-4" />
            <span className="font-medium">Đơn hàng</span>
          </Link>
          <Link
            href="/cart"
            className="relative p-2 text-muted-foreground hover:text-foreground"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount() > 0 && (
              <span className="absolute top-0 right-0 flex h-[10px] w-[10px] items-center justify-center rounded-full bg-destructive px-[2px]">
                <span className="text-[10px] font-bold text-destructive-foreground">
                  {itemCount()}
                </span>
              </span>
            )}
          </Link>
          <Link href="/checkout" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Thanh toán</span>
          </Link>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-lg">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="container mx-auto px-6 py-8 space-y-6">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Xin chào,{' '}
                  <span className="font-medium text-foreground">
                    {user.fullName || user.username}
                  </span>
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-red-500 font-medium text-sm flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-lg font-bold flex items-center gap-2">
                <LogIn className="w-5 h-5" /> Đăng nhập
              </Link>
            )}
            <Link href="/" className="text-xl font-bold">
              Trang chủ
            </Link>
            <Link href="/orders" className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5" /> Đơn hàng của tôi
            </Link>
            <Link href="/cart" className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5" /> Giỏ hàng ({itemCount()})
            </Link>
            <Link
              href="/checkout"
              className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg"
            >
              <CreditCard className="w-5 h-5" /> Thanh toán ({formatCurrency(total())})
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
