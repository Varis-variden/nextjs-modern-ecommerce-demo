import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Promotion from '@/models/Promotion';

/**
 * GET /api/promotions
 *
 * Returns all currently active promotions.
 * Filters by isActive: true and ensures the current date falls
 * within startDate/endDate range (if set). Also excludes promotions
 * that have reached their maxUsage limit.
 */
export async function GET() {
  try {
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
      .populate('rewards.freeProductId', 'name images slug')
      .populate('rewards.bundleProductIds', 'name images slug price')
      .lean();

    // Filter out expired and maxUsage-exceeded promotions in JS
    // (endDate and maxUsage require comparison logic that is cleaner here)
    const activePromotions = promotions.filter((promo) => {
      if (promo.endDate && new Date(promo.endDate) < now) return false;
      if (promo.maxUsage && promo.usageCount >= promo.maxUsage) return false;
      return true;
    });

    return NextResponse.json(activePromotions);
  } catch (error) {
    console.error('GET /api/promotions error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch promotions' } },
      { status: 500 }
    );
  }
}
