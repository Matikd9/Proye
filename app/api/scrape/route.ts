import { NextRequest, NextResponse } from 'next/server';
import { scrapeEventServices } from '@/lib/webscraping';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'catering';
    const location = searchParams.get('location') || 'Chile';

    const services = await scrapeEventServices(category, location);

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Error scraping services:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

