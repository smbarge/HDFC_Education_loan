import type { LayoutLoad } from './$types';
import { normalizeLocale } from '$lib/utils/locale';
import { i18n } from '$lib/i18n';

export const load: LayoutLoad = ({ params }) => {
  const locale = normalizeLocale(params.locale);

  return {
    locale,
    t: i18n[locale]
  };
};


