import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import Address from '@/models/Address';

/**
 * PUT /api/addresses/[id]
 *
 * Updates an existing address. Only the session owner can update their address.
 * Body can include any address fields to update.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid address ID' } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sirin-session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'NO_SESSION', message: 'No session found' } },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Ensure the address belongs to this session
    const existing = await Address.findOne({ _id: id, sessionId });
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Address not found' } },
        { status: 404 }
      );
    }

    // If setting as default, unset all other defaults for this session
    if (body.isDefault) {
      await Address.updateMany(
        { sessionId, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    // Build update object — only allow known address fields
    const allowedFields = [
      'label',
      'fullName',
      'phone',
      'addressLine1',
      'addressLine2',
      'district',
      'subDistrict',
      'province',
      'postalCode',
      'isDefault',
    ] as const;

    const update: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
      }
    }

    const updated = await Address.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/addresses/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update address' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/addresses/[id]
 *
 * Deletes an address by ID. Only the session owner can delete their address.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid address ID' } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sirin-session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'NO_SESSION', message: 'No session found' } },
        { status: 400 }
      );
    }

    // Only allow deleting addresses that belong to this session
    const deleted = await Address.findOneAndDelete({ _id: id, sessionId });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Address not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/addresses/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete address' } },
      { status: 500 }
    );
  }
}
