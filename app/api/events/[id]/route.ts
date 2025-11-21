import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const event = await Event.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const updates: Record<string, any> = { ...data };

    if (typeof data.name === 'string') {
      const trimmed = data.name.trim();
      if (!trimmed) {
        return NextResponse.json({ error: 'Event name cannot be empty' }, { status: 400 });
      }
      updates.name = trimmed;
    }

    if (typeof data.location === 'string') {
      updates.location = data.location.trim().length > 0 ? data.location.trim() : 'Santiago, Chile';
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
  
        if (data.eventDate) {
          const parsed = new Date(data.eventDate);
          if (isNaN(parsed.getTime())) {
            return NextResponse.json({ error: 'Invalid event date' }, { status: 400 });
          }
          updates.eventDate = parsed;
        }

    await connectDB();

    const event = await Event.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

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
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

