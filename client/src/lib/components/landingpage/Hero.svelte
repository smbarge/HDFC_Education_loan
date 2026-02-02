<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';  
  
  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];  
  
  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  function handleRegister() {
    goto(`/${locale}/registration`);
  }

  function handleLogin() {
    goto(`/${locale}/login`);
  }
</script>

<section class="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-8 pb-6 md:pt-10 md:pb-8 overflow-hidden">
  <div class="absolute inset-0 opacity-20">
    <div class="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl {mounted ? 'animate-bounce' : ''}" style="animation-duration: 3s;"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300 rounded-full blur-3xl {mounted ? 'animate-bounce' : ''}" style="animation-duration: 3s; animation-delay: 1.5s;"></div>
  </div>

  <div class="relative max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
   
      <div class="space-y-6 md:space-y-8">
      
        <div class="transition-all duration-700 delay-100"
             class:opacity-0={!mounted}
             class:translate-y-8={!mounted}
             class:opacity-100={mounted}
             class:translate-y-0={mounted}>
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full border border-purple-200">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            <span class="text-xs md:text-sm font-medium text-purple-500">{t.hero.badge}</span>
          </div>
        </div>

       
        <div class="space-y-4">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight transition-all duration-700 delay-200"
              class:opacity-0={!mounted}
              class:translate-y-8={!mounted}
              class:opacity-100={mounted}
              class:translate-y-0={mounted}>
            {t.hero.title}
          </h1>
          <p class="text-lg md:text-xl text-sky-600 font-semibold transition-all duration-700 delay-300"
             class:opacity-0={!mounted}
             class:translate-y-8={!mounted}
             class:opacity-100={mounted}
             class:translate-y-0={mounted}>
            {t.hero.subtitle}
          </p>
          <p class="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed transition-all duration-700 delay-500"
             class:opacity-0={!mounted}
             class:translate-y-8={!mounted}
             class:opacity-100={mounted}
             class:translate-y-0={mounted}>
            {t.hero.description}
          </p>
        </div>

       
        <div class="flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500"
             class:opacity-0={!mounted}
             class:translate-y-8={!mounted}
             class:opacity-100={mounted}
             class:translate-y-0={mounted}>
          <button
            on:click={handleRegister}
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-500 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
             {t.hero.startButton}
          </button>
          <button
            on:click={handleLogin}
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-500 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            {t.hero.loginButton}
          </button>
        </div>


        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div class="transition-all duration-700 delay-[600ms]"
               class:opacity-0={!mounted}
               class:scale-75={!mounted}
               class:opacity-100={mounted}
               class:scale-100={mounted}>
            <div class="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-900">{t.hero.features.loans}</span>
            </div>
          </div>

          <div class="transition-all duration-700 delay-700"
               class:opacity-0={!mounted}
               class:scale-75={!mounted}
               class:opacity-100={mounted}
               class:scale-100={mounted}>
            <div class="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-900">{t.hero.features.interest}</span>
            </div>
          </div>

          <div class="transition-all duration-700 delay-[800ms]"
               class:opacity-0={!mounted}
               class:scale-75={!mounted}
               class:opacity-100={mounted}
               class:scale-100={mounted}>
            <div class="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-900">{t.hero.features.processing}</span>
            </div>
          </div>

          <div class="transition-all duration-700 delay-[900ms]"
               class:opacity-0={!mounted}
               class:scale-75={!mounted}
               class:opacity-100={mounted}
               class:scale-100={mounted}>
            <div class="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-900">{t.hero.features.backed}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="relative hidden lg:flex h-full items-center gap-x-12 transition-all duration-700 delay-300"
           class:opacity-0={!mounted}
           class:translate-x-8={!mounted}
           class:opacity-100={mounted}
           class:translate-x-0={mounted}>
        <div class="relative w-full max-w-md h-[650px] rounded-2xl overflow-hidden shadow-lg">
          <img
            src="/images/Hero.jpg"
            alt="Education Loan Student"
            class="w-full h-full object-cover rounded-2xl"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
        </div>

        
        <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl"></div>
        <div class="absolute -top-6 -left-6 w-32 h-32 bg-purple-400/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  </div>
</section>


