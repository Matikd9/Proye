'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

type FullPageLoaderProps = {
  messageKey?: string;
  descriptionKey?: string;
};

export function FullPageLoader({
  messageKey = 'loading.fullPage.title',
  descriptionKey = 'loading.fullPage.description',
}: FullPageLoaderProps) {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary-200"></div>
          <div className="absolute inset-0 m-auto h-16 w-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-gray-900">{t(messageKey, locale)}</p>
          <p className="text-sm text-gray-500">{t(descriptionKey, locale)}</p>
        </div>
      </div>
    </div>
  );
}
