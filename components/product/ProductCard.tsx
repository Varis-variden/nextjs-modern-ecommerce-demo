'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { PromoTag } from './PromoTag';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { lang, t } = useLanguage();

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="group relative">
      {/* Image container */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden bg-stone-100 aspect-[3/4] rounded-sm">
        <Image
          src={product.images[0]}
          alt={product.name[lang]}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          unoptimized
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

        {/* Quick view button */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 backdrop-blur-sm text-stone-800 text-xs tracking-widest uppercase font-medium px-5 py-2.5 rounded-sm hover:bg-stone-900 hover:text-white flex items-center gap-2"
          >
            <Eye className="w-3.5 h-3.5" />
            {t.product.quickView}
          </button>
        )}
      </Link>

      {/* Tags */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {product.tags.includes('bestSeller') && <PromoTag type="bestSeller" />}
        {product.tags.includes('new') && <PromoTag type="new" />}
        {product.tags.includes('limited') && <PromoTag type="limited" />}
        {hasDiscount && <PromoTag type="sale" />}
      </div>

      {/* Info */}
      <div className="mt-3.5 space-y-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-stone-800 leading-snug line-clamp-2 group-hover:text-stone-600 transition-colors">
            {product.name[lang]}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-900 price-highlight">
            ฿{product.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-stone-400 line-through price-highlight">
                ฿{product.originalPrice!.toLocaleString()}
              </span>
              <span className="text-xs text-rose-500 font-medium">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
