'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Calendar, Users, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

const featureCards = [
  { icon: Calendar, titleKey: 'home.features.smartPlanning.title', descriptionKey: 'home.features.smartPlanning.description' },
  { icon: Users, titleKey: 'home.features.network.title', descriptionKey: 'home.features.network.description' },
  { icon: Sparkles, titleKey: 'home.features.costs.title', descriptionKey: 'home.features.costs.description' },
  { icon: TrendingUp, titleKey: 'home.features.ods.title', descriptionKey: 'home.features.ods.description' },
];

const odsCards = [
  { titleKey: 'home.ods8Title', descriptionKey: 'home.ods8Description' },
  { titleKey: 'home.ods12Title', descriptionKey: 'home.ods12Description' },
];

export default function Home() {
  const { data: session } = useSession();
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('home.heroTitle', locale)}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.heroSubtitle', locale)}
          </p>
          {!session && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                {t('home.ctaPrimary', locale)}
              </Link>
              <Link
                href="/services"
                className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                {t('home.ctaSecondary', locale)}
              </Link>
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureCards.map(({ icon: Icon, titleKey, descriptionKey }) => (
            <div key={titleKey} className="bg-white p-6 rounded-lg shadow-md">
              <Icon className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t(titleKey, locale)}</h3>
              <p className="text-gray-600">{t(descriptionKey, locale)}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-primary-600 text-white rounded-lg p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            {t('home.odsTitle', locale)}
          </h2>
          <p className="text-lg md:text-xl text-center mb-8 max-w-3xl mx-auto">
            {t('home.odsDescription', locale)}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {odsCards.map(({ titleKey, descriptionKey }) => (
              <div key={titleKey} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-2xl font-semibold mb-3">{t(titleKey, locale)}</h3>
                <p className="text-lg">{t(descriptionKey, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

