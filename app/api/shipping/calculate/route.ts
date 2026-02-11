import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/shippingCalculator';
import type { CartItemForCalculation } from '@/types';

/**
 * POST /api/shipping/calculate
 *
 * Calculates shipping cost based on item weights and cart subtotal.
 *
 * Body: {
 *   items: Array<{ productId: string, qty: number, weight: number }>,
 *   subtotalAfterDiscount: number
 * }
 *
 * Returns: {
 *   cost: number,
 *   tier: { th: string, en: string },
 *   freeShippingThreshold: number,
 *   amountToFreeShipping: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, subtotalAfterDiscount } = body;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Items array is required and must not be empty' } },
        { status: 400 }
      );
    }

    if (subtotalAfterDiscount == null || typeof subtotalAfterDiscount !== 'number') {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'subtotalAfterDiscount is required and must be a number' } },
        { status: 400 }
      );
    }

    // Transform the request items into the shape that calculateShipping expects.
    // The shipping calculator reads item.qty and item.product.weight.
    const shippingItems: CartItemForCalculation[] = items.map(
      (item: { productId: string; qty: number; weight: number }) => ({
        productId: item.productId,
        product: {
          weight: item.weight ?? 200, // default 200g if not provided
        } as CartItemForCalculation['product'],
        size: '',
        qty: item.qty,
      })
    );

    const result = calculateShipping(shippingItems, subtotalAfterDiscount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/shipping/calculate error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate shipping' } },
      { status: 500 }
    );
  }
}
