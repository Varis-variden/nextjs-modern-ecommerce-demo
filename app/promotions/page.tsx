'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Gift,
  Copy,
  Check,
  Sparkles,
  Tag,
  Plus,
  ShoppingBag,
  Percent,
  CreditCard,
  Ticket,
} from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Promotion } from '@/types';

// Populated product from the API (subset of fields)
interface PopulatedProduct {
  _id: string;
  name: { th: string; en: string };
  images: string[];
  slug: string;
  price: number;
}

// Extend Promotion to carry populated refs
interface PopulatedPromotion extends Omit<Promotion, 'conditions' | 'rewards'> {
  conditions: Omit<Promotion['conditions'], 'productIds'> & {
    productIds?: (string | PopulatedProduct)[];
  };
  rewards: Omit<Promotion['rewards'], 'freeProductId' | 'bundleProductIds'> & {
    freeProductId?: string | PopulatedProduct;
    bundleProductIds?: (string | PopulatedProduct)[];
  };
}

// Demo coupons (matching seed data)
const demoCoupons = [
  {
    code: 'WELCOME10',
    description: {
      th: 'ส่วนลด 10% สำหรับลูกค้าใหม่ (สูงสุด ฿500)',
      en: '10% off for new customers (max ฿500)',
    },
    minOrder: 1000,
    icon: Percent,
  },
  {
    code: 'FREESHIP',
    description: {
      th: 'จัดส่งฟรี เมื่อสั่งซื้อขั้นต่ำ ฿800',
      en: 'Free shipping on orders over ฿800',
    },
    minOrder: 800,
    icon: ShoppingBag,
  },
  {
    code: 'BEAUTY200',
    description: {
      th: 'ลด ฿200 เมื่อช้อปครบ ฿2,000',
      en: '฿200 off on orders over ฿2,000',
    },
    minOrder: 2000,
    icon: Tag,
  },
];

function isPopulatedProduct(val: unknown): val is PopulatedProduct {
  return typeof val === 'object' && val !== null && 'slug' in val;
}

