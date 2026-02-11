import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { calculatePromotions } from '@/lib/promotionEngine';
import type { CartForCalculation, CartItemForCalculation } from '@/types';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/**
 * POST /api/checkout/create-payment-intent
 *
 * Reads the session cart, calculates the authoritative total via the
 * promotion engine, then creates a Stripe PaymentIntent for that amount.
 * Returns { clientSecret }.
 */
export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sirin-session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ sessionId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const cartItems: CartItemForCalculation[] = cart.items
      .filter((item: any) => item.productId != null)
      .map((item: any) => ({
        productId: item.productId._id.toString(),
        product: item.productId.toObject(),
        size: item.size || '',
        qty: item.qty,
      }));

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart contains no valid products' },
        { status: 400 }
      );
    }

    const cartForCalc: CartForCalculation = {
      items: cartItems,
      couponCode: cart.couponCode,
    };

    const promoResult = await calculatePromotions(cartForCalc);
    const amountInSatang = Math.round(promoResult.total * 100);

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSatang,
      currency: 'thb',
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('POST /api/checkout/create-payment-intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
