import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  sessionId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  district: string;
  subDistrict: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>({
  sessionId: String,
  label: String,
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  district: String,
  subDistrict: String,
  province: String,
  postalCode: String,
  isDefault: { type: Boolean, default: false },
});

export default mongoose.models.Address ||
  mongoose.model<IAddress>('Address', AddressSchema);
