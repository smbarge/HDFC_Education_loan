<script>
  import { currentLanguage, setLanguage } from '$lib/stores/language';
  import { translations } from '$lib/translations';

  let lang = 'en';
  
  const unsubscribe = currentLanguage.subscribe(value => {
    lang = value;
  });

  $: t = translations[lang] || translations['en'] || {
    header: { 
      title: 'MAMFDC', 
      subtitle: 'A Govt. of Maharashtra Undertaking' 
    }
  };

  function changeLang(newLang) {
    setLanguage(newLang);
  }
</script>

<header class="bg-white shadow-md sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4">
      <!-- Logo + Title -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
        </div>

        <div>
          <h1 class="text-lg sm:text-xl font-bold text-gray-900">
            {t?.header?.title || 'MAMFDC'}
          </h1>
          <p class="text-xs text-gray-600">
            {t?.header?.subtitle || 'A Govt. of Maharashtra Undertaking'}
          </p>
        </div>
      </div>

      <!-- Language Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          on:click={() => changeLang('en')}
          class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition
          {lang === 'en'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          English
        </button>

        <button
          on:click={() => changeLang('hi')}
          class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition
          {lang === 'hi'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          हिंदी
        </button>

        <button
          on:click={() => changeLang('mr')}
          class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition
          {lang === 'mr'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          मराठी
        </button>
      </div>
    </div>
  </div>
</header>