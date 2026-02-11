'use client';

import Image from 'next/image';
import { Tag, Gift, CreditCard, Truck } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { CouponInput } from '@/components/cart/CouponInput';

interface OrderSummaryProps {
  onPlaceOrder: () => void;
  selectedAddressId: string | null;
  isPlacing: boolean;
  paymentMethod?: 'card' | 'cod';
}

export function OrderSummary({ onPlaceOrder, selectedAddressId, isPlacing, paymentMethod }: OrderSummaryProps) {
  const { lang, t } = useLanguage();
  const { addToast } = useToast();
  const {
    items,
    promoResult,
    isLoading,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const subtotal = promoResult?.subtotal ?? items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.qty, 0);
  const totalDiscount = promoResult?.totalDiscount ?? 0;
  const shippingCost = promoResult?.shippingCost ?? 0;
  const total = promoResult?.total ?? subtotal;
  const freeGifts = promoResult?.freeGifts ?? [];
  const appliedPromotions = promoResult?.appliedPromotions ?? [];
  const couponDiscount = promoResult?.couponDiscount ?? null;
  const cashbackEarned = promoResult?.cashbackEarned ?? 0;

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      addToast(t.checkout.pleaseSelectAddress, 'error');
      return;
    }
    onPlaceOrder();
  };

  return (
    <div className="sticky top-28">
      <div className="border border-stone-200 rounded-sm bg-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="text-xs tracking-widest uppercase font-semibold text-stone-700">
            {t.checkout.orderSummary}
          </h3>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Line items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => {
              const product = item.productId;
              if (!product) return null;
              return (
                <div key={item._id} className="flex gap-3">
                  <div className="relative w-12 h-14 bg-stone-100 rounded-sm overflow-hidden flex-shrink-0">
                    <Image
                      src={product.images?.[0] || ''}
                      alt={product.name?.[lang] || ''}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 line-clamp-1">{product.name?.[lang]}</p>
                    <p className="text-xs text-stone-400">
                      {item.size} x {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-stone-800 flex-shrink-0 price-highlight">
                    ฿{((product.price || 0) * item.qty).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-2.5">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">{t.cart.subtotal}</span>
              <span className="text-stone-800 price-highlight">฿{subtotal.toLocaleString()}</span>
            </div>

            {/* Applied promotions */}
            {appliedPromotions.map((promo) => (
              <div key={promo.promoId} className="flex justify-between text-sm">
                <span className="text-emerald-600 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {promo.label[lang]}
                </span>
                <span className="text-emerald-600 price-highlight">
                  -฿{promo.discountAmount.toLocaleString()}
                </span>
              </div>
            ))}

            {/* Coupon discount */}
            {couponDiscount && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {couponDiscount.label[lang]}
                </span>
                <span className="text-amber-600 price-highlight">
                  -฿{couponDiscount.amount.toLocaleString()}
                </span>
              </div>
            )}

            {/* Coupon input */}
            <div className="py-2">
              <CouponInput
                couponCode={couponCode}
                onApply={applyCoupon}
                onRemove={removeCoupon}
                isLoading={isLoading}
                couponError={promoResult?.couponError || null}
              />
            </div>

            {/* Shipping */}
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 flex items-center gap-1">
                <Truck className="w-3 h-3" />
                {t.cart.shipping}
              </span>
              <span className={shippingCost === 0 ? 'text-emerald-600 font-medium' : 'text-stone-800 price-highlight'}>
                {shippingCost === 0 ? t.cart.shippingFree : `฿${shippingCost.toLocaleString()}`}
              </span>
            </div>

            {/* Free gifts */}
            {freeGifts.length > 0 && (
              <div className="bg-emerald-50/50 rounded-sm p-3 space-y-2">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-700 flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  {t.cart.freeGifts}
                </span>
                {freeGifts.map((gift, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="relative w-8 h-8 bg-white rounded-sm overflow-hidden flex-shrink-0 border border-emerald-100">
                      <Image
                        src={gift.image}
                        alt={gift.name[lang]}
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-stone-700 line-clamp-1">
                        {gift.name[lang]} x{gift.qty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cashback */}
            {cashbackEarned > 0 && (
              <div className="flex justify-between text-sm bg-blue-50/50 rounded-sm px-3 py-2">
                <span className="text-blue-600 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  {t.cart.cashbackEarned.replace('{amount}', `฿${cashbackEarned.toLocaleString()}`)}
                </span>
              </div>
            )}
          </div>

          {/* Grand total */}
          <div className="border-t border-stone-200 pt-4">
            <div className="flex justify-between">
              <span className="font-heading text-lg font-semibold text-stone-900">
                {t.cart.grandTotal}
              </span>
              <span className="font-heading text-lg font-semibold text-stone-900 price-highlight">
                ฿{total.toLocaleString()}
              </span>
            </div>

            {totalDiscount > 0 && (
              <p className="text-xs text-center text-emerald-600 font-medium mt-2">
                {t.cart.savedAmount.replace('{amount}', `฿${totalDiscount.toLocaleString()}`)}
              </p>
            )}
          </div>

          {/* Place order button */}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing || items.length === 0}
            className="w-full bg-stone-900 text-white text-xs tracking-widest uppercase font-medium py-4 rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-40"
          >
            {isPlacing
              ? t.checkout.placingOrder
              : paymentMethod === 'card'
                ? t.checkout.payNow
                : t.checkout.placeOrder}
          </button>
        </div>
      </div>
    </div>
  );
}
