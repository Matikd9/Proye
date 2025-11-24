import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';

type ServicePayload = {
  name: string;
  category: string;
  price: number;
  description?: string;
  provider: string;
  providerId?: string;
  contactEmail?: string;
  contactPhone?: string;
  imageUrl?: string;
  [key: string]: unknown;
};

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
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as ServicePayload;

    await connectDB();

    const service = await Service.create(data);

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating service:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

