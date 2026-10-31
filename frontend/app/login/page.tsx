'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth, type AuthUser } from '@/components/AuthProvider';
import toast from 'react-hot-toast';
import { LogIn, UserPlus, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';

interface AuthApiResponse {
  token: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
  });

  const handleAuthResponse = (data: AuthApiResponse) => {
    const user: AuthUser = {
      userId: data.userId,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };
    signIn(user, data.token);
    toast.success(mode === 'login' ? 'Đăng nhập thành công!' : 'Tạo tài khoản thành công!');
    router.push('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<AuthApiResponse>('/api/auth/login', loginForm);
      handleAuthResponse(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại.');    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp.');
      return;
    }
    const { confirmPassword, ...payload } = registerForm;
    void confirmPassword;
    setSubmitting(true);
    try {
      const res = await api.post<AuthApiResponse>('/api/auth/register', payload);
      handleAuthResponse(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {mode === 'login'
            ? 'Chào mừng bạn quay trở lại Mini E-commerce.'
            : 'Chỉ vài giây là bạn có thể mua sắm ngay.'}
        </p>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tên đăng nhập / Email</label>
            <input
              className={inputClass}
              value={loginForm.usernameOrEmail}
              onChange={(e) => setLoginForm({ ...loginForm, usernameOrEmail: e.target.value })}
              placeholder="vd: khachngoc"
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Mật khẩu</label>
            <input
              type="password"
              className={inputClass}
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Đăng nhập
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-primary hover:underline font-medium"
            >
              Đăng ký ngay
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Họ và tên *</label>
            <input
              className={inputClass}
              value={registerForm.fullName}
              onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tên đăng nhập *</label>
            <input
              className={inputClass}
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              placeholder="vd: khachngoc"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              className={inputClass}
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Mật khẩu * (tối thiểu 6 ký tự)</label>
            <input
              type="password"
              className={inputClass}
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Nhập lại mật khẩu *</label>
            <input
              type="password"
              className={inputClass}
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Số điện thoại</label>
              <input
                type="tel"
                className={inputClass}
                value={registerForm.phoneNumber}
                onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                placeholder="0901234567"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Địa chỉ</label>
              <input
                className={inputClass}
                value={registerForm.address}
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                placeholder="Số nhà, đường..."
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Tạo tài khoản
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-primary hover:underline font-medium"
            >
              Đăng nhập
            </button>
          </p>
        </form>
      )}

      <div className="text-center mt-6">
        <Link href="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Link>
      </div>
    </div>
  );
}
