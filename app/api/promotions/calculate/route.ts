import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import '@/models/Product'; // register model for populate
import '@/models/Promotion'; // used by promotion engine
import { calculatePromotions } from '@/lib/promotionEngine';
import type { CartForCalculation, CartItemForCalculation } from '@/types';

/**
 * POST /api/promotions/calculate
 *
 * Calculates all applicable promotions for the current session's cart.
 * Reads the `sirin-session` cookie to identify the cart, populates cart
 * items with full product data, then runs the promotion engine.
 *
 * Optional body: { couponCode?: string }
 *   — Overrides the coupon code stored on the cart document.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Read session cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sirin-session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'NO_SESSION', message: 'No session found. Please add items to your cart first.' } },
        { status: 400 }
      );
    }

    // Parse optional body for couponCode override
    let couponCode: string | undefined;
    try {
      const body = await request.json();
      if (body.couponCode !== undefined) {
        couponCode = body.couponCode;
      }
    } catch {
      // Body is optional — no JSON body is fine
    }

    // Find the cart and populate product data on each item
    const cart = await Cart.findOne({ sessionId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: { code: 'EMPTY_CART', message: 'Cart is empty' } },
        { status: 400 }
      );
    }

    // Build the CartForCalculation from populated cart items
    const cartItems: CartItemForCalculation[] = cart.items
      .filter((item: any) => item.productId != null) // skip items whose product was deleted
      .map((item: any) => ({
        productId: item.productId._id.toString(),
        product: item.productId.toObject(),
        size: item.size || '',
        qty: item.qty,
      }));

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: { code: 'EMPTY_CART', message: 'Cart contains no valid products' } },
        { status: 400 }
      );
    }

    const cartForCalc: CartForCalculation = {
      items: cartItems,
      couponCode: couponCode ?? cart.couponCode,
    };

    const result = await calculatePromotions(cartForCalc);

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/promotions/calculate error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate promotions' } },
      { status: 500 }
    );
  }
}
