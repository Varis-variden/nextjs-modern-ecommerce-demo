import { connectDB } from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import PromotionsContent from './PromotionsContent';

export default async function PromotionsPage() {
  await connectDB();

  const now = new Date();

  const promotions = await Promotion.find({
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
  })
    .populate('conditions.productIds', 'name images slug price')
    .populate('rewards.freeProductId', 'name images slug')
    .populate('rewards.bundleProductIds', 'name images slug price')
    .lean();

  // Filter out expired and maxUsage-exceeded promotions
  const activePromotions = promotions.filter((promo) => {
    if (promo.endDate && new Date(promo.endDate) < now) return false;
    if (promo.maxUsage && promo.usageCount >= promo.maxUsage) return false;
    return true;
  });

  // Serialize to strip Mongoose internals (ObjectIds, etc.)
  const data = JSON.parse(JSON.stringify(activePromotions));

  return <PromotionsContent promotions={data} />;
}
