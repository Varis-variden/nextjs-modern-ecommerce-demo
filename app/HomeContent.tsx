'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Product, Promotion } from '@/types';

const categoryImages: Record<string, string> = {
  face: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=500&fit=crop',
  body: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=500&fit=crop',
  hair: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=500&fit=crop',
  home: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400&h=500&fit=crop',
};

const promoColors = [
  { border: 'border-rose-200', bg: 'bg-rose-50', accent: 'text-rose-600' },
  { border: 'border-amber-200', bg: 'bg-amber-50', accent: 'text-amber-600' },
  { border: 'border-emerald-200', bg: 'bg-emerald-50', accent: 'text-emerald-600' },
  { border: 'border-blue-200', bg: 'bg-blue-50', accent: 'text-blue-600' },
];

interface HomeContentProps {
  bestSellers: Product[];
  promotions: Promotion[];
  bundleProduct: Product | null;
}

export default function HomeContent({ bestSellers, promotions, bundleProduct }: HomeContentProps) {
  const { lang, t } = useLanguage();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categories = [
    { key: 'face', label: t.categories.face },
    { key: 'body', label: t.categories.body },
    { key: 'hair', label: t.categories.hair },
    { key: 'home', label: t.categories.home },
  ];

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: text */}
            <div className="lg:col-span-5 space-y-6 animate-fade-up">
              <p className="text-xs tracking-[0.3em] uppercase text-amber-600 font-medium">
                {t.hero.tagline}
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-stone-900 leading-[1.1] whitespace-pre-line">
                {t.hero.headline}
              </h2>
              <p className="text-stone-500 leading-relaxed max-w-md">
                {t.hero.subtext}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase font-medium px-7 py-3.5 rounded-sm hover:bg-stone-800 transition-colors"
                >
                  {t.hero.ctaPrimary}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products?tag=new"
                  className="inline-flex items-center gap-2 border border-stone-300 text-stone-700 text-xs tracking-widest uppercase font-medium px-7 py-3.5 rounded-sm hover:border-stone-500 hover:text-stone-900 transition-colors"
                >
                  {t.hero.ctaSecondary}
                </Link>
              </div>
            </div>

            {/* Right: lifestyle image */}
            <div className="lg:col-span-7 relative">
              <div className="relative aspect-[4/3] lg:aspect-[16/11] rounded-sm overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&h=800&fit=crop"
                  alt="SIRIN Skincare"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 60vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-100/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Promo Banner ─── */}
      {promotions.length > 0 && (
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-stone-900 mb-2">
                  {t.promoBanner.title}
                </h2>
                <p className="text-stone-500 text-sm">{t.promoBanner.subtitle}</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {promotions.map((promo, i) => {
                const color = promoColors[i % promoColors.length];
                return (
                  <ScrollReveal key={promo._id} delay={i * 100}>
                    <div
                      className={`border ${color.border} ${color.bg} rounded-sm p-5 h-full flex flex-col`}
                    >
                      <div className={`text-[10px] tracking-widest uppercase font-semibold ${color.accent} mb-2`}>
                        {promo.type.replace('_', ' ')}
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-stone-800 mb-1.5">
                        {promo.name[lang]}
                      </h3>
                      <p className="text-xs text-stone-500 flex-1 leading-relaxed">
                        {promo.description[lang]}
                      </p>
                      <Link
                        href="/products"
                        className={`text-xs tracking-wider uppercase font-medium ${color.accent} mt-3 inline-flex items-center gap-1 hover:underline underline-offset-2`}
                      >
                        {t.promoBanner.shopNow}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Bestsellers ─── */}
      {bestSellers.length > 0 && (
        <section className="py-14 lg:py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs tracking-[0.3em] uppercase text-amber-600 font-medium mb-1">
                    {t.product.bestSeller}
                  </p>
                  <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-stone-900">
                    {lang === 'th' ? 'สินค้าขายดี' : 'Best Sellers'}
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="text-xs tracking-widest uppercase font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
                >
                  {t.misc.seeAll}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {bestSellers.map((product, i) => (
                <ScrollReveal key={product._id} delay={i * 100}>
                  <ProductCard
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Bundle Feature ─── */}
      {bundleProduct && (
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center bg-stone-50 rounded-sm overflow-hidden">
                {/* Image */}
                <div className="relative aspect-square lg:aspect-auto lg:h-full min-h-[360px]">
                  <Image
                    src={bundleProduct.images[0]}
                    alt={bundleProduct.name[lang]}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized
                  />
                </div>

                {/* Details */}
                <div className="p-6 lg:p-10 lg:pr-14">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs tracking-[0.3em] uppercase text-amber-600 font-medium">
                      {t.promo.bundle}
                    </span>
                  </div>
                  <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-stone-900 mb-3">
                    {bundleProduct.name[lang]}
                  </h2>
                  <p className="text-sm text-stone-500 leading-relaxed mb-6 max-w-md">
                    {bundleProduct.description[lang]}
                  </p>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="font-heading text-3xl font-semibold text-stone-900 price-highlight">
                      ฿{bundleProduct.price.toLocaleString()}
                    </span>
                    {bundleProduct.originalPrice && (
                      <span className="text-lg text-stone-400 line-through price-highlight">
                        ฿{bundleProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Savings callout */}
                  {bundleProduct.originalPrice && (
                    <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-sm px-4 py-2 mb-6">
                      <span className="text-sm font-medium text-emerald-700">
                        {t.bundle.savingsLabel}: ฿{(bundleProduct.originalPrice - bundleProduct.price).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Link
                    href={`/products/${bundleProduct.slug}`}
                    className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase font-medium px-7 py-3.5 rounded-sm hover:bg-stone-800 transition-colors"
                  >
                    {t.product.viewDetails}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ─── Category Browse ─── */}
      <section className="py-14 lg:py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-stone-900">
                {t.nav.allCategories}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((cat, i) => (
              <ScrollReveal key={cat.key} delay={i * 100}>
                <Link
                  href={`/products?category=${cat.key}`}
                  className="group relative aspect-[3/4] rounded-sm overflow-hidden block"
                >
                  <Image
                    src={categoryImages[cat.key]}
                    alt={cat.label}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                    <h3 className="font-heading text-xl lg:text-2xl font-semibold text-white">
                      {cat.label}
                    </h3>
                    <span className="text-xs tracking-widest uppercase text-white/80 font-medium flex items-center gap-1 mt-1 group-hover:text-amber-300 transition-colors">
                      {t.promoBanner.shopNow}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Quick View Modal ─── */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