<!-- <script>
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/translations';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let lang = 'en';
  let mounted = false;
  
  const unsubscribe = currentLanguage.subscribe(value => {
    lang = value;
  });

  onMount(() => {
    mounted = true;
  });

  $: t = translations[lang] || translations['en'] || {
    hero: {
      badge: 'Government of Maharashtra Initiative',
      title: 'Education Loan for Minority Communities',
      subtitle: 'Empowering Dreams Through Financial Support',
      description: 'Get education loans up to ₹5,00,000 with subsidized interest rates for students from minority communities in Maharashtra. Simple application process, quick approval, and dedicated support.',
      startButton: 'Start Application',
      loginButton: 'Login to Continue',
      features: {
        loans: 'Loans up to ₹5 Lakh',
        interest: 'Low Interest Rates',
        processing: 'Quick Processing',
        backed: 'Government Backed'
      }
    }
  };

  function handleRegister() {
    goto('/registration');
  }

  function handleLogin() {
    goto('/login');
  }
</script>

<section class="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-8 pb-6 md:pt-10 md:pb-8 overflow-hidden">
  <div class="absolute inset-0 opacity-20">
    <div class="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl {mounted ? 'animate-bounce' : ''}" style="animation-duration: 3s;"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300 rounded-full blur-3xl {mounted ? 'animate-bounce' : ''}" style="animation-duration: 3s; animation-delay: 1.5s;"></div>
  </div>

  <div class="relative max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
   
      <div class="space-y-6 md:space-y-8">
      
        <div class="transition-all duration-700 delay-100"
             class:opacity-0={!mounted}
             class:translate-y-8={!mounted}
             class:opacity-100={mounted}
             class:translate-y-0={mounted}>
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full border border-purple-200">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            <span class="text-xs md:text-sm font-medium text-purple-500">{t?.hero?.badge}</span>
          </div>
        </div>

       
        <div class="space-y-4">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight transition-all duration-700 delay-200"
              class:opacity-0={!mounted}
              class:translate-y-8={!mounted}
              class:opacity-100={mounted}
              class:translate-y-0={mounted}>
            {t?.hero?.title}
          </h1>
          <p class="text-lg md:text-xl text-sky-600 font-semibold transition-all duration-700 delay-300"
             class:opacity-0={!mounted}
             class:translate-y-8={!mounted}
             class:opacity-100={mounted}
             class:translate-y-0={mounted}>
            {t?.hero?.subtitle}
          </p>
          <p class="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed transition-all duration-700 delay-500"
             class:opacity-0={!mounted}
             class:translate-y-8={!mounted}
             class:opacity-100={mounted}
             class:translate-y-0={mounted}>
            {t?.hero?.description}
          </p>
        </div>

       
        <div class="flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500"
             class:opacity-0={!mounted}
             class:translate-y-8={!mounted}
             class:opacity-100={mounted}
             class:translate-y-0={mounted}>
          <button
            on:click={handleRegister}
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-500 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
             {t?.hero?.startButton}
          </button>
          <button
            on:click={handleLogin}
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-500 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            {t?.hero?.loginButton}
          </button>
        </div>


        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div class="transition-all duration-700 delay-[600ms]"
               class:opacity-0={!mounted}
               class:scale-75={!mounted}
               class:opacity-100={mounted}
               class:scale-100={mounted}>
            <div class="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-900">{t?.hero?.features?.loans}</span>
            </div>
          </div>

          <div class="transition-all duration-700 delay-700"
               class:opacity-0={!mounted}
               class:scale-75={!mounted}
               class:opacity-100={mounted}
               class:scale-100={mounted}>
            <div class="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-900">{t?.hero?.features?.interest}</span>
            </div>
          </div>

          <div class="transition-all duration-700 delay-[800ms]"
               class:opacity-0={!mounted}
               class:scale-75={!mounted}
               class:opacity-100={mounted}
               class:scale-100={mounted}>
            <div class="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-900">{t?.hero?.features?.processing}</span>
            </div>
          </div>

          <div class="transition-all duration-700 delay-[900ms]"
               class:opacity-0={!mounted}
               class:scale-75={!mounted}
               class:opacity-100={mounted}
               class:scale-100={mounted}>
            <div class="flex flex-col items-center text-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-900">{t?.hero?.features?.backed}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="relative hidden lg:flex h-full items-center gap-x-12 transition-all duration-700 delay-300"
           class:opacity-0={!mounted}
           class:translate-x-8={!mounted}
           class:opacity-100={mounted}
           class:translate-x-0={mounted}>
        <div class="relative w-full max-w-md h-[650px] rounded-2xl overflow-hidden shadow-lg">
          <img
            src="/images/Hero.jpg"
            alt="Education Loan Student"
            class="w-full h-full object-cover rounded-2xl"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
        </div>

        
        <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl"></div>
        <div class="absolute -top-6 -left-6 w-32 h-32 bg-purple-400/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  </div>
</section> -->