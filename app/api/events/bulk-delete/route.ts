import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import authConfig from '../../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

type BulkDeletePayload = {
  ids: string[];
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig as NextAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = (await request.json()) as Partial<BulkDeletePayload>;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No event ids provided' },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Event.deleteMany({
      _id: { $in: ids },
      userId: session.user.id,
    });

    return NextResponse.json({ deletedCount: result.deletedCount ?? 0 });
  } catch (error: unknown) {
    console.error('Error deleting events:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
