import es from '@/locales/es.json';
import en from '@/locales/en.json';

export type Locale = 'es' | 'en';

type TranslationNode = string | { [key: string]: TranslationNode };

const translations: Record<Locale, TranslationNode> = {
  es,
  en,
};

export function getTranslation(key: string, locale: Locale = 'es'): string {
  const keys = key.split('.');
  let value: TranslationNode = translations[locale];

  for (const k of keys) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.prototype.hasOwnProperty.call(value, k)
    ) {
      value = (value as Record<string, TranslationNode>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
}

export function t(key: string, locale: Locale = 'es'): string {
  return getTranslation(key, locale);
}

