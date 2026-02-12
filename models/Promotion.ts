import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotionTier {
  threshold: number;
  discountPercent?: number;
  discountFixed?: number;
  giftProductId?: mongoose.Types.ObjectId;
}

export interface IPromotion extends Document {
  slug: string;
  type:
    | 'bogo'
    | 'gwp'
    | 'bundle'
    | 'tier_discount'
    | 'tier_gwp'
    | 'category_discount'
    | 'cashback';
  name: { th: string; en: string };
  description: { th: string; en: string };
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  conditions: {
    productIds?: mongoose.Types.ObjectId[];
    categoryIds?: string[];
    minQty?: number;
    minSpend?: number;
    tiers?: IPromotionTier[];
  };
  rewards: {
    discountPercent?: number;
    discountFixed?: number;
    freeProductId?: mongoose.Types.ObjectId;
    freeProductQty?: number;
    cashbackPercent?: number;
    bundlePrice?: number;
    bundleProductIds?: mongoose.Types.ObjectId[];
  };
  stockAllocation?: number;
  usageCount: number;
  maxUsage?: number;
}

const PromotionSchema = new Schema<IPromotion>({
  slug: { type: String, unique: true },
  type: {
    type: String,
    enum: [
      'bogo',
      'gwp',
      'bundle',
      'tier_discount',
      'tier_gwp',
      'category_discount',
      'cashback',
    ],
    required: true,
  },
  name: { th: String, en: String },
  description: { th: String, en: String },
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  conditions: {
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    categoryIds: [String],
    minQty: Number,
    minSpend: Number,
    tiers: [
      {
        threshold: Number,
        discountPercent: Number,
        discountFixed: Number,
        giftProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
      },
    ],
  },
  rewards: {
    discountPercent: Number,
    discountFixed: Number,
    freeProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
    freeProductQty: { type: Number, default: 1 },
    cashbackPercent: Number,
    bundlePrice: Number,
    bundleProductIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  stockAllocation: Number,
  usageCount: { type: Number, default: 0 },
  maxUsage: Number,
});

PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export default mongoose.models.Promotion ||
  mongoose.model<IPromotion>('Promotion', PromotionSchema);
