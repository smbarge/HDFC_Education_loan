<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  
  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];
  
  $: currentPath = $page.url.pathname.replace(`/${locale}`, '') || '';
  
  function changeLanguage(newLocale) {
    goto(`/${newLocale}${currentPath}`);
  }

  function handleLogout() {
    // Redirect to login
    goto(`/${locale}/login`);
  }

  function goHome() {
    goto(`/${locale}/dashboard`);
  }
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
  <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
    <div class="flex justify-between items-center py-3 sm:py-4 gap-2 sm:gap-4">
      
      <button 
        on:click={goHome}
        class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity"
      >
        <!-- Logo -->
        <div class="flex-shrink-0">
          <img
            src="/MaulanaAzad.jpg"
            alt="MAMFDC Logo"
            class="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain"
          />
        </div>

        <div class="leading-tight min-w-0 flex-1 text-left">
          <h1 class="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900 truncate">
            {t.header.title}
          </h1>

          <p class="text-[9px] sm:text-[10px] md:text-xs text-gray-600 truncate">
            {t?.header?.subtitle || 'A Govt. of Maharashtra Undertaking'}
          </p>
        </div>
      </button>

      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        <div class="flex items-center gap-1 sm:gap-2">
          <button
            on:click={() => changeLanguage('en')}
            class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap
                   {locale === 'en' 
                     ? 'bg-purple-600 text-white' 
                     : 'text-gray-700 hover:bg-gray-100'}"
            aria-label="Switch to English"
          >
            <span class="hidden sm:inline">English</span>
            <span class="sm:hidden">EN</span>
          </button>
          
          <button
            on:click={() => changeLanguage('hi')}
            class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap
                   {locale === 'hi' 
                     ? 'bg-purple-600 text-white' 
                     : 'text-gray-700 hover:bg-gray-100'}"
            aria-label="Switch to Hindi"
          >
            <span class="hidden sm:inline">हिंदी</span>
            <span class="sm:hidden">हिं</span>
          </button>
          
          <button
            on:click={() => changeLanguage('mr')}
            class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap
                   {locale === 'mr' 
                     ? 'bg-purple-600 text-white' 
                     : 'text-gray-700 hover:bg-gray-100'}"
            aria-label="Switch to Marathi"
          >
            <span class="hidden sm:inline">मराठी</span>
            <span class="sm:hidden">मरा</span>
          </button>
        </div>

        <div class="hidden sm:block h-8 w-px bg-gray-300"></div>

        <button
          on:click={handleLogout}
          class="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-colors"
          aria-label="Logout"
        >
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="hidden sm:inline">{t.dashboard.logout}</span>
        </button>
      </div>

    </div>
  </div>
</header>