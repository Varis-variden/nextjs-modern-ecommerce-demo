'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ArrowLeft, Check } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { ProductCard } from '@/components/product/ProductCard';
import { PromoTag } from '@/components/product/PromoTag';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const { addItem, isLoading } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients'>('description');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.data || data;
        setProduct(p);
        setSelectedSize(p.sizes?.[0] || '');
        setActiveImage(0);
        setLoading(false);

        // Fetch related products
        if (p.category) {
          fetch(`/api/products?category=${p.category}`)
            .then((r) => r.json())
            .then((d) => {
              const all = d.data || d;
              setRelated(all.filter((x: Product) => x._id !== p._id && x.price > 0).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      addToast(t.product.selectSize, 'error');
      return;
    }
    await addItem(product._id, selectedSize, qty);
    addToast(`${product.name[lang]} — ${t.product.addToCart}`, 'success');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-stone-200 aspect-square rounded-sm" />
          <div className="space-y-4 py-4">
            <div className="h-3 bg-stone-200 rounded w-1/4" />
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-1/3" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-stone-400">{t.misc.noResults}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.misc.back}
        </Link>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
      {/* Breadcrumb */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs tracking-wide text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t.nav.products}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        {/* ─── Image Gallery ─── */}
        <div>
          {/* Main image */}
          <div className="relative aspect-square bg-stone-100 rounded-sm overflow-hidden mb-3">
            <Image
              src={product.images[activeImage]}
              alt={product.name[lang]}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
            {/* Tags overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.tags.includes('bestSeller') && <PromoTag type="bestSeller" />}
              {product.tags.includes('new') && <PromoTag type="new" />}
              {product.tags.includes('limited') && <PromoTag type="limited" />}
              {hasDiscount && <PromoTag type="sale" />}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-stone-900' : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Product Details ─── */}
        <div className="py-2">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-2">
            {product.category}
          </p>
          <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-stone-900 mb-4">
            {product.name[lang]}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-heading text-2xl lg:text-3xl font-semibold text-stone-900 price-highlight">
              ฿{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-stone-400 line-through price-highlight">
                  ฿{product.originalPrice!.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-sm">
                  -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">{t.product.inStock}</span>
          </div>

          {/* Size pills */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-stone-500 font-medium mb-2.5">
                {t.product.size}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`text-sm px-5 py-2.5 rounded-sm border transition-all ${
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
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase text-stone-500 font-medium mb-2.5">
              {t.product.quantity}
            </p>
            <div className="inline-flex items-center border border-stone-200 rounded-sm">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-900 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-5 py-2.5 text-sm font-medium text-stone-900 min-w-[3rem] text-center border-x border-stone-200">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full sm:w-auto bg-stone-900 text-white text-xs tracking-widest uppercase font-medium px-12 py-4 rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? t.misc.loading : t.product.addToCart}
          </button>

          {/* Tabs: Description / Ingredients */}
          <div className="mt-10 border-t border-stone-200 pt-8">
            <div className="flex gap-6 mb-5">
              <button
                onClick={() => setActiveTab('description')}
                className={`text-xs tracking-widest uppercase font-medium pb-2 border-b-2 transition-all ${
                  activeTab === 'description'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {t.product.description}
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`text-xs tracking-widest uppercase font-medium pb-2 border-b-2 transition-all ${
                  activeTab === 'ingredients'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {t.product.ingredients}
              </button>
            </div>

            <div className="text-sm text-stone-600 leading-relaxed">
              {activeTab === 'description'
                ? product.description[lang]
                : product.ingredients[lang]}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Related Products ─── */}
      {related.length > 0 && (
        <section className="mt-16 lg:mt-24 pt-12 border-t border-stone-200">
          <ScrollReveal>
            <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-stone-900 mb-8">
              {t.product.youMayAlsoLike}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p, i) => (
              <ScrollReveal key={p._id} delay={i * 100}>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
