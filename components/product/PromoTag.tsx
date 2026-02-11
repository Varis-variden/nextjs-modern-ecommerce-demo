'use client';

import { useLanguage } from '@/components/i18n/LanguageContext';

interface PromoTagProps {
  type: 'bogo' | 'gwp' | 'bundle' | 'bestSeller' | 'new' | 'limited' | 'sale';
}

const tagStyles: Record<string, string> = {
  bogo: 'bg-rose-500 text-white',
  gwp: 'bg-emerald-600 text-white',
  bundle: 'bg-amber-500 text-white',
  bestSeller: 'bg-stone-900 text-white',
  new: 'bg-blue-600 text-white',
  limited: 'bg-amber-600 text-white',
  sale: 'bg-rose-500 text-white',
};

export function PromoTag({ type }: PromoTagProps) {
  const { t } = useLanguage();

  const labels: Record<string, string> = {
    bogo: t.promo.bogo,
    gwp: t.promo.gwp,
    bundle: t.promo.bundle,
    bestSeller: t.product.bestSeller,
    new: t.product.new,
    limited: t.product.limited,
    sale: t.product.sale,
  };

  return (
    <span
      className={`inline-block text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-sm ${tagStyles[type] || 'bg-stone-800 text-white'}`}
    >
      {labels[type] || type}
    </span>
  );
}
