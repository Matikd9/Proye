import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';
import { sanitizeOptionalText, sanitizeText } from '@/lib/sanitize';

type ServicePayload = {
  name?: string;
  category?: string;
  price?: number;
  description?: string;
  provider?: string;
  providerId?: string;
  region?: string;
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
const REGION_LIMIT = 80;
const CITY_LIMIT = 80;
const CONTACT_LIMIT = 160;
const PHONE_LIMIT = 60;
const IMAGE_LIMIT = 512;
const URL_LIMIT = 512;

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

const parsePrice = (value: unknown) => {
  if (value === undefined || value === null) return undefined;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new Error('Invalid price');
  }
  return Math.round(numeric * 100) / 100;
};

const sanitizeUpdatePayload = (data: ServicePayload) => {
  const update: Record<string, unknown> = {};

  if (data.name !== undefined) {
    const value = sanitizeText(data.name, { maxLength: SERVICE_NAME_LIMIT });
    if (!value) {
      throw new Error('Service name cannot be empty');
    }
    update.name = value;
  }

  if (data.category !== undefined) {
    const value = sanitizeText(data.category, { maxLength: CATEGORY_LIMIT });
    if (!value) {
      throw new Error('Category cannot be empty');
    }
    update.category = value;
  }

  if (data.provider !== undefined) {
    const value = sanitizeText(data.provider, { maxLength: PROVIDER_LIMIT });
    if (!value) {
      throw new Error('Provider cannot be empty');
    }
    update.provider = value;
  }

  if (data.region !== undefined) {
    const value = sanitizeText(data.region, { maxLength: REGION_LIMIT });
    if (!value) {
      throw new Error('Region cannot be empty');
    }
    update.region = value;
  }

  if (data.city !== undefined) {
    update.city = sanitizeOptionalText(data.city, { maxLength: CITY_LIMIT });
  }

  if (data.description !== undefined) {
    update.description = sanitizeOptionalText(data.description, { maxLength: DESCRIPTION_LIMIT });
  }

  if (data.contactEmail !== undefined) {
    update.contactEmail = sanitizeOptionalText(data.contactEmail, { maxLength: CONTACT_LIMIT });
  }

  if (data.contactPhone !== undefined) {
    update.contactPhone = sanitizeOptionalText(data.contactPhone, { maxLength: PHONE_LIMIT });
  }

  if (data.imageUrl !== undefined) {
    update.imageUrl = sanitizeOptionalText(data.imageUrl, { maxLength: IMAGE_LIMIT });
  }

  if (data.contactUrl !== undefined) {
    update.contactUrl = sanitizeOptionalText(data.contactUrl, { maxLength: URL_LIMIT });
  }

  if (data.price !== undefined) {
    update.price = parsePrice(data.price);
  }

  return update;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const service = await Service.findById(params.id);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(redactService(service));
  } catch (error: unknown) {
    console.error('Error fetching service:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = (await request.json()) as ServicePayload;
    const update = sanitizeUpdatePayload(data);

    await connectDB();

    const service = await Service.findByIdAndUpdate(
      params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(redactService(service));
  } catch (error: unknown) {
    console.error('Error updating service:', error);
    const isValidationError = error instanceof Error && (
      error.message === 'Invalid price' ||
      error.message.includes('cannot be empty')
    );
    const status = isValidationError ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const service = await Service.findByIdAndDelete(params.id);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting service:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

