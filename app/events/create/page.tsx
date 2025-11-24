'use client';

import { Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';
import { FullPageLoader } from '@/components/FullPageLoader';

function CreateEventForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const parseNumber = (value: string | null, fallback: number) => {
      if (!value) return fallback;
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    return {
      name: searchParams.get('name') ?? '',
      eventType: searchParams.get('eventType') ?? 'birthday',
      numberOfGuests: parseNumber(searchParams.get('numberOfGuests'), 10),
      ageRange: searchParams.get('ageRange') ?? 'adults',
      genderDistribution: searchParams.get('genderDistribution') ?? 'mixed',
      location: searchParams.get('location') ?? 'Santiago, Chile',
      eventDate: searchParams.get('eventDate') ?? today,
      budget: searchParams.get('budget') ?? '',
      preferences: searchParams.get('preferences') ?? '',
      spendingStyle: (searchParams.get('spendingStyle') as 'value' | 'balanced' | 'premium') ?? 'balanced',
    };
  });

  if (status === 'loading') {
    return <FullPageLoader />;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseInt(formData.budget, 10) : undefined,
          currency: 'CLP',
        }),
      });

      if (response.ok) {
        const event = await response.json();
        router.push(`/events/${event._id}`);
      } else {
        alert(t('common.error', locale));
      }
    } catch (error) {
      console.error('Error creating event', error);
      alert(t('common.error', locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('events.createEvent', locale)}</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('events.name', locale)}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('events.namePlaceholder', locale)}
              required
            />
          </div>
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
              {t('events.eventDate', locale)}
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfGuests: Number.parseInt(e.target.value, 10) || 1,
                })
              }
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
              {t('events.spendingStyle.label', locale)}
            </label>
            <select
              value={formData.spendingStyle}
              onChange={(e) => setFormData({ ...formData, spendingStyle: e.target.value as 'value' | 'balanced' | 'premium' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="value">{t('events.spendingStyle.value', locale)}</option>
              <option value="balanced">{t('events.spendingStyle.balanced', locale)}</option>
              <option value="premium">{t('events.spendingStyle.premium', locale)}</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">{t('events.spendingStyle.help', locale)}</p>
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
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? t('common.loading', locale) : t('common.create', locale)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <CreateEventForm />
    </Suspense>
  );
}

