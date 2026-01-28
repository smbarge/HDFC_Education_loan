import { writable } from 'svelte/store';

export const defaultLocale = 'en';

export const currentLanguage = writable<'en' | 'hi' | 'mr'>('en');
