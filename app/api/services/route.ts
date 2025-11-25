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
  region: string;
  city?: string;
  contactEmail?: string;
  contactPhone?: string;
  imageUrl?: string;
  contactUrl?: string;
  [key: string]: unknown;
};

const SERVICE_NAME_LIMIT = 120;
const CATEGORY_LIMIT = 60;
const PROVIDER_LIMIT = 120;
const DESCRIPTION_LIMIT = 2000;
const CONTACT_LIMIT = 160;
const PHONE_LIMIT = 60;
const IMAGE_LIMIT = 512;
const REGION_LIMIT = 80;
const CITY_LIMIT = 80;
const URL_LIMIT = 512;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    const region = searchParams.get('region');
    const city = searchParams.get('city');
    const search = searchParams.get('q');

    await connectDB();

    const sanitizedCategory = category
      ? sanitizeText(category, { maxLength: CATEGORY_LIMIT })
      : undefined;
    const sanitizedRegion = region
      ? sanitizeText(region, { maxLength: REGION_LIMIT })
      : undefined;
    const sanitizedCity = city
      ? sanitizeText(city, { maxLength: CITY_LIMIT })
      : undefined;
    const sanitizedSearch = search
      ? sanitizeText(search, { maxLength: SERVICE_NAME_LIMIT })
      : undefined;

    const query: Record<string, unknown> = {};
    if (sanitizedCategory && sanitizedCategory !== 'all') {
      query.category = sanitizedCategory;
    }
    if (sanitizedRegion) {
      query.region = sanitizedRegion;
    }
    if (sanitizedCity) {
      query.city = sanitizedCity;
    }
    if (sanitizedSearch) {
      const escaped = escapeRegExp(sanitizedSearch);
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { provider: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

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
      region: sanitizeText(data.region, { maxLength: REGION_LIMIT }),
      city: sanitizeOptionalText(data.city, { maxLength: CITY_LIMIT }),
      description: sanitizeOptionalText(data.description, { maxLength: DESCRIPTION_LIMIT }),
      contactEmail: sanitizeOptionalText(data.contactEmail, { maxLength: CONTACT_LIMIT }),
      contactPhone: sanitizeOptionalText(data.contactPhone, { maxLength: PHONE_LIMIT }),
      imageUrl: sanitizeOptionalText(data.imageUrl, { maxLength: IMAGE_LIMIT }),
      contactUrl: sanitizeOptionalText(data.contactUrl, { maxLength: URL_LIMIT }),
      price: Math.round(numericPrice * 100) / 100,
      providerId: session.user.id,
    };

    if (!sanitized.name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

    if (!sanitized.provider || !sanitized.category || !sanitized.region) {
      return NextResponse.json({ error: 'Category, provider, and region are required' }, { status: 400 });
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

