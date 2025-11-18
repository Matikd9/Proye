import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string; // Optional for OAuth users
  name: string;
  image?: string;
  provider: 'credentials' | 'google';
  providerId?: string; // For OAuth providers
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return this.provider === 'credentials';
      },
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    providerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

