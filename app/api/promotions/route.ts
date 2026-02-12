import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import '@/models/Product'; // register model for populate

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

    const activePromotions = await Promotion.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } },
      ],
      $and: [
        { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
        { $or: [{ maxUsage: { $exists: false } }, { maxUsage: null }, { $expr: { $lt: ['$usageCount', '$maxUsage'] } }] },
      ],
    })
      .populate('conditions.productIds', 'name images slug price')
      .populate('rewards.freeProductId', 'name images slug')
      .populate('rewards.bundleProductIds', 'name images slug price')
      .lean();

    return NextResponse.json(activePromotions);
  } catch (error) {
    console.error('GET /api/promotions error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch promotions' } },
      { status: 500 }
    );
  }
}
