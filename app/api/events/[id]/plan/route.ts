import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authConfig from '../../../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { generateEventPlan } from '@/lib/gemini';

type PlanRequestPayload = {
  language?: string;
};

export async function POST(
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
    const body: (await request.json()) as Partial<PlanRequestPayload>;
    const language = typeof body.language === 'string' ? body.language : 'es';

    await connectDB();

    const event = await Event.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventDateString = event.eventDate instanceof Date
      ? event.eventDate.toISOString()
      : typeof event.eventDate === 'string'
        ? event.eventDate
        : undefined;

    const plan = await generateEventPlan(
      {
        name: event.name || event.eventType,
        eventType: event.eventType,
        numberOfGuests: event.numberOfGuests,
        ageRange: event.ageRange,
        genderDistribution: event.genderDistribution,
        location: event.location,
        eventDate: eventDateString,
        budget: event.budget,
        preferences: event.preferences,
        spendingStyle: event.spendingStyle,
        currency: event.currency,
      },
      language
    );

    event.name = event.name || event.eventType;
    event.estimatedCost = plan.estimatedCost;
    event.aiPlan = {
      suggestions: plan.suggestions,
      breakdown: plan.breakdown,
      recommendations: plan.recommendations,
    };

    await event.save();

    return NextResponse.json(plan);
  } catch (error: unknown) {
    console.error('Error generating plan:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

