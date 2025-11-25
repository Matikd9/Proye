'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { t } from '@/lib/i18n';
import { Menu, X, Globe, LogOut, LogIn } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const { locale, setLocale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = useMemo(
    () => [
      { href: '/', label: t('nav.home', locale) },
      { href: '/events', label: t('nav.events', locale) },
      { href: '/services', label: t('nav.services', locale) },
      ...(session
        ? [{ href: '/my-events', label: t('nav.myEvents', locale) }]
        : []),
    ],
    [locale, session]
  );

  const displayName = useMemo(() => {
    if (session?.user?.name) return session.user.name;
    if (session?.user?.email) return session.user.email;
    return t('common.welcome', locale);
  }, [session?.user?.name, session?.user?.email, locale]);

  const initials = useMemo(() => {
    if (!displayName) return 'EV';
    const parts = displayName
      .trim()
      .split(' ')
      .filter(Boolean);
    if (!parts.length) return 'EV';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }, [displayName]);

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-black flex items-center justify-center shadow-md">
                EP
              </div>
              <div className="leading-tight">
                <div className="text-lg font-black tracking-tight text-gray-900">
                  Event <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">Planner</span>
                </div>
              </div>
            </Link>
            <div className="hidden md:flex md:items-center md:ml-6 md:space-x-2">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-primary-200 shadow-sm'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-100 bg-gradient-to-r from-white to-primary-50 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
              aria-label="Toggle language"
            >
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-600">
                <Globe className="h-4 w-4" />
              </div>
              <span className="tracking-wide text-gray-800">{locale.toUpperCase()}</span>
              <span className="text-xs text-gray-400">/ {locale === 'es' ? 'EN' : 'ES'}</span>
            </button>
            <button
              onClick={toggleLanguage}
              className="sm:hidden p-2 rounded-full border border-primary-100 text-primary-600 hover:bg-primary-50"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5" />
            </button>
            {session ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/profile"
                  aria-label={t('profile.view.openProfile', locale)}
                  className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user?.name || 'Avatar'}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold border border-primary-200">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-800 tracking-tight">
                    {displayName}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  {t('common.logout', locale)}
                </button>
                <button
                  onClick={() => signOut()}
                  className="sm:hidden p-2 rounded-full border border-gray-200 text-primary-600 hover:bg-primary-50"
                  aria-label={t('common.logout', locale)}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  {t('common.login', locale)}
                </Link>
                <Link
                  href="/auth/signin"
                  className="sm:hidden p-2 rounded-full border border-primary-200 text-primary-600 hover:bg-primary-50"
                  aria-label={t('common.login', locale)}
                >
                  <LogIn className="h-5 w-5" />
                </Link>
              </>
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
          <div className="px-4 pt-3 pb-6 space-y-2 bg-white border-t border-gray-100">
            {session && (
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-semibold text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user?.name || 'Avatar'}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-base font-bold border border-primary-200">
                    {initials}
                  </div>
                )}
                {t('profile.view.openProfile', locale)}
              </Link>
            )}
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2 rounded-xl text-base font-semibold ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-700 bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

