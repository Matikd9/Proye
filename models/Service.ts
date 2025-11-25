import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IService extends Document {
  name: string;
  category: string;
  price: number;
  description?: string;
  provider: string;
  providerId?: mongoose.Types.ObjectId; // If provider is a registered user
  region: string;
  city?: string;
  contactEmail?: string;
  contactPhone?: string;
  imageUrl?: string;
  contactUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['catering', 'decoration', 'photography', 'music', 'venue', 'other'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
    },
    provider: {
      type: String,
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    region: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    contactUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;

