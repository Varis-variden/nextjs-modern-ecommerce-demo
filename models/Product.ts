import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  slug: string;
  sku?: string;
  name: { th: string; en: string };
  description: { th: string; en: string };
  ingredients: { th: string; en: string };
  category: 'face' | 'body' | 'hair' | 'home' | 'sets';
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  tags: ('new' | 'bestSeller' | 'limited')[];
  stock: number;
  reservedStock: { promotionId: mongoose.Types.ObjectId; qty: number }[];
  weight: number;
  isActive: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  slug: { type: String, unique: true, required: true },
  sku: String,
  name: {
    th: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: { th: String, en: String },
  ingredients: { th: String, en: String },
  category: {
    type: String,
    enum: ['face', 'body', 'hair', 'home', 'sets'],
    required: true,
  },
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [String],
  sizes: [String],
  tags: [{ type: String, enum: ['new', 'bestSeller', 'limited'] }],
  stock: { type: Number, default: 100 },
  reservedStock: [
    {
      promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
      qty: Number,
    },
  ],
  weight: { type: Number, default: 200 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);
