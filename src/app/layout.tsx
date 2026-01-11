import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ReduxProvider from '../redux/ReduxProvider';
import Footer from '@/components/Footer';
import NavbarClient from '@/components/NavbarClient';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KKPhim - Xem phim Online HD',
  description: 'Trang xem phim Online với giao diện thân thiện và tốc độ cao.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 min-h-screen flex flex-col`}>
        <ReduxProvider>
          <NavbarClient />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
