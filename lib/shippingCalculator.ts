import type { ShippingTier, ShippingResult, CartItemForCalculation } from '@/types';

const SHIPPING_TIERS: ShippingTier[] = [
  { maxWeight: 500, cost: 40, label: { en: 'Light parcel', th: 'พัสดุเบา' } },
  { maxWeight: 1000, cost: 60, label: { en: 'Standard', th: 'มาตรฐาน' } },
  { maxWeight: 3000, cost: 90, label: { en: 'Medium', th: 'ขนาดกลาง' } },
  { maxWeight: 5000, cost: 120, label: { en: 'Heavy', th: 'ขนาดใหญ่' } },
  {
    maxWeight: Infinity,
    cost: 150,
    label: { en: 'Extra heavy', th: 'น้ำหนักมาก' },
  },
];

export const FREE_SHIPPING_THRESHOLD = 2000;

export function calculateShipping(
  items: CartItemForCalculation[],
  subtotalAfterDiscount: number
): ShippingResult {
  // Calculate total weight
  const totalWeight = items.reduce(
    (sum, item) => sum + item.qty * (item.product.weight || 200),
    0
  );

  // Find matching tier
  const tier = SHIPPING_TIERS.find((t) => totalWeight <= t.maxWeight) || SHIPPING_TIERS[SHIPPING_TIERS.length - 1];

  // Free shipping if above threshold
  const qualifiesForFree = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD;
  const cost = qualifiesForFree ? 0 : tier.cost;

  const amountToFreeShipping = qualifiesForFree
    ? 0
    : Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalAfterDiscount);

  return {
    cost,
    tier: tier.label,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
  };
}
