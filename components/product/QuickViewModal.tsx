'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import type { Product } from '@/types';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { lang, t } = useLanguage();
  const { addItem, isLoading } = useCart();
  const { addToast } = useToast();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [qty, setQty] = useState(1);

  const handleAdd = async () => {
    if (!selectedSize) {
      addToast(t.product.selectSize, 'error');
      return;
    }
    await addItem(product._id, selectedSize, qty);
    addToast(`${product.name[lang]} — ${t.product.addToCart}`, 'success');
    onClose();
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square bg-stone-100">
              <Image
                src={product.images[0]}
                alt={product.name[lang]}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                unoptimized
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 text-stone-500 hover:text-stone-900 transition-colors sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 hidden sm:block"
              >
                <X className="w-5 h-5" />
              </button>

              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">
                {product.category}
              </p>
              <h2 className="font-heading text-xl font-semibold text-stone-900 mb-3">
                {product.name[lang]}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 mb-5">
                <span className="text-xl font-semibold text-stone-900 price-highlight">
                  ฿{product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-stone-400 line-through price-highlight">
                    ฿{product.originalPrice!.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Sizes */}
              {product.sizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">
                    {t.product.size}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-xs px-3.5 py-2 rounded-sm border transition-all ${
                          selectedSize === size
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-200 text-stone-600 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">
                  {t.product.quantity}
                </p>
                <div className="inline-flex items-center border border-stone-200 rounded-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-stone-900 min-w-[2.5rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-2 text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                disabled={isLoading}
                className="w-full bg-stone-900 text-white text-xs tracking-widest uppercase font-medium py-3.5 rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? t.misc.loading : t.product.addToCart}
              </button>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs tracking-wide text-stone-500 hover:text-stone-800 mt-3 underline underline-offset-2"
              >
                {t.product.viewDetails}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
