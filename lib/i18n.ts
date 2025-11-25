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

function applyReplacements(value: string, replacements?: Record<string, string | number>): string {
  if (!replacements) {
    return value;
  }

  return Object.entries(replacements).reduce((acc, [placeholder, replacement]) => {
    const token = `{{${placeholder}}}`;
    return acc.split(token).join(String(replacement));
  }, value);
}

export function t(key: string, locale: Locale = 'es', replacements?: Record<string, string | number>): string {
  const value = getTranslation(key, locale);
  return applyReplacements(value, replacements);
}

