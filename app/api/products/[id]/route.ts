import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

/**
 * GET /api/products/[id]
 *
 * Returns a single active product by slug or MongoDB ObjectId.
 * Tries slug first (more common for user-facing URLs), then falls back
 * to _id lookup if the param is a valid ObjectId.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Try finding by slug first (most common for user-facing URLs)
    let product = await Product.findOne({ slug: id, isActive: true }).lean();

    // Fall back to ObjectId lookup if slug didn't match
    if (!product && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findOne({ _id: id, isActive: true }).lean();
    }

    if (!product) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch product' } },
      { status: 500 }
    );
  }
}
