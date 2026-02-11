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

// ─── PATCH  /api/cart/items/[itemId] ────────────────────────
// Update the qty of a specific cart item.
// Body: { qty: number }

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { qty } = body;

    // ── Validate input ──
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

    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return NextResponse.json(
        { error: { code: 'CART_NOT_FOUND', message: 'Cart not found' } },
        { status: 404 }
      );
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return NextResponse.json(
        { error: { code: 'ITEM_NOT_FOUND', message: 'Cart item not found' } },
        { status: 404 }
      );
    }

    item.qty = qty;
    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      'items.productId'
    );

    return NextResponse.json({ data: populatedCart });
  } catch (error) {
    console.error('[PATCH /api/cart/items/[itemId]]', error);
    return NextResponse.json(
      {
        error: {
          code: 'ITEM_UPDATE_FAILED',
          message: 'Failed to update cart item',
        },
      },
      { status: 500 }
    );
  }
}

// ─── DELETE  /api/cart/items/[itemId] ───────────────────────
// Remove a specific item from the cart.

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    await connectDB();
    const sessionId = await getSessionId();

    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return NextResponse.json(
        { error: { code: 'CART_NOT_FOUND', message: 'Cart not found' } },
        { status: 404 }
      );
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return NextResponse.json(
        { error: { code: 'ITEM_NOT_FOUND', message: 'Cart item not found' } },
        { status: 404 }
      );
    }

    cart.items.pull({ _id: itemId });
    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      'items.productId'
    );

    return NextResponse.json({ data: populatedCart });
  } catch (error) {
    console.error('[DELETE /api/cart/items/[itemId]]', error);
    return NextResponse.json(
      {
        error: {
          code: 'ITEM_REMOVE_FAILED',
          message: 'Failed to remove cart item',
        },
      },
      { status: 500 }
    );
  }
}