export default function PromotionsPage() {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [promotions, setPromotions] = useState<PopulatedPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bundleAdding, setBundleAdding] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);

  useEffect(() => {
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((data) => setPromotions(data.data || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyCode = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      addToast(t.promotions.copiedCode, 'success');
      setTimeout(() => setCopiedCode(null), 2000);
    },
    [addToast, t]
  );

  const handleAddBundle = useCallback(
    async (products: PopulatedProduct[]) => {
      setBundleAdding(true);
      try {
        for (const p of products) {
          await addItem(p._id, '', 1);
        }
        setBundleAdded(true);
        setTimeout(() => setBundleAdded(false), 2000);
      } finally {
        setBundleAdding(false);
      }
    },
    [addItem]
  );

  // Group promotions by type
  const bundles = promotions.filter((p) => p.type === 'bundle');
  const bogos = promotions.filter((p) => p.type === 'bogo');
  const gwps = promotions.filter((p) => p.type === 'gwp');
  const tiers = promotions.filter((p) => p.type === 'tier_discount');
  const cashbacks = promotions.filter((p) => p.type === 'cashback');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-stone-400 text-sm tracking-widest uppercase">
          {t.misc.loading}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ─── Hero Banner ─── */}
      <section className="relative bg-stone-100 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs tracking-[0.2em] uppercase text-amber-700 font-medium">
                {lang === 'th' ? 'ข้อเสนอพิเศษ' : 'Special Offers'}
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-stone-900 mb-4">
              {t.promotions.pageTitle}
            </h1>
            <p className="text-stone-500 leading-relaxed max-w-lg mx-auto">
              {t.promotions.pageSubtitle}
            </p>
          </div>
        </div>
      </section>

      {promotions.length === 0 && !loading && (
        <section className="py-20 text-center">
          <p className="text-stone-400">{t.promotions.noPromotions}</p>
        </section>
      )}

      {/* ─── Bundle Section ─── */}
      {bundles.length > 0 && (
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                icon={<Gift className="w-5 h-5 text-amber-600" />}
                title={t.promotions.bundleSection}
                accent="amber"
              />
            </ScrollReveal>

            {bundles.map((promo) => {
              const bundleProducts = (promo.rewards.bundleProductIds || []).filter(
                isPopulatedProduct
              );
              const totalValue = bundleProducts.reduce((sum, p) => sum + p.price, 0);
              const bundlePrice = promo.rewards.bundlePrice || 0;
              const savings = totalValue - bundlePrice;

              return (
                <ScrollReveal key={promo._id}>
                  <div className="bg-stone-50 rounded-sm overflow-hidden border border-stone-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                      {/* Product images grid */}
                      <div className="p-6 lg:p-8">
                        <div className="grid grid-cols-3 gap-3">
                          {bundleProducts.map((product) => (
                            <Link
                              key={product._id}
                              href={`/products/${product.slug}`}
                              className="group"
                            >
                              <div className="relative aspect-square rounded-sm overflow-hidden bg-stone-100">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name[lang]}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  sizes="(max-width: 768px) 30vw, 15vw"
                                  unoptimized
                                />
                              </div>
                              <p className="text-xs text-stone-600 mt-2 line-clamp-1">
                                {product.name[lang]}
                              </p>
                              <p className="text-xs text-stone-400">
                                ฿{product.price.toLocaleString()}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-6 lg:p-8 flex flex-col justify-center">
                        <h3 className="font-heading text-2xl lg:text-3xl font-semibold text-stone-900 mb-2">
                          {promo.name[lang]}
                        </h3>
                        <p className="text-sm text-stone-500 leading-relaxed mb-6">
                          {promo.description[lang]}
                        </p>

                        {/* Pricing breakdown */}
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-500">{t.promotions.totalValue}</span>
                            <span className="text-stone-400 line-through">
                              ฿{totalValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-stone-700">{t.promotions.youPay}</span>
                            <span className="font-heading text-xl text-stone-900">
                              ฿{bundlePrice.toLocaleString()}
                            </span>
                          </div>
                          {savings > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-600 font-medium">
                                {t.promotions.youSave}
                              </span>
                              <span className="text-emerald-600 font-semibold">
                                ฿{savings.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {promo.stockAllocation && (
                          <p className="text-xs text-amber-600 mb-4 font-medium">
                            {t.promotions.setsAvailable.replace(
                              '{count}',
                              String(promo.stockAllocation - promo.usageCount)
                            )}
                          </p>
                        )}

                        <button
                          onClick={() => handleAddBundle(bundleProducts)}
                          disabled={bundleAdding || bundleAdded}
                          className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase font-medium px-7 py-3.5 rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-60 w-full sm:w-auto"
                        >
                          {bundleAdded ? (
                            <>
                              <Check className="w-4 h-4" />
                              {t.promotions.added}
                            </>
                          ) : bundleAdding ? (
                            t.promotions.adding
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              {t.promotions.addBundleToCart}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── BOGO Section ─── */}
      {bogos.length > 0 && (
        <section className="py-14 lg:py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                icon={<Tag className="w-5 h-5 text-rose-500" />}
                title={t.promotions.bogoSection}
                accent="rose"
              />
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bogos.map((promo, i) => {
                const products = (promo.conditions.productIds || []).filter(
                  isPopulatedProduct
                );
                const product = products[0];

                return (
                  <ScrollReveal key={promo._id} delay={i * 100}>
                    <div className="bg-white rounded-sm border border-stone-100 overflow-hidden group">
                      {product && (
                        <Link href={`/products/${product.slug}`}>
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                              src={product.images[0]}
                              alt={product.name[lang]}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              unoptimized
                            />
                            <div className="absolute top-3 left-3">
                              <span className="bg-rose-500 text-white text-[10px] tracking-widest uppercase font-bold px-3 py-1.5 rounded-sm">
                                {t.promo.bogo}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )}
                      <div className="p-5">
                        <h3 className="font-heading text-lg font-semibold text-stone-900 mb-1">
                          {promo.name[lang]}
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed mb-4">
                          {promo.description[lang]}
                        </p>
                        {product && (
                          <Link
                            href={`/products/${product.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium text-rose-600 hover:text-rose-700 transition-colors"
                          >
                            {t.promotions.viewProduct}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── GWP Section ─── */}
      {gwps.length > 0 && (
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                icon={<Gift className="w-5 h-5 text-purple-500" />}
                title={t.promotions.gwpSection}
                accent="purple"
              />
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gwps.map((promo, i) => {
                const conditionProducts = (promo.conditions.productIds || []).filter(
                  isPopulatedProduct
                );
                const giftProduct = isPopulatedProduct(promo.rewards.freeProductId)
                  ? promo.rewards.freeProductId
                  : null;
                const isCategory = (promo.conditions.categoryIds || []).length > 0;
                const categoryId = promo.conditions.categoryIds?.[0];

                return (
                  <ScrollReveal key={promo._id} delay={i * 100}>
                    <div className="bg-stone-50 rounded-sm border border-stone-100 p-6 flex flex-col sm:flex-row items-center gap-5">
                      {/* Qualifying side */}
                      <div className="flex-1 text-center sm:text-left">
                        {conditionProducts[0] && (
                          <div className="relative w-24 h-24 mx-auto sm:mx-0 rounded-sm overflow-hidden mb-3">
                            <Image
                              src={conditionProducts[0].images[0]}
                              alt={conditionProducts[0].name[lang]}
                              fill
                              className="object-cover"
                              sizes="96px"
                              unoptimized
                            />
                          </div>
                        )}
                        {isCategory && !conditionProducts[0] && (
                          <div className="w-24 h-24 mx-auto sm:mx-0 rounded-sm bg-purple-50 border border-purple-100 flex items-center justify-center mb-3">
                            <span className="text-xs tracking-widest uppercase text-purple-600 font-medium text-center px-2">
                              {lang === 'th' ? 'หมวด' : 'Category'}
                              <br />
                              {categoryId && t.categories[categoryId as keyof typeof t.categories]}
                            </span>
                          </div>
                        )}
                        <h3 className="font-heading text-lg font-semibold text-stone-900 mb-1">
                          {promo.name[lang]}
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {promo.description[lang]}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>

                      {/* Gift side */}
                      {giftProduct && (
                        <div className="text-center shrink-0">
                          <div className="relative w-24 h-24 mx-auto rounded-sm overflow-hidden mb-2 ring-2 ring-purple-200 ring-offset-2">
                            <Image
                              src={giftProduct.images[0]}
                              alt={giftProduct.name[lang]}
                              fill
                              className="object-cover"
                              sizes="96px"
                              unoptimized
                            />
                          </div>
                          <span className="inline-block bg-purple-100 text-purple-700 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-sm">
                            {t.promo.freeGift}
                          </span>
                          <p className="text-xs text-stone-600 mt-1 max-w-[120px]">
                            {giftProduct.name[lang]}
                          </p>
                        </div>
                      )}

                      {/* CTA at bottom for mobile */}
                      <div className="sm:hidden w-full pt-2">
                        {conditionProducts[0] ? (
                          <Link
                            href={`/products/${conditionProducts[0].slug}`}
                            className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium text-purple-600 hover:text-purple-700"
                          >
                            {t.promotions.viewProduct}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : categoryId ? (
                          <Link
                            href={`/products?category=${categoryId}`}
                            className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium text-purple-600 hover:text-purple-700"
                          >
                            {t.promotions.shopCategory}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    {/* CTA for desktop — placed outside the card for cleaner layout */}
                    <div className="hidden sm:block mt-3 ml-1">
                      {conditionProducts[0] ? (
                        <Link
                          href={`/products/${conditionProducts[0].slug}`}
                          className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium text-purple-600 hover:text-purple-700"
                        >
                          {t.promotions.viewProduct}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : categoryId ? (
                        <Link
                          href={`/products?category=${categoryId}`}
                          className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium text-purple-600 hover:text-purple-700"
                        >
                          {t.promotions.shopCategory}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Tier Discount Section ─── */}
      {tiers.length > 0 && (
        <section className="py-14 lg:py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                icon={<Percent className="w-5 h-5 text-blue-500" />}
                title={t.promotions.tierSection}
                accent="blue"
              />
            </ScrollReveal>

            {tiers.map((promo) => {
              const tierList = promo.conditions.tiers || [];

              return (
                <ScrollReveal key={promo._id}>
                  <div className="bg-white rounded-sm border border-stone-100 p-6 lg:p-8">
                    <h3 className="font-heading text-xl font-semibold text-stone-900 mb-2">
                      {promo.name[lang]}
                    </h3>
                    <p className="text-sm text-stone-500 mb-8">
                      {promo.description[lang]}
                    </p>

                    {/* Tier steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {tierList.map((tier, i) => (
                        <div
                          key={i}
                          className="relative bg-gradient-to-br from-blue-50 to-stone-50 border border-blue-100 rounded-sm p-5 text-center"
                        >
                          <div className="text-[10px] tracking-widest uppercase text-blue-500 font-semibold mb-2">
                            {lang === 'th' ? `ระดับ ${i + 1}` : `Tier ${i + 1}`}
                          </div>
                          <div className="font-heading text-2xl font-bold text-stone-900 mb-1">
                            {tier.discountPercent}%
                            <span className="text-sm font-normal text-stone-500 ml-1">
                              {lang === 'th' ? 'ส่วนลด' : 'off'}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500">
                            {t.promotions.spend} ฿{tier.threshold.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase font-medium px-7 py-3.5 rounded-sm hover:bg-stone-800 transition-colors"
                      >
                        {t.promotions.startShopping}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Cashback Section ─── */}
      {cashbacks.length > 0 && (
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SectionHeader
                icon={<CreditCard className="w-5 h-5 text-emerald-500" />}
                title={t.promotions.cashbackSection}
                accent="emerald"
              />
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cashbacks.map((promo, i) => (
                <ScrollReveal key={promo._id} delay={i * 100}>
                  <div className="bg-gradient-to-br from-emerald-50 to-stone-50 rounded-sm border border-emerald-100 p-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-stone-900 mb-1">
                      {promo.name[lang]}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed mb-4">
                      {promo.description[lang]}
                    </p>

                    {promo.rewards.cashbackPercent && (
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="font-heading text-3xl font-bold text-emerald-600">
                          {promo.rewards.cashbackPercent}%
                        </span>
                        <span className="text-sm text-stone-500">
                          {lang === 'th' ? 'เครดิตคืน' : 'cashback'}
                        </span>
                      </div>
                    )}

                    {promo.conditions.minSpend && (
                      <p className="text-xs text-stone-400 mb-5">
                        {t.promotions.onOrdersOver} ฿{promo.conditions.minSpend.toLocaleString()}
                      </p>
                    )}

                    <Link
                      href="/products"
                      className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      {t.promotions.startShopping}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Coupon Codes Section ─── */}
      <section className="py-14 lg:py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              icon={<Ticket className="w-5 h-5 text-amber-600" />}
              title={t.promotions.couponSection}
              accent="amber"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {demoCoupons.map((coupon, i) => {
              const Icon = coupon.icon;
              const isCopied = copiedCode === coupon.code;

              return (
                <ScrollReveal key={coupon.code} delay={i * 100}>
                  <div className="bg-white rounded-sm border border-stone-100 p-5 relative overflow-hidden">
                    {/* Decorative dashes on left */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />

                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-600 leading-relaxed">
                          {coupon.description[lang]}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1">
                          {t.promotions.minOrder} ฿{coupon.minOrder.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-stone-50 border border-dashed border-stone-200 rounded px-3 py-2 text-sm font-mono font-semibold text-stone-700 tracking-wider text-center">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {t.promotions.copiedCode}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            {t.promotions.copyCode}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Section Header Component ───────────────────────────────────────
function SectionHeader({
  icon,
  title,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div
        className={`w-10 h-10 rounded-full bg-${accent}-50 flex items-center justify-center`}
      >
        {icon}
      </div>
      <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-stone-900">
        {title}
      </h2>
    </div>
  );
}
