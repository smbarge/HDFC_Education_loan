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
      <!-- Logo and Title -->
      <div class="flex items-center gap-3 sm:gap-4">
            <div
              class="w-15 h-10 sm:w-19 sm:h-12 md:w-19 md:h-14 border-purple-200 rounded-lg flex items-center justify-center overflow-hidden"
            >
              <img
                src="/MaulanaAzad.jpg"
                alt="MAMFDC Logo"
                class="h-7 sm:h-12 md:h-14 w-auto object-contain"
              />
            </div>

            <div class="leading-tight">
              <h1 class="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                {t?.header?.title?.split(' Minorities ')[0]}
                <br />
                {t?.header?.title?.split(' Minorities ')[1]}
              </h1>

              <p class="text-[10px] sm:text-xs text-gray-600">
                {t?.header?.subtitle || 'A Govt. of Maharashtra Undertaking'}
              </p>
            </div>
          </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          on:click={() => changeLang('en')}
          class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition
          {lang === 'en'
            ? 'bg-purple-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          English
        </button>

        <button
          on:click={() => changeLang('hi')}
          class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition
          {lang === 'hi'
            ? 'bg-purple-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          हिंदी
        </button>

        <button
          on:click={() => changeLang('mr')}
          class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition
          {lang === 'mr'
            ? 'bg-purple-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          मराठी
        </button>
      </div>
    </div>
  </div>
</header>