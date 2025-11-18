'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';
import { Plus, Calendar, Users, DollarSign, Sparkles } from 'lucide-react';

interface Event {
  _id: string;
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  budget?: number;
  estimatedCost?: number;
  createdAt: string;
}

export default function MyEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status, router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading', locale)}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.myEvents', locale)}</h1>
          <Link
            href="/events/create"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('events.createEvent', locale)}
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay eventos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer evento
            </p>
            <div className="mt-6">
              <Link
                href="/events/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('events.createEvent', locale)}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {t(`events.eventTypes.${event.eventType}`, locale) || event.eventType}
                  </h3>
                  {event.estimatedCost && (
                    <span className="text-sm font-medium text-primary-600">
                      ${event.estimatedCost.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.numberOfGuests} {t('events.numberOfGuests', locale)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.createdAt).toLocaleDateString(locale)}
                  </div>
                  {event.estimatedCost && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {t('events.estimatedCost', locale)}: ${event.estimatedCost.toLocaleString()}
                    </div>
                  )}
                </div>
                {event.estimatedCost && (
                  <div className="mt-4 flex items-center text-sm text-primary-600">
                    <Sparkles className="h-4 w-4 mr-1" />
                    {t('events.planEvent', locale)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

