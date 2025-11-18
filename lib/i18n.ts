import es from '@/locales/es.json';
import en from '@/locales/en.json';

export type Locale = 'es' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  es,
  en,
};

export function getTranslation(key: string, locale: Locale = 'es'): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
}

export function t(key: string, locale: Locale = 'es'): string {
  return getTranslation(key, locale);
}

