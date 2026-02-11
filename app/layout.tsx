import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import { CartProvider } from '@/components/cart/CartContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SIRIN — Premium Thai Skincare',
  description:
    'Luxury skincare inspired by Thai botanical heritage. Blending ancient wisdom with modern beauty science.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} antialiased bg-stone-50 text-stone-800`}
      >
        <LanguageProvider>
          <CartProvider>
            <ToastProvider>
              <AnnouncementBar />
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
