'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

const skeletonCards = Array.from({ length: 6 });

export default function EventsLoading() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            {t('events.loading.badge', locale)}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('events.loading.title', locale)}
          </h1>
          <p className="text-gray-600 max-w-2xl">
            {t('events.loading.description', locale)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletonCards.map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 animate-pulse space-y-5"
            >
              <div className="space-y-3">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-5/6 bg-gray-100 rounded" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-24 bg-gray-200 rounded" />
                <div className="h-10 w-20 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
