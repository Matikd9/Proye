'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';
import { FullPageLoader } from '@/components/FullPageLoader';
import {
  Plus,
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  MapPin,
  Trash2,
  Edit2,
  Eye,
  CheckSquare,
  XSquare,
} from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  location: string;
  eventDate: string;
  budget?: number;
  estimatedCost?: number;
  currency?: string;
  createdAt: string;
  spendingStyle?: 'value' | 'balanced' | 'premium';
}

export default function MyEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

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
        setSelectedEvents(new Set());
        setSelectionMode(false);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      if (prev) {
        setSelectedEvents(new Set());
      }
      return !prev;
    });
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedEvents);
    if (!ids.length) return;
    if (!window.confirm(t('events.deleteSelectedConfirm', locale))) return;

    setBulkDeleting(true);
    try {
      const response = await fetch('/api/events/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (response.ok) {
        setEvents((prev) => prev.filter((event) => !ids.includes(event._id)));
        setSelectedEvents(new Set());
        setSelectionMode(false);
      } else {
        alert(t('common.error', locale));
      }
    } catch (error) {
      console.error('Error deleting events in bulk:', error);
      alert(t('common.error', locale));
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteSingle = async (eventId: string) => {
    if (!window.confirm(t('events.deleteSingleConfirm', locale))) return;

    setDeletingEventId(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents((prev) => prev.filter((event) => event._id !== eventId));
        setSelectedEvents((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        alert(t('common.error', locale));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(t('common.error', locale));
    } finally {
      setDeletingEventId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <FullPageLoader
        messageKey="myEventsPage.loading.title"
        descriptionKey="myEventsPage.loading.description"
      />
    );
  }

  if (!session) {
    return null;
  }

  const formatCurrency = (value: number, currency = 'CLP') =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.myEvents', locale)}</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            {events.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectionMode}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {selectionMode ? <XSquare className="h-5 w-5 mr-2" /> : <CheckSquare className="h-5 w-5 mr-2" />}
                {selectionMode ? t('events.cancelSelection', locale) : t('events.selectEvents', locale)}
              </button>
            )}
            {selectionMode && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedEvents.size === 0 || bulkDeleting}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                {bulkDeleting ? t('common.loading', locale) : t('events.deleteSelected', locale)}
              </button>
            )}
            <Link
              href="/events/create"
              className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('events.createEvent', locale)}
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('events.emptyStateTitle', locale)}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('events.emptyStateDescription', locale)}
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
            {events.map((event) => {
              const isSelected = selectedEvents.has(event._id);
              const translatedType = t(`events.eventTypes.${event.eventType}`, locale) || event.eventType;
              const displayName = event.name && event.name.trim().length > 0 ? event.name : translatedType;
              const eventDateText = (() => {
                const parsed = event.eventDate ? new Date(event.eventDate) : null;
                if (parsed && !isNaN(parsed.getTime())) {
                  return parsed.toLocaleDateString(locale);
                }
                return t('events.eventDatePlaceholder', locale);
              })();
              return (
                <div
                  key={event._id}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border ${
                    selectionMode && isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectEvent(event._id)}
                          className="mt-1 h-5 w-5 text-primary-600 border-gray-300 rounded"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{displayName}</h3>
                        <p className="text-sm text-gray-500">{translatedType}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(event.createdAt).toLocaleDateString(locale)}
                        </p>
                      </div>
                    </div>
                    {event.estimatedCost && (
                      <span className="text-sm font-medium text-primary-600">
                        {formatCurrency(event.estimatedCost, event.currency || 'CLP')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {t('events.eventDate', locale)}: {eventDateText}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.numberOfGuests} {t('events.numberOfGuests', locale)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {t('events.location', locale)}: {event.location}
                    </div>
                    {event.estimatedCost && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {t('events.estimatedCost', locale)}: {' '}
                        {formatCurrency(event.estimatedCost, event.currency || 'CLP')}
                      </div>
                    )}
                    {event.spendingStyle && (
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t('events.spendingStyle.short', locale)}: {t(`events.spendingStyle.${event.spendingStyle}`, locale)}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      href={`/events/${event._id}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('events.viewDetails', locale)}
                    </Link>
                    <Link
                      href={`/events/${event._id}/edit`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {t('events.editEvent', locale)}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(event._id)}
                      disabled={deletingEventId === event._id}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deletingEventId === event._id ? t('common.loading', locale) : t('events.deleteEvent', locale)}
                    </button>
                  </div>

                  {event.estimatedCost && (
                    <div className="mt-4 flex items-center text-sm text-primary-600">
                      <Sparkles className="h-4 w-4 mr-1" />
                      {t('events.planEvent', locale)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

