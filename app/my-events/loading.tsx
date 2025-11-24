'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

const skeletonItems = Array.from({ length: 4 });

export default function MyEventsLoading() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            {t('myEventsPage.loading.badge', locale)}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('myEventsPage.loading.title', locale)}
          </h1>
          <p className="text-gray-600">
            {t('myEventsPage.loading.description', locale)}
          </p>
        </div>

        <div className="space-y-4">
          {skeletonItems.map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 animate-pulse"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded" />
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
                <div className="h-3 w-5/6 bg-gray-100 rounded" />
                <div className="h-3 w-4/5 bg-gray-100 rounded" />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="h-9 w-28 bg-gray-100 rounded" />
                <div className="h-9 w-24 bg-gray-100 rounded" />
                <div className="h-9 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
