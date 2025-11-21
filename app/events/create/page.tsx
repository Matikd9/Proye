'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'birthday',
    numberOfGuests: 10,
    ageRange: 'adults',
    genderDistribution: 'mixed',
    location: 'Santiago, Chile',
    eventDate: new Date().toISOString().split('T')[0],
    budget: '',
    preferences: '',
  });

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading', locale)}</div>;
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

