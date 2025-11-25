import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '../auth/[...nextauth]/config';
import db from '@/lib/db';
import User, { type IUser } from '@/models/User';
import bcrypt from 'bcryptjs';

interface ProfileUpdatePayload {
  name?: string;
  password?: string;
  image?: string | null;
  deleteImage?: boolean;
}

type SanitizedUser = Omit<IUser, 'password'> & { password?: undefined };

function toResponseUser(user: IUser): SanitizedUser {
  const userObj = user.toObject<IUser>();
  delete (userObj as Partial<IUser>).password;
  return userObj as SanitizedUser;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    await db();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user: toResponseUser(user) });
  } catch (error: unknown) {
    console.error('Error fetching profile:', error);
    const message = error instanceof Error ? error.message : 'Error del servidor';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const body: ProfileUpdatePayload = await request.json();
    const { name, password, image, deleteImage } = body;

    await db();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.provider === 'google') {
      if (password) {
        return NextResponse.json(
          { message: 'No puedes cambiar la contraseña de una cuenta vinculada con Google' },
          { status: 403 }
        );
      }
      if (deleteImage || image) {
        return NextResponse.json(
          { message: 'No puedes modificar la imagen de una cuenta de Google' },
          { status: 403 }
        );
      }
    }

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: 'La contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (deleteImage) {
      user.image = undefined;
    } else if (typeof image === 'string' && image.startsWith('data:')) {
      const sizeInBytes = (image.length * 3) / 4;
      if (sizeInBytes > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: 'La imagen no debe superar 5MB' },
          { status: 400 }
        );
      }
      user.image = image;
    }

    await user.save();

    return NextResponse.json({ user: toResponseUser(user) });
  } catch (error: unknown) {
    console.error('Error updating profile:', error);
    const message = error instanceof Error ? error.message : 'Error del servidor';
    return NextResponse.json({ message }, { status: 500 });
  }
}

