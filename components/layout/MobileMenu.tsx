'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useLanguage();

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/products', label: t.nav.products },
    { href: '/promotions', label: t.nav.promotions },
    { href: '/products?category=face', label: t.nav.face },
    { href: '/products?category=body', label: t.nav.body },
    { href: '/products?category=hair', label: t.nav.hair },
    { href: '/products?category=home', label: t.nav.homeCategory },
    { href: '/products?category=sets', label: t.nav.sets },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <span className="font-heading text-xl tracking-[0.3em] font-semibold text-stone-900">
            SIRIN
          </span>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-5 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block py-3 px-2 text-sm tracking-wide text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
