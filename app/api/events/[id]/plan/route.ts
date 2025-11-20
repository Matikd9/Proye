import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { generateEventPlan } from '@/lib/gemini';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language = 'es' } = await request.json();

    await connectDB();

    const event = await Event.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const plan = await generateEventPlan(
      {
        eventType: event.eventType,
        numberOfGuests: event.numberOfGuests,
        ageRange: event.ageRange,
        genderDistribution: event.genderDistribution,
        location: event.location,
        budget: event.budget,
        preferences: event.preferences,
        currency: event.currency,
      },
      language
    );

    event.estimatedCost = plan.estimatedCost;
    event.aiPlan = {
      suggestions: plan.suggestions,
      breakdown: plan.breakdown,
      recommendations: plan.recommendations,
    };

    await event.save();

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

