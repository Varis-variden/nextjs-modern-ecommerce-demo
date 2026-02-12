import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';

// ─── Session Helper ─────────────────────────────────────────

async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('sirin-session')?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set('sirin-session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return sessionId;
}

// ─── GET  /api/cart ─────────────────────────────────────────
// Returns the cart for the current session.
// If no cart exists yet, returns an empty cart structure.

export async function GET() {
  try {
    await connectDB();
    const sessionId = await getSessionId();

    const cart = await Cart.findOne({ sessionId }).populate(
      'items.productId'
    );

    if (!cart) {
      return NextResponse.json({
        data: {
          sessionId,
          items: [],
          couponCode: null,
          selectedAddressId: null,
        },
      });
    }

    return NextResponse.json({ data: cart });
  } catch (error) {
    console.error('[GET /api/cart]', error);
    return NextResponse.json(
      { error: { code: 'CART_FETCH_FAILED', message: 'Failed to fetch cart' } },
      { status: 500 }
    );
  }
}

// ─── POST  /api/cart ────────────────────────────────────────
// Add an item to the cart.
// Body: { productId: string, size: string, qty: number }
// If same product+size combo already exists, increment qty.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, size, qty } = body;

    // ── Validate input ──
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PRODUCT_ID',
            message: 'productId is required and must be a string',
          },
        },
        { status: 400 }
      );
    }

    if (typeof size !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_SIZE',
            message: 'size must be a string',
          },
        },
        { status: 400 }
      );
    }

    if (!qty || typeof qty !== 'number' || qty < 1 || !Number.isInteger(qty)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_QTY',
            message: 'qty is required and must be a positive integer',
          },
        },
        { status: 400 }
      );
    }

    await connectDB();
    const sessionId = await getSessionId();

    let cart = await Cart.findOne({ sessionId });

    if (!cart) {
      // Create a new cart with this item
      cart = await Cart.create({
        sessionId,
        items: [{ productId, size, qty, addedAt: new Date() }],
        updatedAt: new Date(),
      });
    } else {
      // Check if same product+size combo already in cart
      const existingItem = cart.items.find(
        (item: { productId: { toString(): string }; size: string }) =>
          item.productId.toString() === productId && item.size === size
      );

      if (existingItem) {
        existingItem.qty += qty;
      } else {
        cart.items.push({ productId, size, qty, addedAt: new Date() });
      }

      cart.updatedAt = new Date();
      await cart.save();
    }

    // Re-fetch with populated product data
    const populatedCart = await Cart.findById(cart._id).populate(
      'items.productId'
    );

    return NextResponse.json({ data: populatedCart }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cart]', error);
    return NextResponse.json(
      { error: { code: 'CART_ADD_FAILED', message: 'Failed to add item to cart' } },
      { status: 500 }
    );
  }
}

// ─── PUT  /api/cart ─────────────────────────────────────────
// Update cart metadata (couponCode, selectedAddressId).
// Body: { couponCode?: string, selectedAddressId?: string }
// Only updates fields that are provided in the request body.

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { couponCode, selectedAddressId } = body;

    // At least one field must be provided
    if (couponCode === undefined && selectedAddressId === undefined) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_FIELDS',
            message:
              'At least one of couponCode or selectedAddressId must be provided',
          },
        },
        { status: 400 }
      );
    }

    await connectDB();
    const sessionId = await getSessionId();

    // Build update object with only provided fields
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (couponCode !== undefined) update.couponCode = couponCode;
    if (selectedAddressId !== undefined)
      update.selectedAddressId = selectedAddressId;

    const cart = await Cart.findOneAndUpdate(
      { sessionId },
      { $set: update },
      { new: true, upsert: true }
    ).populate('items.productId');

    return NextResponse.json({ data: cart });
  } catch (error) {
    console.error('[PUT /api/cart]', error);
    return NextResponse.json(
      {
        error: {
          code: 'CART_UPDATE_FAILED',
          message: 'Failed to update cart',
        },
      },
      { status: 500 }
    );
  }
}

// ─── DELETE  /api/cart ──────────────────────────────────────
// Clear the entire cart: remove all items and clear couponCode.
// Does not delete the cart document itself (preserves session).

export async function DELETE() {
  try {
    await connectDB();
    const sessionId = await getSessionId();

    const cart = await Cart.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          items: [],
          couponCode: null,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!cart) {
      return NextResponse.json({
        data: {
          sessionId,
          items: [],
          couponCode: null,
          selectedAddressId: null,
        },
      });
    }

    return NextResponse.json({ data: cart });
  } catch (error) {
    console.error('[DELETE /api/cart]', error);
    return NextResponse.json(
      {
        error: {
          code: 'CART_CLEAR_FAILED',
          message: 'Failed to clear cart',
        },
      },
      { status: 500 }
    );
  }
}
