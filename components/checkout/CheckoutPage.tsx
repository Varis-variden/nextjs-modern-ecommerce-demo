'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck, CreditCard, Banknote, Info, CheckCircle2, ShoppingBag, Home } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { AddressSection } from './AddressSection';
import { OrderSummary } from './OrderSummary';
import { StripePaymentForm, type StripeFormHandle } from './StripePaymentForm';
import type { Address, ShippingResult } from '@/types';

export function CheckoutPage() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const { addToast } = useToast();
  const stripeFormRef = useRef<StripeFormHandle>(null);
  const {
    items,
    promoResult,
    selectedAddressId,
    setSelectedAddress,
    clearCart,
  } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingResult | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [mounted, setMounted] = useState(false);
  const clearedRef = useRef(false);

  // Redirect if empty cart (after mount to avoid SSR mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0 && !orderPlaced) {
      router.replace('/products');
    }
  }, [mounted, items.length, orderPlaced, router]);

  // Fetch addresses on mount
  useEffect(() => {
    fetch('/api/addresses')
      .then((res) => res.json())
      .then((data) => {
        const addrs = data.data || data || [];
        setAddresses(addrs);
        // Auto-select default or first
        if (!selectedAddressId && addrs.length > 0) {
          const def = addrs.find((a: Address) => a.isDefault);
          setSelectedAddress(def ? def._id : addrs[0]._id);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch shipping info when promoResult changes
  useEffect(() => {
    if (items.length > 0) {
      fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
        .then((res) => res.json())
        .then((data) => setShippingInfo(data))
        .catch(() => {});
    }
  }, [items, promoResult]);

  const handleAddressCreated = (addr: Address) => {
    setAddresses((prev) => [...prev, addr]);
    setSelectedAddress(addr._id);
  };

  const handlePlaceOrder = async () => {
    setIsPlacing(true);

    if (paymentMethod === 'card') {
      const result = await stripeFormRef.current?.submit();
      if (!result?.success) {
        addToast(result?.error || t.checkout.paymentFailed, 'error');
        setIsPlacing(false);
        return;
      }
    } else {
      // COD: simulate network delay
      await new Promise((r) => setTimeout(r, 1500));
    }

    const num = `SIRIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setOrderNumber(num);
    setOrderPlaced(true);
    setIsPlacing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear cart after order is placed
  useEffect(() => {
    if (orderPlaced && !clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
  }, [orderPlaced, clearCart]);

  // Shipping info derived values
  const totalWeight = items.reduce((sum, item) => sum + (item.productId?.weight || 0) * item.qty, 0);
  const shippingCost = promoResult?.shippingCost ?? 0;
  const FREE_SHIPPING_THRESHOLD = 2000;
  const subtotal = promoResult?.subtotal ?? items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.qty, 0);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // ── Order confirmation view ────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-stone-900 mb-2">
            {t.checkout.orderConfirmed}
          </h1>
          <p className="text-stone-500 text-sm mb-6">{t.checkout.thankYou}</p>

          <div className="bg-stone-50 rounded-sm px-6 py-4 mb-6 inline-block">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">
              {t.checkout.orderNumber}
            </p>
            <p className="font-heading text-xl font-semibold text-stone-900 tracking-wider">
              {orderNumber}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-sm px-4 py-3 mb-8">
            <p className="text-xs text-amber-700 flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              {t.checkout.confirmationNote}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase font-medium px-6 py-3.5 rounded-sm hover:bg-stone-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {t.checkout.continueShopping}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 text-xs tracking-widest uppercase font-medium px-6 py-3.5 rounded-sm hover:bg-stone-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              {t.checkout.backToHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted || items.length === 0) return null;

  // ── Main checkout view ─────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t.checkout.backToCart}
        </Link>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-stone-900">
          {t.checkout.title}
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Address section */}
          <section className="bg-white border border-stone-200 rounded-sm p-5 sm:p-6">
            <AddressSection
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelect={(id) => setSelectedAddress(id)}
              onAddressCreated={handleAddressCreated}
            />
          </section>

          {/* 2. Shipping info */}
          <section className="bg-white border border-stone-200 rounded-sm p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-xs tracking-widest uppercase font-semibold text-stone-700 mb-4">
              <Truck className="w-4 h-4" />
              {t.checkout.shippingMethod}
            </h3>

            {/* Free shipping progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span>
                  {amountToFreeShipping > 0
                    ? t.shipping.spendMoreForFree.replace('{amount}', amountToFreeShipping.toLocaleString())
                    : t.shipping.freeShipping}
                </span>
                <span>
                  {shippingCost === 0 ? t.cart.shippingFree : `฿${shippingCost.toLocaleString()}`}
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

            {/* Tier + weight info */}
            <div className="flex items-center justify-between text-sm text-stone-600 bg-stone-50 rounded-sm px-4 py-3">
              <span>
                {shippingInfo?.tier?.[lang] || t.shipping.standard}
              </span>
              <span className="text-xs text-stone-400">
                {t.checkout.totalWeight}: {totalWeight.toLocaleString()}{t.checkout.grams}
              </span>
            </div>
          </section>

          {/* 3. Payment (demo) */}
          <section className="bg-white border border-stone-200 rounded-sm p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-xs tracking-widest uppercase font-semibold text-stone-700 mb-4">
              <CreditCard className="w-4 h-4" />
              {t.checkout.paymentMethod}
            </h3>

            {/* Demo banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-sm px-4 py-3 mb-4">
              <p className="text-xs text-amber-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                {t.checkout.demoPaymentNote}
              </p>
            </div>

            {/* Payment options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all text-left ${
                  paymentMethod === 'card'
                    ? 'border-stone-800 bg-stone-50'
                    : 'border-stone-100 hover:border-stone-300'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-stone-800' : 'text-stone-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-stone-800' : 'text-stone-600'}`}>
                    {t.checkout.creditCard}
                  </p>
                  <p className="text-[11px] text-stone-400">Visa, Mastercard</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all text-left ${
                  paymentMethod === 'cod'
                    ? 'border-stone-800 bg-stone-50'
                    : 'border-stone-100 hover:border-stone-300'
                }`}
              >
                <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-stone-800' : 'text-stone-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${paymentMethod === 'cod' ? 'text-stone-800' : 'text-stone-600'}`}>
                    {t.checkout.cashOnDelivery}
                  </p>
                  <p className="text-[11px] text-stone-400">COD</p>
                </div>
              </button>
            </div>

            {/* Stripe card form */}
            {paymentMethod === 'card' && (
              <div className="mt-4">
                <StripePaymentForm
                  ref={stripeFormRef}
                  amount={Math.round((promoResult?.total ?? subtotal) * 100)}
                />
              </div>
            )}
          </section>
        </div>

        {/* Right column — order summary */}
        <div className="lg:col-span-5">
          <OrderSummary
            onPlaceOrder={handlePlaceOrder}
            selectedAddressId={selectedAddressId}
            isPlacing={isPlacing}
            paymentMethod={paymentMethod}
          />
        </div>
      </div>
    </div>
  );
}
