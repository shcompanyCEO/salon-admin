import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthListener } from '@/components/auth/AuthListener';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Salon Admin - 살롱 예약 관리 시스템',
  description: '헤어살롱을 위한 포괄적인 예약 및 관리 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <QueryProvider>
          <AuthListener />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
