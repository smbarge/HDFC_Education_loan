import { goto } from '$app/navigation';

export const SUPPORTED_LOCALES = ['en', 'hi', 'mr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export function normalizeLocale(locale: string): Locale {
  return isValidLocale(locale) ? locale : 'en';
}

//  SAFETY CHECK ADDED
export function switchLocale(locale: Locale | undefined) {
  if (!locale) return;           
  goto(`/${locale}`);
}
