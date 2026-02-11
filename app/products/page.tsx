'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Product } from '@/types';

const CATEGORIES = ['all', 'face', 'body', 'hair', 'home', 'sets'] as const;

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-stone-200 aspect-[3/4] rounded-sm" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (<ProductSkeleton key={i} />))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.data || data);
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  // Sync category from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.th.toLowerCase().includes(q) ||
          p.name.en.toLowerCase().includes(q)
      );
    }

    // Hide gift-only products (price = 0)
    result = result.filter((p) => p.price > 0);

    return result;
  }, [products, activeCategory, searchQuery]);

  const categoryLabels: Record<string, string> = {
    all: t.categories.all,
    face: t.categories.face,
    body: t.categories.body,
    hair: t.categories.hair,
    home: t.categories.home,
    sets: t.categories.sets,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Page header */}
      <ScrollReveal>
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-amber-600 font-medium mb-1">
            SIRIN
          </p>
          <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-stone-900">
            {t.nav.products}
          </h1>
        </div>
      </ScrollReveal>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs tracking-widest uppercase font-medium px-4 py-2 rounded-sm border transition-all ${
                activeCategory === cat
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={t.misc.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 border border-stone-200 rounded-sm pl-9 pr-3 py-2 text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Product grid */}
      {!isLoaded ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400">{t.misc.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredProducts.map((product, i) => (
            <ScrollReveal key={product._id} delay={i * 60}>
              <ProductCard
                product={product}
                onQuickView={setQuickViewProduct}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
