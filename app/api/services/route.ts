import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import connectDB from '@/lib/db';
import Service from '@/models/Service';
import authConfig from '../auth/[...nextauth]/config';
import { sanitizeOptionalText, sanitizeText } from '@/lib/sanitize';

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

const SERVICE_NAME_LIMIT = 120;
const CATEGORY_LIMIT = 60;
const PROVIDER_LIMIT = 120;
const DESCRIPTION_LIMIT = 2000;
const CONTACT_LIMIT = 160;
const PHONE_LIMIT = 60;
const IMAGE_LIMIT = 512;

const redactService = (service: unknown) => {
  if (!service) return service;
  const plain = typeof service === 'object' && service !== null && 'toObject' in service
    ? (service as { toObject: () => Record<string, unknown> }).toObject()
    : service;
  if (plain && typeof plain === 'object') {
    delete (plain as Record<string, unknown>).__v;
    delete (plain as Record<string, unknown>).providerId;
  }
  return plain;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig as NextAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    await connectDB();

    const sanitizedCategory = category
      ? sanitizeText(category, { maxLength: CATEGORY_LIMIT })
      : undefined;
    const query = sanitizedCategory ? { category: sanitizedCategory } : {};
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .select('-__v -providerId');

    return NextResponse.json(services.map((service) => redactService(service)));
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
    const session = await getServerSession(authConfig as NextAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = (await request.json()) as ServicePayload;

    await connectDB();

    const numericPrice =
      typeof data.price === 'number'
        ? data.price
        : typeof data.price === 'string'
          ? Number(data.price)
          : NaN;

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    const sanitized = {
      ...data,
      name: sanitizeText(data.name, { maxLength: SERVICE_NAME_LIMIT }),
      category: sanitizeText(data.category, { maxLength: CATEGORY_LIMIT }),
      provider: sanitizeText(data.provider, { maxLength: PROVIDER_LIMIT }),
      description: sanitizeOptionalText(data.description, { maxLength: DESCRIPTION_LIMIT }),
      contactEmail: sanitizeOptionalText(data.contactEmail, { maxLength: CONTACT_LIMIT }),
      contactPhone: sanitizeOptionalText(data.contactPhone, { maxLength: PHONE_LIMIT }),
      imageUrl: sanitizeOptionalText(data.imageUrl, { maxLength: IMAGE_LIMIT }),
      price: Math.round(numericPrice * 100) / 100,
      providerId: session.user.id,
    };

    if (!sanitized.name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

    if (!sanitized.provider || !sanitized.category) {
      return NextResponse.json({ error: 'Category and provider are required' }, { status: 400 });
    }

    const service = await Service.create(sanitized);

    return NextResponse.json(redactService(service), { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating service:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

