'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import type { Product, PromotionResult } from '@/types';

interface CartItemWithProduct {
  _id: string;
  productId: Product;
  size: string;
  qty: number;
}

interface CartContextType {
  items: CartItemWithProduct[];
  promoResult: PromotionResult | null;
  isCartOpen: boolean;
  isLoading: boolean;
  couponCode: string | null;
  selectedAddressId: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, size: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCart: () => Promise<void>;
  setSelectedAddress: (id: string | null) => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [promoResult, setPromoResult] = useState<PromotionResult | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      const cart = data.data || data;
      setItems(cart.items || []);
      setCouponCode(cart.couponCode || null);
      setSelectedAddressId(cart.selectedAddressId || null);
    } catch {
      // silent fail on initial load
    }
  }, []);

  const recalculatePromos = useCallback(async () => {
    try {
      const res = await fetch('/api/promotions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      setPromoResult(result);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (items.length > 0) {
      recalculatePromos();
    } else {
      setPromoResult(null);
    }
  }, [items, recalculatePromos]);

  const addItem = useCallback(async (productId: string, size: string, qty: number) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, qty }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const cart = data.data || data;
      setItems(cart.items || []);
      setIsCartOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      const cart = data.data || data;
      setItems(cart.items || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQty = useCallback(async (itemId: string, qty: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty }),
      });
      const data = await res.json();
      const cart = data.data || data;
      setItems(cart.items || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: code }),
      });
      setCouponCode(code);
      await recalculatePromos();
    } finally {
      setIsLoading(false);
    }
  }, [recalculatePromos]);

  const removeCoupon = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: '' }),
      });
      setCouponCode(null);
      await recalculatePromos();
    } finally {
      setIsLoading(false);
    }
  }, [recalculatePromos]);

  const setSelectedAddress = useCallback(async (id: string | null) => {
    setSelectedAddressId(id);
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedAddressId: id || '' }),
      });
    } catch {
      // silent fail
    }
  }, []);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/cart', { method: 'DELETE' });
      setItems([]);
      setCouponCode(null);
      setSelectedAddressId(null);
      setPromoResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        promoResult,
        isCartOpen,
        isLoading,
        couponCode,
        selectedAddressId,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addItem,
        removeItem,
        updateQty,
        applyCoupon,
        removeCoupon,
        clearCart,
        setSelectedAddress,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
