'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useCart } from '@/components/cart/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const { lang, setLang, t } = useLanguage();
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-stone-100'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/products"
                className="text-xs tracking-[0.2em] uppercase text-stone-600 hover:text-stone-900 font-medium"
              >
                {t.nav.products}
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-stone-700 hover:text-stone-900 p-1"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Center brand */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[0.3em] text-stone-900">
                SIRIN
              </h1>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                className="text-xs tracking-widest uppercase font-medium text-stone-500 hover:text-stone-900 border border-stone-200 rounded-full px-3 py-1 hover:border-stone-400 transition-colors"
              >
                {t.misc.languageToggle}
              </button>

              <button
                onClick={openCart}
                className="relative text-stone-700 hover:text-stone-900 p-1"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full animate-pulse-once">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartDrawer />
    </>
  );
}
