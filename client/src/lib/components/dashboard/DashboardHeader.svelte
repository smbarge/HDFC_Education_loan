<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  
  export let t;
  export let locale;
  export let userData;
  
  const dispatch = createEventDispatcher();
  
  $: currentPath = $page.url.pathname.replace(`/${locale}`, '') || '';
  
  function changeLanguage(newLocale) {
    goto(`/${newLocale}${currentPath}`);
  }

  function goHome() {
    goto(`/${locale}/dashboard`);
  }

  function openProfile() {
    dispatch('openProfile');
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
        
        <!-- Language Switcher -->
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

        <!-- Profile Button -->
        <button
          on:click={openProfile}
          class="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all duration-200 group"
          aria-label="Open Profile"
        >
          <div class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
            {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span class="hidden md:inline text-sm font-medium">Profile</span>
          <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

    </div>
  </div>
</header>