'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

export type ProfileOverviewData = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  provider: 'credentials' | 'google';
  createdAt: string;
  updatedAt: string;
};

const initialsFromName = (value: string) => {
  const clean = value.trim();
  if (!clean) return 'EV';
  const parts = clean.split(' ').filter(Boolean);
  if (!parts.length) return clean.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatDate = (value: string, locale: string, options: Intl.DateTimeFormatOptions) => {
  const formatter = new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', options);
  return formatter.format(new Date(value));
};

export function ProfileOverview({ user }: { user: ProfileOverviewData }) {
  const { locale } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={96}
            height={96}
            className="h-24 w-24 rounded-3xl object-cover border border-gray-100"
          />
        ) : (
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white flex items-center justify-center text-3xl font-black">
            {initialsFromName(user.name)}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-500">{t('profile.view.badge', locale)}</p>
          <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/profile/edit"
            className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700"
          >
            {t('profile.view.editButton', locale)}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            {t('profile.view.backHome', locale)}
          </Link>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('profile.view.providerLabel', locale)}</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {t(
              user.provider === 'google'
                ? 'profile.view.providerGoogle'
                : 'profile.view.providerCredentials',
              locale
            )}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t(
              user.provider === 'google'
                ? 'profile.view.providerDescGoogle'
                : 'profile.view.providerDescCredentials',
              locale
            )}
          </p>
        </article>
        <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('profile.view.memberSince', locale)}</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {formatDate(user.createdAt, locale, { dateStyle: 'long' })}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t('profile.view.lastUpdate', locale, {
              date: formatDate(user.updatedAt, locale, { dateStyle: 'long', timeStyle: 'short' }),
            })}
          </p>
        </article>
      </section>
    </div>
  );
}
