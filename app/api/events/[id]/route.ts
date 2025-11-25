import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authConfig from '../../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { sanitizeOptionalText, sanitizeText } from '@/lib/sanitize';

const allowedSpendingStyles = ['value', 'balanced', 'premium'] as const;
type SpendingStyle = (typeof allowedSpendingStyles)[number];
const EVENT_NAME_LIMIT = 120;
const LOCATION_LIMIT = 160;
const PREF_LIMIT = 1500;

const sanitizeEventResponse = (event: unknown) => {
  if (!event) return event;
  const obj = typeof event === 'object' && event !== null && 'toObject' in event
    ? (event as { toObject: () => Record<string, unknown> }).toObject()
    : event;
  if (obj && typeof obj === 'object') {
    delete (obj as Record<string, unknown>).userId;
    delete (obj as Record<string, unknown>).__v;
  }
  return obj;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const event = await Event.findOne({
      _id: params.id,
      userId: session.user.id,
    }).select('-userId -__v');

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(sanitizeEventResponse(event));
  } catch (error: unknown) {
    console.error('Error fetching event:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

type EventUpdatePayload = {
  name?: string;
  location?: string;
  currency?: string;
  budget?: number | string;
  spendingStyle?: SpendingStyle;
  eventDate?: string | Date;
  preferences?: string;
  [key: string]: unknown;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as Partial<EventUpdatePayload>;
    const updates: Record<string, unknown> = { ...data };

    if ('name' in data) {
      const name = sanitizeText(data.name, { maxLength: EVENT_NAME_LIMIT });
      if (!name) {
        return NextResponse.json({ error: 'Event name cannot be empty' }, { status: 400 });
      }
      updates.name = name;
    }

    if ('location' in data) {
      const location = sanitizeText(data.location ?? 'Santiago, Chile', {
        maxLength: LOCATION_LIMIT,
        allowEmpty: true,
        fallback: 'Santiago, Chile',
      }) || 'Santiago, Chile';
      updates.location = location;
    }

    if (typeof data.currency === 'string') {
      updates.currency = data.currency.toUpperCase();
    }

    if ('budget' in data) {
      const parsedBudget = typeof data.budget === 'number' ? data.budget : Number(data.budget);
      if (Number.isFinite(parsedBudget)) {
        updates.budget = parsedBudget;
      } else {
        delete updates.budget;
      }
    }
  
    if (typeof data.spendingStyle === 'string') {
      if (allowedSpendingStyles.includes(data.spendingStyle as SpendingStyle)) {
        updates.spendingStyle = data.spendingStyle as SpendingStyle;
      }
    }

    if (data.eventDate) {
      const parsed = new Date(data.eventDate);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid event date' }, { status: 400 });
      }
      updates.eventDate = parsed;
    }

    if ('preferences' in data) {
      updates.preferences = sanitizeOptionalText(data.preferences, { maxLength: PREF_LIMIT });
    }

    await connectDB();

    const event = await Event.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      updates,
      { new: true, runValidators: true, projection: '-userId -__v' }
    );

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: unknown) {
    console.error('Error updating event:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const event = await Event.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting event:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

