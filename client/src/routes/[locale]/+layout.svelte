<script lang="ts">
  import { currentLanguage } from '$lib/stores/language';

  export let data;
  const { locale } = data;

  currentLanguage.set(locale);
</script>

<slot />
