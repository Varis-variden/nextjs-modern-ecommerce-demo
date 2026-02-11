import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

/**
 * POST /api/coupons/validate
 *
 * Validates a coupon code against current conditions.
 *
 * Body: { code: string, subtotal: number }
 *   - code:     the coupon code to validate (case-insensitive, stored uppercase)
 *   - subtotal: the cart subtotal to check against minOrderAmount
 *
 * Returns:
 *   200 — { valid: true, coupon: { code, type, value, minOrderAmount, maxDiscount } }
 *   400 — { valid: false, error: { th, en } } with bilingual error message
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { code, subtotal } = body;

    // Validate required fields
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          valid: false,
          error: {
            th: 'กรุณากรอกรหัสคูปอง',
            en: 'Please enter a coupon code',
          },
        },
        { status: 400 }
      );
    }

    if (subtotal == null || typeof subtotal !== 'number' || subtotal < 0) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            th: 'ยอดสั่งซื้อไม่ถูกต้อง',
            en: 'Invalid order subtotal',
          },
        },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    }).lean();

    const now = new Date();

    // Coupon not found
    if (!coupon) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            th: 'ไม่พบรหัสคูปองนี้',
            en: 'Coupon code not found',
          },
        },
        { status: 400 }
      );
    }

    // Coupon inactive
    if (!coupon.isActive) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            th: 'คูปองนี้ไม่สามารถใช้ได้แล้ว',
            en: 'This coupon is no longer active',
          },
        },
        { status: 400 }
      );
    }

    // Not yet started
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            th: 'คูปองนี้ยังไม่เริ่มใช้งาน',
            en: 'This coupon is not yet active',
          },
        },
        { status: 400 }
      );
    }

    // Expired
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            th: 'คูปองนี้หมดอายุแล้ว',
            en: 'This coupon has expired',
          },
        },
        { status: 400 }
      );
    }

    // Usage limit exceeded
    if (coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            th: 'คูปองนี้ถูกใช้ครบจำนวนแล้ว',
            en: 'This coupon has reached its usage limit',
          },
        },
        { status: 400 }
      );
    }

    // Minimum order amount not met
    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            th: `ยอดสั่งซื้อขั้นต่ำ ฿${coupon.minOrderAmount.toLocaleString()}`,
            en: `Minimum order amount is ฿${coupon.minOrderAmount.toLocaleString()}`,
          },
        },
        { status: 400 }
      );
    }

    // All checks passed
    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount ?? null,
      },
    });
  } catch (error) {
    console.error('POST /api/coupons/validate error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to validate coupon' } },
      { status: 500 }
    );
  }
}
