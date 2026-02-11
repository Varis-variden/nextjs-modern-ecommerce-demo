'use client';

import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useToast } from '@/components/ui/Toast';
import type { BilingualText } from '@/types';

interface CouponInputProps {
  couponCode: string | null;
  onApply: (code: string) => Promise<void>;
  onRemove: () => Promise<void>;
  isLoading: boolean;
  couponError: BilingualText | null;
}

export function CouponInput({ couponCode, onApply, onRemove, isLoading, couponError }: CouponInputProps) {
  const { lang, t } = useLanguage();
  const { addToast } = useToast();
  const [code, setCode] = useState('');

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    await onApply(trimmed);
    addToast(t.couponMsg.appliedSuccess, 'success');
    setCode('');
  };

  const handleRemove = async () => {
    await onRemove();
    addToast(t.couponMsg.removed, 'info');
  };

  if (couponCode) {
    return (
      <div>
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-sm px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">{couponCode}</span>
          </div>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="text-amber-400 hover:text-amber-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {couponError && (
          <p className="text-xs text-rose-500 mt-1.5">{couponError[lang]}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs tracking-widest uppercase text-stone-500 font-medium mb-2 block">
        {t.cart.coupon}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t.couponMsg.placeholder}
          className="flex-1 border border-stone-200 rounded-sm px-3 py-2 text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="bg-stone-900 text-white text-xs tracking-widest uppercase font-medium px-4 py-2 rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-40"
        >
          {t.cart.apply}
        </button>
      </div>
      {couponError && (
        <p className="text-xs text-rose-500 mt-1.5">{couponError[lang]}</p>
      )}
    </div>
  );
}
