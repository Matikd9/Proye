'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Locale, t as translate } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, forcedLocale?: Locale) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es');
  const value = useMemo<LanguageContextType>(() => ({
    locale,
    setLocale,
    t: (key: string, forcedLocale?: Locale) => translate(key, forcedLocale ?? locale),
  }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

