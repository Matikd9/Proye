import es from '@/locales/es.json';
import en from '@/locales/en.json';

export type Locale = 'es' | 'en';

type TranslationNode = string | TranslationMap;
type TranslationMap = { [key: string]: TranslationNode };

const translations: Record<Locale, TranslationNode> = {
  es,
  en,
};

export function getTranslation(key: string, locale: Locale = 'es'): string {
  const keys = key.split('.');
  let value: TranslationNode = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as TranslationMap)[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
}

export function t(key: string, locale: Locale = 'es'): string {
  return getTranslation(key, locale);
}

