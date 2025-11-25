import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';

interface ServicePayload {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  userId?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    await connectDB();

    const query = category ? { category } : {};
    const services = await Service.find(query).sort({ createdAt: -1 });

    return NextResponse.json(services);
  } catch (error: unknown) {
    console.error('Error fetching services:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ServicePayload = await request.json();

    await connectDB();

    const service = await Service.create(data);

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating service:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

