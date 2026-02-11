// SIRIN — Shared TypeScript Types

export interface BilingualText {
  th: string;
  en: string;
}

// ─── Product ───────────────────────────────────────────────

export interface ReservedStock {
  promotionId: string;
  qty: number;
}

export interface Product {
  _id: string;
  slug: string;
  sku?: string;
  name: BilingualText;
  description: BilingualText;
  ingredients: BilingualText;
  category: 'face' | 'body' | 'hair' | 'home' | 'sets';
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  tags: ('new' | 'bestSeller' | 'limited')[];
  stock: number;
  reservedStock: ReservedStock[];
  weight: number;
  isActive: boolean;
  createdAt: Date;
}

// ─── Cart ──────────────────────────────────────────────────

export interface CartItem {
  _id?: string;
  productId: string;
  size: string;
  qty: number;
  addedAt: Date;
}

export interface Cart {
  _id: string;
  sessionId: string;
  items: CartItem[];
  couponCode?: string;
  selectedAddressId?: string;
  updatedAt: Date;
}

// ─── Promotion ─────────────────────────────────────────────

export interface PromotionTier {
  threshold: number;
  discountPercent?: number;
  discountFixed?: number;
  giftProductId?: string;
}

export interface PromotionConditions {
  productIds?: string[];
  categoryIds?: string[];
  minQty?: number;
  minSpend?: number;
  tiers?: PromotionTier[];
}

export interface PromotionRewards {
  discountPercent?: number;
  discountFixed?: number;
  freeProductId?: string;
  freeProductQty?: number;
  cashbackPercent?: number;
  bundlePrice?: number;
  bundleProductIds?: string[];
}

export type PromotionType =
  | 'bogo'
  | 'gwp'
  | 'bundle'
  | 'tier_discount'
  | 'tier_gwp'
  | 'category_discount'
  | 'cashback';

export interface Promotion {
  _id: string;
  slug: string;
  type: PromotionType;
  name: BilingualText;
  description: BilingualText;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  conditions: PromotionConditions;
  rewards: PromotionRewards;
  stockAllocation?: number;
  usageCount: number;
  maxUsage?: number;
}

// ─── Coupon ────────────────────────────────────────────────

export type CouponType = 'percent' | 'fixed' | 'free_shipping';

export interface CouponConditions {
  categoryIds?: string[];
  productIds?: string[];
}

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  conditions: CouponConditions;
  usageLimit: number;
  usageCount: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

// ─── Address ───────────────────────────────────────────────

export interface Address {
  _id: string;
  sessionId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  district: string;
  subDistrict: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// ─── Promotion Engine I/O ──────────────────────────────────

export interface CartItemForCalculation {
  productId: string;
  product: Product;
  size: string;
  qty: number;
}

export interface CartForCalculation {
  items: CartItemForCalculation[];
  couponCode?: string;
}

export interface AppliedPromotion {
  promoId: string;
  type: string;
  label: BilingualText;
  discountAmount: number;
  affectedItems: string[];
  details: string;
}

export interface FreeGift {
  productId: string;
  name: BilingualText;
  image: string;
  qty: number;
  reason: BilingualText;
}

export interface CouponDiscount {
  code: string;
  amount: number;
  label: BilingualText;
}

export interface PromotionResult {
  appliedPromotions: AppliedPromotion[];
  freeGifts: FreeGift[];
  couponDiscount: CouponDiscount | null;
  couponError?: BilingualText;
  cashbackEarned: number;
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  total: number;
}

// ─── Shipping ──────────────────────────────────────────────

export interface ShippingTier {
  maxWeight: number;
  cost: number;
  label: BilingualText;
}

export interface ShippingResult {
  cost: number;
  tier: BilingualText;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
}
