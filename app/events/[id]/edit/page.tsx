'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

interface EventFormData {
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  location: string;
  budget: string;
  preferences: string;
}

export default function EditEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params?.id;
  const { locale } = useLanguage();
  const [formData, setFormData] = useState<EventFormData>({
    eventType: 'birthday',
    numberOfGuests: 10,
    ageRange: 'adults',
    genderDistribution: 'mixed',
    location: 'Santiago, Chile',
    budget: '',
    preferences: '',
  });
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && eventId) {
      fetchEvent();
    }
  }, [status, eventId, router]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          eventType: data.eventType,
          numberOfGuests: data.numberOfGuests,
          ageRange: data.ageRange,
          genderDistribution: data.genderDistribution,
          location: data.location,
          budget: data.budget ? data.budget.toString() : '',
          preferences: data.preferences || '',
        });
      } else {
        router.push('/my-events');
      }
    } catch (error) {
      router.push('/my-events');
    } finally {
      setLoadingEvent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseInt(formData.budget, 10) : undefined,
        }),
      });

      if (response.ok) {
        router.push(`/events/${eventId}`);
      } else {
        alert(t('common.error', locale));
      }
    } catch (error) {
      alert(t('common.error', locale));
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('common.loading', locale)}
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('events.editEvent', locale)}</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.location', locale)}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Santiago, Chile"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.eventType', locale)}
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="birthday">{t('events.eventTypes.birthday', locale)}</option>
              <option value="friends">{t('events.eventTypes.friends', locale)}</option>
              <option value="corporate">{t('events.eventTypes.corporate', locale)}</option>
              <option value="wedding">{t('events.eventTypes.wedding', locale)}</option>
              <option value="other">{t('events.eventTypes.other', locale)}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.numberOfGuests', locale)}
            </label>
            <input
              type="number"
              min="1"
              value={formData.numberOfGuests}
              onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.ageRange', locale)}
            </label>
            <select
              value={formData.ageRange}
              onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="children">{t('events.ageRanges.children', locale)}</option>
              <option value="teens">{t('events.ageRanges.teens', locale)}</option>
              <option value="adults">{t('events.ageRanges.adults', locale)}</option>
              <option value="seniors">{t('events.ageRanges.seniors', locale)}</option>
              <option value="mixed">{t('events.ageRanges.mixed', locale)}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.genderDistribution', locale)}
            </label>
            <select
              value={formData.genderDistribution}
              onChange={(e) => setFormData({ ...formData, genderDistribution: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="mixed">{t('events.genderOptions.mixed', locale)}</option>
              <option value="mostlyMale">{t('events.genderOptions.mostlyMale', locale)}</option>
              <option value="mostlyFemale">{t('events.genderOptions.mostlyFemale', locale)}</option>
              <option value="balanced">{t('events.genderOptions.balanced', locale)}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.budget', locale)} (CLP)
            </label>
            <input
              type="number"
              min="0"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: 250000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.preferences', locale)} (opcional)
            </label>
            <textarea
              value={formData.preferences}
              onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Preferencias especiales, temas, colores, etc."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel', locale)}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? t('common.loading', locale) : t('common.save', locale)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
