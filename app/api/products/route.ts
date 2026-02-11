import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import type { IProduct } from '@/models/Product';

/**
 * GET /api/products
 *
 * Returns all active products with optional filtering.
 *
 * Query params:
 *   ?category=face     — filter by category (face|body|hair|home|sets)
 *   ?search=serum      — case-insensitive search on name.en and name.th
 *   ?tag=bestSeller    — filter by tag (new|bestSeller|limited)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    // Filter by category
    if (category) {
      const validCategories = ['face', 'body', 'hair', 'home', 'sets'];
      if (validCategories.includes(category)) {
        filter.category = category;
      }
    }

    // Filter by tag
    if (tag) {
      const validTags = ['new', 'bestSeller', 'limited'];
      if (validTags.includes(tag)) {
        filter.tags = tag;
      }
    }

    // Search by name (case-insensitive on both EN and TH)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { 'name.en': searchRegex },
        { 'name.th': searchRegex },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch products' } },
      { status: 500 }
    );
  }
}
