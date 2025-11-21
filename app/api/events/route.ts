import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const events = await Event.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

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

    const payload = {
      ...data,
      name,
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
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

