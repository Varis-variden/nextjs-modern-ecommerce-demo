import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Promotion from '@/models/Promotion';
import HomeContent from './HomeContent';

export default async function HomePage() {
  await connectDB();

  const now = new Date();

  // Fetch bestsellers, promotions, and bundle product in parallel
  const [bestSellersRaw, promotionsRaw, bundleProductRaw] = await Promise.all([
    Product.find({ isActive: true, tags: 'bestSeller' })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),

    Promotion.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } },
      ],
    }).lean(),

    Product.findOne({ slug: 'radiance-ritual-set', isActive: true }).lean(),
  ]);

  // Filter promotions (same logic as API route)
  const activePromotions = promotionsRaw
    .filter((promo) => {
      if (promo.endDate && new Date(promo.endDate) < now) return false;
      if (promo.maxUsage && promo.usageCount >= promo.maxUsage) return false;
      return true;
    })
    .slice(0, 4);

  // Serialize to strip Mongoose internals
  const bestSellers = JSON.parse(JSON.stringify(bestSellersRaw));
  const promotions = JSON.parse(JSON.stringify(activePromotions));
  const bundleProduct = bundleProductRaw
    ? JSON.parse(JSON.stringify(bundleProductRaw))
    : null;

  return (
    <HomeContent
      bestSellers={bestSellers}
      promotions={promotions}
      bundleProduct={bundleProduct}
    />
  );
}
