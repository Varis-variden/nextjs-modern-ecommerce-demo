'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';

export function Footer() {
  const { lang, setLang, t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <h2 className="font-heading text-2xl tracking-[0.3em] text-white mb-4">
              SIRIN
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              {t.footer.aboutText}
            </p>

            {/* Social icons */}
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="text-stone-500 hover:text-amber-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-stone-500 hover:text-amber-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-stone-500 hover:text-amber-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-stone-200 font-semibold mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {t.nav.products}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=face"
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {t.nav.face}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=body"
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {t.nav.body}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=hair"
                  className="text-sm text-stone-400 hover:text-white transition-colors"
                >
                  {t.nav.hair}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-stone-200 font-semibold mb-4">
              {t.footer.customerService}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">
                  {t.footer.contactUs}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">
                  {t.footer.faq}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">
                  {t.footer.returnPolicy}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">
                  {t.footer.privacyPolicy}
                </a>
              </li>
            </ul>
          </div>

          {/* Language & contact */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-stone-200 font-semibold mb-4">
              {t.footer.contactUs}
            </h3>
            <p className="text-sm text-stone-400 mb-1">
              {t.footer.email}: hello@varidentech.com
            </p>
            <p className="text-sm text-stone-400 mb-6">
              Bangkok, Thailand
            </p>

            <button
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="text-xs tracking-widest uppercase border border-stone-600 rounded-full px-4 py-1.5 text-stone-400 hover:text-white hover:border-stone-400 transition-colors"
            >
              {lang === 'th' ? 'English' : 'ภาษาไทย'}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            {t.footer.copyright.replace('{year}', String(year))}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
              {t.footer.privacyPolicy}
            </a>
            <a href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
              {t.footer.termsOfService}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
