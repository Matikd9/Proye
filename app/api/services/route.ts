import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    await connectDB();

    const query = category ? { category } : {};
    const services = await Service.find(query).sort({ createdAt: -1 });

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    await connectDB();

    const service = await Service.create(data);

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

