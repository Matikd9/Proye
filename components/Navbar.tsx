'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from './LanguageProvider';
import { t } from '@/lib/i18n';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const { locale, setLocale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-2 py-2 text-xl font-bold text-primary-600">
              Event Planner
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                {t('nav.home', locale)}
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                {t('nav.events', locale)}
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                {t('nav.services', locale)}
              </Link>
              {session && (
                <Link
                  href="/my-events"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                >
                  {t('nav.myEvents', locale)}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-sm">{locale.toUpperCase()}</span>
            </button>
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:block text-sm text-gray-700">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  {t('common.logout', locale)}
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                {t('common.login', locale)}
              </Link>
            )}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            <Link
              href="/"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.home', locale)}
            </Link>
            <Link
              href="/events"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.events', locale)}
            </Link>
            <Link
              href="/services"
              className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.services', locale)}
            </Link>
            {session && (
              <Link
                href="/my-events"
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.myEvents', locale)}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

