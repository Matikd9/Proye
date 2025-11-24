'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const { locale } = useLanguage();

  useEffect(() => {
    console.error('Global error boundary triggered', error);
  }, [error]);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white border border-gray-100 rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
              {t('errorPage.badge', locale)}
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('errorPage.title', locale)}
            </h1>
            <p className="text-gray-600">
              {t('errorPage.description', locale)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {t('errorPage.ctaRetry', locale)}
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              {t('errorPage.ctaHome', locale)}
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            {t('errorPage.footer', locale)}{' '}
            {process.env.NODE_ENV === 'development' && error.digest && (
              <span className="font-mono">({error.digest})</span>
            )}
          </p>
        </div>
      </body>
    </html>
  );
}
