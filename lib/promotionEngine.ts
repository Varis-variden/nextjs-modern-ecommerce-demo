import type {
  CartForCalculation,
  PromotionResult,
  AppliedPromotion,
  FreeGift,
  CouponDiscount,
  BilingualText,
  CartItemForCalculation,
} from '@/types';
import { connectDB } from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';
import { calculateShipping, FREE_SHIPPING_THRESHOLD } from '@/lib/shippingCalculator';

export async function calculatePromotions(
  cart: CartForCalculation
): Promise<PromotionResult> {
  await connectDB();

  const appliedPromotions: AppliedPromotion[] = [];
  const freeGifts: FreeGift[] = [];
  let couponDiscount: CouponDiscount | null = null;
  let couponError: BilingualText | undefined;
  let cashbackEarned = 0;

  // Calculate raw subtotal
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  let totalDiscount = 0;
  let freeShippingFromCoupon = false;

  // Get all active promotions
  const now = new Date();
  const promotions = await Promotion.find({
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
  }).populate('rewards.freeProductId conditions.tiers.giftProductId rewards.bundleProductIds');

  // Also filter by endDate
  const activePromotions = promotions.filter((promo) => {
    if (promo.endDate && new Date(promo.endDate) < now) return false;
    if (promo.maxUsage && promo.usageCount >= promo.maxUsage) return false;
    return true;
  });

  // ─── 1. BOGO (Buy One Get One) ────────────────────────────

  const bogoPromos = activePromotions.filter((p) => p.type === 'bogo');
  for (const promo of bogoPromos) {
    const promoProductIds = (promo.conditions.productIds || []).map((id: any) =>
      id.toString()
    );

    for (const item of cart.items) {
      if (promoProductIds.includes(item.productId)) {
        const freeQty = Math.floor(item.qty / 2);
        if (freeQty > 0) {
          const discount = freeQty * item.product.price;
          totalDiscount += discount;
          appliedPromotions.push({
            promoId: promo._id.toString(),
            type: 'bogo',
            label: promo.name as BilingualText,
            discountAmount: discount,
            affectedItems: [item.productId],
            details: `${freeQty} free item${freeQty > 1 ? 's' : ''}`,
          });
        }
      }
    }
  }

  // ─── 2. GWP — Product Level (Gift With Purchase) ──────────

  const gwpPromos = activePromotions.filter((p) => p.type === 'gwp');
  for (const promo of gwpPromos) {
    const promoProductIds = (promo.conditions.productIds || []).map((id: any) =>
      id.toString()
    );
    const promoCategoryIds = promo.conditions.categoryIds || [];

    // Product-level GWP: check if qualifying products are in cart
    if (promoProductIds.length > 0 && promoCategoryIds.length === 0) {
      // Check if ALL qualifying products are in cart (combo support)
      const allPresent = promoProductIds.every((pid: string) =>
        cart.items.some(
          (item) =>
            item.productId === pid &&
            item.qty >= (promo.conditions.minQty || 1)
        )
      );

      if (allPresent && promo.rewards.freeProductId) {
        const giftProduct = await Product.findById(promo.rewards.freeProductId);
        if (giftProduct) {
          freeGifts.push({
            productId: giftProduct._id.toString(),
            name: giftProduct.name as BilingualText,
            image: giftProduct.images?.[0] || '',
            qty: promo.rewards.freeProductQty || 1,
            reason: promo.description as BilingualText,
          });
          appliedPromotions.push({
            promoId: promo._id.toString(),
            type: 'gwp',
            label: promo.name as BilingualText,
            discountAmount: 0,
            affectedItems: promoProductIds,
            details: `Free ${giftProduct.name.en}`,
          });
        }
      }
    }

    // ─── 3. GWP — Category Level ──────────────────────────────
    if (promoCategoryIds.length > 0 && promoProductIds.length === 0) {
      const categoryItemCount = cart.items
        .filter((item) =>
          promoCategoryIds.includes(item.product.category)
        )
        .reduce((sum, item) => sum + item.qty, 0);

      if (categoryItemCount >= (promo.conditions.minQty || 1) && promo.rewards.freeProductId) {
        const giftProduct = await Product.findById(promo.rewards.freeProductId);
        if (giftProduct) {
          freeGifts.push({
            productId: giftProduct._id.toString(),
            name: giftProduct.name as BilingualText,
            image: giftProduct.images?.[0] || '',
            qty: promo.rewards.freeProductQty || 1,
            reason: promo.description as BilingualText,
          });
          appliedPromotions.push({
            promoId: promo._id.toString(),
            type: 'gwp',
            label: promo.name as BilingualText,
            discountAmount: 0,
            affectedItems: cart.items
              .filter((item) =>
                promoCategoryIds.includes(item.product.category)
              )
              .map((item) => item.productId),
            details: `Free ${giftProduct.name.en}`,
          });
        }
      }
    }
  }

  // ─── 4. Bundle ─────────────────────────────────────────────

  const bundlePromos = activePromotions.filter((p) => p.type === 'bundle');
  for (const promo of bundlePromos) {
    const bundleProductIds = (promo.rewards.bundleProductIds || []).map(
      (id: any) => id.toString()
    );

    if (bundleProductIds.length === 0) continue;

    // Check if ALL bundle products are present in cart
    const allPresent = bundleProductIds.every((pid: string) =>
      cart.items.some((item) => item.productId === pid)
    );

    if (allPresent && promo.rewards.bundlePrice != null) {
      // Calculate how many complete sets
      const setCounts = bundleProductIds.map((pid: string) => {
        const item = cart.items.find((i) => i.productId === pid);
        return item ? item.qty : 0;
      });
      const completeSets = Math.min(...setCounts);

      if (completeSets > 0) {
        // Sum of individual prices for items in the bundle
        const individualTotal = bundleProductIds.reduce(
          (sum: number, pid: string) => {
            const item = cart.items.find((i) => i.productId === pid);
            return sum + (item ? item.product.price : 0);
          },
          0
        );

        const discount =
          (individualTotal - promo.rewards.bundlePrice) * completeSets;
        if (discount > 0) {
          totalDiscount += discount;
          appliedPromotions.push({
            promoId: promo._id.toString(),
            type: 'bundle',
            label: promo.name as BilingualText,
            discountAmount: discount,
            affectedItems: bundleProductIds,
            details: `Save ${discount.toLocaleString()} THB with bundle`,
          });
        }
      }
    }
  }

  // ─── 5. Tier Discount ─────────────────────────────────────

  const subtotalAfterDiscounts = subtotal - totalDiscount;
  const tierDiscountPromos = activePromotions.filter(
    (p) => p.type === 'tier_discount'
  );
  for (const promo of tierDiscountPromos) {
    const tiers = promo.conditions.tiers || [];
    if (tiers.length === 0) continue;

    // Find highest matching tier
    const sortedTiers = [...tiers].sort(
      (a, b) => a.threshold - b.threshold
    );
    const matchingTiers = sortedTiers.filter(
      (t) => subtotalAfterDiscounts >= t.threshold
    );
    const bestTier = matchingTiers[matchingTiers.length - 1];

    if (bestTier) {
      let discount = 0;
      if (bestTier.discountPercent) {
        discount = Math.round(
          (subtotalAfterDiscounts * bestTier.discountPercent) / 100
        );
      } else if (bestTier.discountFixed) {
        discount = bestTier.discountFixed;
      }

      if (discount > 0) {
        totalDiscount += discount;
        appliedPromotions.push({
          promoId: promo._id.toString(),
          type: 'tier_discount',
          label: promo.name as BilingualText,
          discountAmount: discount,
          affectedItems: cart.items.map((i) => i.productId),
          details: bestTier.discountPercent
            ? `${bestTier.discountPercent}% off`
            : `${bestTier.discountFixed} THB off`,
        });
      }
    }
  }

  // ─── 6. Tier GWP ──────────────────────────────────────────

  const tierGwpPromos = activePromotions.filter((p) => p.type === 'tier_gwp');
  for (const promo of tierGwpPromos) {
    const tiers = promo.conditions.tiers || [];
    if (tiers.length === 0) continue;

    const currentSubtotal = subtotal - totalDiscount;
    const sortedTiers = [...tiers].sort(
      (a, b) => a.threshold - b.threshold
    );
    const matchingTiers = sortedTiers.filter(
      (t) => currentSubtotal >= t.threshold
    );
    const bestTier = matchingTiers[matchingTiers.length - 1];

    if (bestTier && bestTier.giftProductId) {
      const giftProduct = await Product.findById(bestTier.giftProductId);
      if (giftProduct) {
        freeGifts.push({
          productId: giftProduct._id.toString(),
          name: giftProduct.name as BilingualText,
          image: giftProduct.images?.[0] || '',
          qty: 1,
          reason: promo.description as BilingualText,
        });
        appliedPromotions.push({
          promoId: promo._id.toString(),
          type: 'tier_gwp',
          label: promo.name as BilingualText,
          discountAmount: 0,
          affectedItems: cart.items.map((i) => i.productId),
          details: `Free ${giftProduct.name.en}`,
        });
      }
    }
  }

  // ─── Category Discount ────────────────────────────────────

  const categoryDiscountPromos = activePromotions.filter(
    (p) => p.type === 'category_discount'
  );
  for (const promo of categoryDiscountPromos) {
    const categoryIds = promo.conditions.categoryIds || [];
    if (categoryIds.length === 0) continue;

    const matchingItems = cart.items.filter((item) =>
      categoryIds.includes(item.product.category)
    );
    const matchingSubtotal = matchingItems.reduce(
      (sum, item) => sum + item.product.price * item.qty,
      0
    );

    if (matchingItems.length > 0 && promo.rewards.discountPercent) {
      const discount = Math.round(
        (matchingSubtotal * promo.rewards.discountPercent) / 100
      );
      if (discount > 0) {
        totalDiscount += discount;
        appliedPromotions.push({
          promoId: promo._id.toString(),
          type: 'category_discount',
          label: promo.name as BilingualText,
          discountAmount: discount,
          affectedItems: matchingItems.map((i) => i.productId),
          details: `${promo.rewards.discountPercent}% off ${categoryIds.join(', ')}`,
        });
      }
    }
  }

  // ─── 6. Cashback ──────────────────────────────────────────

  const cashbackPromos = activePromotions.filter(
    (p) => p.type === 'cashback'
  );
  const subtotalForCashback = subtotal - totalDiscount;
  for (const promo of cashbackPromos) {
    const minSpend = promo.conditions.minSpend || 0;
    if (
      subtotalForCashback >= minSpend &&
      promo.rewards.cashbackPercent
    ) {
      cashbackEarned += Math.round(
        (subtotalForCashback * promo.rewards.cashbackPercent) / 100
      );
      appliedPromotions.push({
        promoId: promo._id.toString(),
        type: 'cashback',
        label: promo.name as BilingualText,
        discountAmount: 0,
        affectedItems: cart.items.map((i) => i.productId),
        details: `${promo.rewards.cashbackPercent}% cashback earned`,
      });
    }
  }

  // ─── 7. Coupon ─────────────────────────────────────────────

  if (cart.couponCode) {
    const coupon = await Coupon.findOne({
      code: cart.couponCode.toUpperCase(),
    });

    if (!coupon) {
      couponError = {
        th: 'ไม่พบรหัสคูปองนี้',
        en: 'Coupon code not found',
      };
    } else if (!coupon.isActive) {
      couponError = {
        th: 'คูปองนี้ไม่สามารถใช้ได้แล้ว',
        en: 'This coupon is no longer active',
      };
    } else if (coupon.startDate && new Date(coupon.startDate) > now) {
      couponError = {
        th: 'คูปองนี้ยังไม่เริ่มใช้งาน',
        en: 'This coupon is not yet active',
      };
    } else if (coupon.endDate && new Date(coupon.endDate) < now) {
      couponError = {
        th: 'คูปองนี้หมดอายุแล้ว',
        en: 'This coupon has expired',
      };
    } else if (coupon.usageCount >= coupon.usageLimit) {
      couponError = {
        th: 'คูปองนี้ถูกใช้ครบจำนวนแล้ว',
        en: 'This coupon has reached its usage limit',
      };
    } else {
      const subtotalAfterPromos = subtotal - totalDiscount;

      if (subtotalAfterPromos < coupon.minOrderAmount) {
        couponError = {
          th: `ยอดสั่งซื้อขั้นต่ำ ฿${coupon.minOrderAmount.toLocaleString()}`,
          en: `Minimum order amount is ฿${coupon.minOrderAmount.toLocaleString()}`,
        };
      } else {
        // Calculate coupon discount
        let couponDiscountAmount = 0;

        switch (coupon.type) {
          case 'percent':
            couponDiscountAmount = Math.round(
              (subtotalAfterPromos * coupon.value) / 100
            );
            if (coupon.maxDiscount) {
              couponDiscountAmount = Math.min(
                couponDiscountAmount,
                coupon.maxDiscount
              );
            }
            break;
          case 'fixed':
            couponDiscountAmount = coupon.value;
            break;
          case 'free_shipping':
            freeShippingFromCoupon = true;
            couponDiscountAmount = 0;
            break;
        }

        if (couponDiscountAmount > 0 || coupon.type === 'free_shipping') {
          totalDiscount += couponDiscountAmount;
          const couponLabel: BilingualText =
            coupon.type === 'free_shipping'
              ? { th: 'จัดส่งฟรี', en: 'Free shipping' }
              : coupon.type === 'percent'
                ? {
                    th: `ส่วนลด ${coupon.value}%`,
                    en: `${coupon.value}% off`,
                  }
                : {
                    th: `ส่วนลด ฿${coupon.value.toLocaleString()}`,
                    en: `฿${coupon.value.toLocaleString()} off`,
                  };

          couponDiscount = {
            code: coupon.code,
            amount: couponDiscountAmount,
            label: couponLabel,
          };
        }
      }
    }
  }

  // ─── 8. Shipping ───────────────────────────────────────────

  const finalSubtotal = subtotal - totalDiscount;
  const shippingResult = calculateShipping(cart.items, finalSubtotal);
  let shippingCost = shippingResult.cost;

  // Override shipping cost if coupon gives free shipping
  if (freeShippingFromCoupon) {
    shippingCost = 0;
  }

  const total = Math.max(0, finalSubtotal + shippingCost);

  return {
    appliedPromotions,
    freeGifts,
    couponDiscount,
    couponError,
    cashbackEarned,
    subtotal,
    totalDiscount,
    shippingCost,
    total,
  };
}
