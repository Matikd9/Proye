'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from './LanguageProvider';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type ProfileUpdatedDetail = {
  image?: string | null;
  name?: string | null;
};

export default function Navbar() {
  const { data: session, status, update } = useSession();
  const { t, locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  const navLinks = useMemo(() => {
    const links = [
      { href: '/', label: t('nav.home') },
      { href: '/events', label: t('nav.events') },
      { href: '/services', label: t('nav.services') },
    ];
    if (session) {
      links.push({ href: '/my-events', label: t('nav.myEvents') });
    }
    return links;
  }, [session, t]);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    setDisplayName(session.user.name || session.user.email);

    if (typeof session.user.image === 'string' && session.user.image.trim().length > 0) {
      setAvatarUrl(session.user.image);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user?.email || session.user.provider === 'google') {
      return;
    }

    let cancelled = false;

    const loadProfileAvatar = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (cancelled) {
          return;
        }
        if (data.user?.name) {
          setDisplayName(data.user.name);
        }
        if (Object.prototype.hasOwnProperty.call(data.user ?? {}, 'image')) {
          setAvatarUrl(data.user?.image ?? null);
        }
      } catch (error) {
        console.error('Error loading profile avatar', error);
      }
    };

    loadProfileAvatar();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email, session?.user?.provider]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail ?? {};
      if (detail.name) {
        setDisplayName(detail.name);
      }
      if (Object.prototype.hasOwnProperty.call(detail, 'image')) {
        setAvatarUrl(detail.image ?? null);
      }
      update?.({});
    };

    window.addEventListener('profileUpdated', handler);
    return () => {
      window.removeEventListener('profileUpdated', handler);
    };
  }, [update]);

  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </nav>
    );
  }

  const avatarSource = avatarUrl || session?.user?.image || '/default-avatar.png';
  const avatarIsDataUrl = (avatarUrl || session?.user?.image)?.startsWith?.('data:') ?? false;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="h-10 w-10 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-black flex items-center justify-center shadow-md">
              EP
            </div>
            <p className="leading-tight">
              <span className="text-lg font-black tracking-tight text-gray-900">Event </span>
              <span className="text-lg font-black bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">Planner</span>
            </p>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-semibold rounded-full px-4 py-2 transition-all ${
                  isActive(href)
                    ? 'bg-primary-600 text-white shadow-primary-200 shadow'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle language"
            >
              🌐 <span className="uppercase">{locale}</span>
            </button>

            {session ? (
              <>
                {/* Profile Link with Avatar */}
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Image
                    src={avatarSource}
                    alt={displayName || session?.user?.name || 'User'}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
                    unoptimized={avatarIsDataUrl}
                  />
                  <span className="text-sm font-medium text-gray-900 hidden sm:block">
                    {displayName || session.user?.name || session.user?.email}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                {t('common.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}