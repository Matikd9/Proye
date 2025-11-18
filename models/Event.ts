import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  budget?: number;
  preferences?: string;
  estimatedCost?: number;
  aiPlan?: {
    suggestions: string[];
    breakdown: {
      category: string;
      items: string[];
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
    eventType: {
      type: String,
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
    budget: {
      type: Number,
      min: 0,
    },
    preferences: {
      type: String,
    },
    estimatedCost: {
      type: Number,
    },
    aiPlan: {
      suggestions: [String],
      breakdown: [
        {
          category: String,
          items: [String],
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

