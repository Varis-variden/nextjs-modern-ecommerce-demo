import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  size: string;
  qty: number;
  addedAt: Date;
}

export interface ICart extends Document {
  sessionId: string;
  items: ICartItem[];
  couponCode?: string;
  selectedAddressId?: string;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  size: String,
  qty: { type: Number, min: 1 },
  addedAt: { type: Date, default: Date.now },
});

const CartSchema = new Schema<ICart>({
  sessionId: { type: String, required: true, unique: true },
  items: [CartItemSchema],
  couponCode: String,
  selectedAddressId: String,
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Cart ||
  mongoose.model<ICart>('Cart', CartSchema);
