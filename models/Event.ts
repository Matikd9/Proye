import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  location: string;
  eventDate: Date;
  budget?: number;
  preferences?: string;
  currency?: string;
  spendingStyle?: 'value' | 'balanced' | 'premium';
  estimatedCost?: number;
  aiPlan?: {
    suggestions: string[];
    breakdown: {
      category: string;
      items: {
        name: string;
        price: number;
        source: string;
        notes?: string;
      }[];
      estimatedCost: number;
    }[];
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: 'Evento sin nombre',
    },
    eventType: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    ageRange: {
      type: String,
      required: true,
    },
    genderDistribution: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      default: 'Santiago, Chile',
    },
    budget: {
      type: Number,
      min: 0,
    },
    preferences: {
      type: String,
    },
    spendingStyle: {
      type: String,
      enum: ['value', 'balanced', 'premium'],
      default: 'balanced',
    },
    currency: {
      type: String,
      default: 'CLP',
      uppercase: true,
      trim: true,
    },
    estimatedCost: {
      type: Number,
    },
    aiPlan: {
      suggestions: [String],
      breakdown: [
        {
          category: String,
          items: [
            {
              name: String,
              price: Number,
              source: String,
              notes: String,
            },
          ],
          estimatedCost: Number,
        },
      ],
      recommendations: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

