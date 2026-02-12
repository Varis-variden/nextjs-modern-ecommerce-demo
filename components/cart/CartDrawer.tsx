'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Minus, Plus, Trash2, ShoppingBag, Gift, Truck } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useCart } from '@/components/cart/CartContext';

export function CartDrawer() {
  const { lang, t } = useLanguage();
  const {
    items,
    promoResult,
    isCartOpen,
    isLoading,
    closeCart,
    removeItem,
    updateQty,
    clearCart,
  } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  const subtotal = promoResult?.subtotal ?? items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.qty, 0);
  const totalDiscount = promoResult?.totalDiscount ?? 0;
  const total = promoResult?.total ?? subtotal;
  const freeGifts = promoResult?.freeGifts ?? [];
  const appliedPromotions = promoResult?.appliedPromotions ?? [];

  const FREE_SHIPPING_THRESHOLD = 2000;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 cart-overlay animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-700" />
            <h2 className="font-heading text-lg font-semibold text-stone-900">
              {t.cart.title}
            </h2>
            <span className="text-xs text-stone-400 ml-1">
              ({t.cart.itemsCount.replace('{count}', String(items.length))})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="text-stone-400 hover:text-stone-700 p-1"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <ShoppingBag className="w-12 h-12 text-stone-200" />
            <p className="text-stone-400 text-sm">{t.cart.emptyCart}</p>
            <Link
              href="/products"
              onClick={closeCart}
              className="text-xs tracking-widest uppercase font-medium bg-stone-900 text-white px-6 py-3 rounded-sm hover:bg-stone-800 transition-colors"
            >
              {t.cart.continueShopping}
            </Link>
          </div>
        ) : (
          <>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Shipping progress bar */}
              <div className="px-5 py-4 bg-stone-50 border-b border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-stone-500" />
                  <span className="text-xs text-stone-600">
                    {amountToFreeShipping > 0
                      ? t.shipping.spendMoreForFree.replace('{amount}', amountToFreeShipping.toLocaleString())
                      : t.shipping.freeShipping}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${shippingProgress}%`,
                      backgroundColor: shippingProgress >= 100 ? '#059669' : '#d97706',
                    }}
                  />
                </div>
              </div>

              {/* Cart items */}
              <div className="divide-y divide-stone-50">
                {items.map((item) => {
                  const product = item.productId;
                  if (!product) return null;

                  const itemPromos = appliedPromotions.filter(
                    (p) => p.affectedItems.includes(product._id)
                  );

                  return (
                    <div key={item._id} className="px-5 py-4 flex gap-3">
                      {/* Thumbnail */}
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeCart}
                        className="relative w-16 h-20 flex-shrink-0 bg-stone-100 rounded-sm overflow-hidden"
                      >
                        <Image
                          src={product.images?.[0] || ''}
                          alt={product.name?.[lang] || ''}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-stone-800 line-clamp-1 hover:text-stone-600 transition-colors"
                        >
                          {product.name?.[lang]}
                        </Link>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {t.product.size}: {item.size}
                        </p>

                        {/* Promo tags on item */}
                        {itemPromos.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {itemPromos.map((p, idx) => (
                              <span
                                key={`${p.promoId}-${idx}`}
                                className="text-[9px] tracking-wider uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm"
                              >
                                {p.label[lang]}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Qty + price row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="inline-flex items-center border border-stone-200 rounded-sm">
                            <button
                              onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}
                              className="px-2 py-1 text-stone-400 hover:text-stone-700"
                              disabled={isLoading}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 py-1 text-xs font-medium text-stone-800 min-w-[1.5rem] text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item._id, item.qty + 1)}
                              className="px-2 py-1 text-stone-400 hover:text-stone-700"
                              disabled={isLoading}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-800 price-highlight">
                              ฿{((product.price || 0) * item.qty).toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-stone-300 hover:text-rose-500 transition-colors p-0.5"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Free gifts */}
              {freeGifts.length > 0 && (
                <div className="px-5 py-4 bg-emerald-50/50 border-t border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs tracking-widest uppercase font-semibold text-emerald-700">
                      {t.cart.freeGifts}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {freeGifts.map((gift, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-white rounded-sm overflow-hidden flex-shrink-0 border border-emerald-100">
                          <Image
                            src={gift.image}
                            alt={gift.name[lang]}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-700 line-clamp-1">
                            {gift.name[lang]} x{gift.qty}
                          </p>
                          <p className="text-[10px] text-emerald-600">
                            {gift.reason[lang]}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-emerald-600">
                          {t.promo.freeGift}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer — simple subtotal + total */}
            <div className="border-t border-stone-200 bg-stone-50 px-5 py-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">{t.cart.subtotal}</span>
                <span className="text-stone-800 price-highlight">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">{t.cart.discount}</span>
                  <span className="text-emerald-600 price-highlight">
                    -฿{totalDiscount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="pt-2.5 border-t border-stone-200 flex justify-between">
                <span className="font-heading text-lg font-semibold text-stone-900">
                  {t.cart.grandTotal}
                </span>
                <span className="font-heading text-lg font-semibold text-stone-900 price-highlight">
                  ฿{total.toLocaleString()}
                </span>
              </div>

              {totalDiscount > 0 && (
                <p className="text-xs text-center text-emerald-600 font-medium">
                  {t.cart.savedAmount.replace('{amount}', `฿${totalDiscount.toLocaleString()}`)}
                </p>
              )}

              <button
                onClick={handleCheckout}
                className="w-full bg-stone-900 text-white text-xs tracking-widest uppercase font-medium py-3.5 rounded-sm hover:bg-stone-800 transition-colors mt-1"
              >
                {t.cart.checkout}
              </button>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2 transition-colors"
                >
                  {t.cart.continueShopping}
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-rose-500 transition-colors"
                >
                  {t.cart.clearCart}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
