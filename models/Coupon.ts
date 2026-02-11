import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percent' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  conditions: {
    categoryIds?: string[];
    productIds?: mongoose.Types.ObjectId[];
  };
  usageLimit: number;
  usageCount: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, uppercase: true, unique: true, required: true },
  type: {
    type: String,
    enum: ['percent', 'fixed', 'free_shipping'],
    required: true,
  },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  conditions: {
    categoryIds: [String],
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  usageLimit: { type: Number, default: 9999 },
  usageCount: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.Coupon ||
  mongoose.model<ICoupon>('Coupon', CouponSchema);
