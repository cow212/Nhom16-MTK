import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { CartPersistGate } from '@/components/CartProvider';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Mini E-commerce',
  description: 'Ứng dụng mua sắm trực tuyến mẫu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          <Navbar />
          <CartPersistGate />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
