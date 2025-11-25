import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authConfig from '../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword, verifyPassword } from '@/lib/auth';

const NAME_MIN = 2;
const NAME_MAX = 80;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const sanitizeName = (value?: unknown) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
    throw new Error(`Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`);
  }
  return trimmed;
};

const validateImageData = (value?: unknown) => {
  if (typeof value !== 'string' || !value) return undefined;
  if (!value.startsWith('data:image/')) {
    throw new Error('Invalid image format.');
  }
  const sizeInBytes = Math.ceil((value.length * 3) / 4);
  if (sizeInBytes > MAX_IMAGE_SIZE) {
    throw new Error('Image must be smaller than 2MB.');
  }
  return value;
};

const redactUser = (user: { _id: unknown; name: string; email: string; image?: string; provider: 'credentials' | 'google' }) => ({
  id: user._id?.toString(),
  name: user.name,
  email: user.email,
  image: user.image,
  provider: user.provider,
});

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).select('name email image provider');

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(redactUser(user));
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    if ('name' in payload) {
      const name = sanitizeName(payload.name);
      if (!name) {
        throw new Error('Name cannot be empty');
      }
      user.name = name;
    }

    if (user.provider === 'credentials') {
      if (payload.removeImage === true) {
        user.image = undefined;
      }

      if (typeof payload.imageData === 'string' && payload.imageData) {
        const picture = validateImageData(payload.imageData);
        if (picture) {
          user.image = picture;
        }
      }

      if (typeof payload.newPassword === 'string' && payload.newPassword) {
        if (typeof payload.currentPassword !== 'string' || !payload.currentPassword) {
          throw new Error('Current password is required.');
        }
        if (payload.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }
        if (payload.newPassword !== payload.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (!user.password || !(await verifyPassword(payload.currentPassword, user.password))) {
          throw new Error('Current password is incorrect.');
        }
        user.password = await hashPassword(payload.newPassword);
      }
    }

    await user.save();
    return NextResponse.json(redactUser(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update profile';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

