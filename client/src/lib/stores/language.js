import { writable } from 'svelte/store';

export const currentLanguage = writable('en');

export function setLanguage(lang) {
  currentLanguage.set(lang);
}

