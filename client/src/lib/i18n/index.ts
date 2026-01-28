import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';

export const i18n = {
  en,
  hi,
  mr
};

export type Language = keyof typeof i18n;
export type TranslationKeys = typeof en;