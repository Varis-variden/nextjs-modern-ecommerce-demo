import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Address from '@/models/Address';

/**
 * GET /api/addresses
 *
 * Returns all saved addresses for the current session.
 * Reads the `sirin-session` cookie to identify the user.
 * Default address is returned first.
 */
export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sirin-session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'NO_SESSION', message: 'No session found' } },
        { status: 400 }
      );
    }

    const addresses = await Address.find({ sessionId })
      .sort({ isDefault: -1 }) // default address first
      .lean();

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('GET /api/addresses error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch addresses' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addresses
 *
 * Creates a new address for the current session.
 *
 * Body: {
 *   label: string,
 *   fullName: string,
 *   phone: string,
 *   addressLine1: string,
 *   addressLine2?: string,
 *   district: string,
 *   subDistrict: string,
 *   province: string,
 *   postalCode: string,
 *   isDefault?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sirin-session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'NO_SESSION', message: 'No session found' } },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'label',
      'fullName',
      'phone',
      'addressLine1',
      'district',
      'subDistrict',
      'province',
      'postalCode',
    ] as const;

    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
        return NextResponse.json(
          { error: { code: 'INVALID_INPUT', message: `${field} is required` } },
          { status: 400 }
        );
      }
    }

    // If this address is set as default, unset all other defaults for this session
    if (body.isDefault) {
      await Address.updateMany(
        { sessionId },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      sessionId,
      label: body.label.trim(),
      fullName: body.fullName.trim(),
      phone: body.phone.trim(),
      addressLine1: body.addressLine1.trim(),
      addressLine2: body.addressLine2?.trim() || '',
      district: body.district.trim(),
      subDistrict: body.subDistrict.trim(),
      province: body.province.trim(),
      postalCode: body.postalCode.trim(),
      isDefault: body.isDefault ?? false,
    });

    return NextResponse.json(address.toObject(), { status: 201 });
  } catch (error) {
    console.error('POST /api/addresses error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create address' } },
      { status: 500 }
    );
  }
}
