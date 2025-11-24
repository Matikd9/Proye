import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import authConfig from '../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

export async function GET() {
  try {
    const session = await getServerSession(authConfig as NextAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const events = await Event.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(events);
  } catch (error: unknown) {
    console.error('Error fetching events:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

type CreateEventPayload = {
  name?: string;
  eventDate?: string;
  spendingStyle?: 'value' | 'balanced' | 'premium';
  location?: string;
  currency?: string;
  budget?: number | string;
  [key: string]: unknown;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig as NextAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as CreateEventPayload;

    const name = typeof data.name === 'string' ? data.name.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const rawBudget =
      typeof data.budget === 'number'
        ? data.budget
        : typeof data.budget === 'string'
          ? Number(data.budget)
          : undefined;

    let eventDate: Date | null = null;
    if (data.eventDate) {
      const parsed = new Date(data.eventDate);
      if (!isNaN(parsed.getTime())) {
        eventDate = parsed;
      }
    }

    if (!eventDate) {
      return NextResponse.json({ error: 'Event date is required' }, { status: 400 });
    }

    const allowedSpendingStyles = ['value', 'balanced', 'premium'] as const;
    type SpendingStyle = (typeof allowedSpendingStyles)[number];
    const spendingStyle =
      typeof data.spendingStyle === 'string' && allowedSpendingStyles.includes(data.spendingStyle as SpendingStyle)
        ? (data.spendingStyle as SpendingStyle)
        : 'balanced';

    const payload = {
      ...data,
      name,
      eventDate,
      spendingStyle,
      location: typeof data.location === 'string' && data.location.trim().length > 0
        ? data.location.trim()
        : 'Santiago, Chile',
      currency: (data.currency || 'CLP').toString().toUpperCase(),
      budget: Number.isFinite(rawBudget) ? rawBudget : undefined,
    };

    await connectDB();

    const event = await Event.create({
      ...payload,
      userId: session.user.id,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating event:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

