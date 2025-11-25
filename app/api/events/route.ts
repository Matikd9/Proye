import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authConfig from '../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

type SpendingStyle = 'value' | 'balanced' | 'premium';

interface EventPayload {
  name?: string;
  eventType?: string;
  numberOfGuests?: number;
  ageRange?: string;
  genderDistribution?: string;
  location?: string;
  eventDate?: string;
  budget?: number | string;
  preferences?: string;
  spendingStyle?: SpendingStyle | string;
  currency?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const events = await Event.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json(events);
  } catch (error: unknown) {
    console.error('Error fetching events:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: EventPayload = await request.json();

    const name = typeof data.name === 'string' ? data.name.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const rawBudget =
      typeof data.budget === 'number'
        ? data.budget
        : data.budget
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

    const allowedSpendingStyles: SpendingStyle[] = ['value', 'balanced', 'premium'];
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

