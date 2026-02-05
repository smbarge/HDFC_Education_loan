<script>
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale] || i18n['en'];

  let visibleItems = new Set();
  let observer;

  const stats = [
    {
      key: 'students',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      number: '50,000+',
      iconColor: 'text-purple-600'
    },
    {
      key: 'loans',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      number: '₹250 Cr+',
      iconColor: 'text-purple-600'
    },
    {
      key: 'approval',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      number: '98%',
      iconColor: 'text-purple-600'
    },
    {
      key: 'processing',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      number: '15 Days',
      iconColor: 'text-purple-600'
    }
  ];

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.dataset.index;
            visibleItems = new Set([...visibleItems, index]);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card) => observer.observe(card));

    const header = document.querySelector('.stats-header');
    if (header) observer.observe(header);

    return () => {
      if (observer) observer.disconnect();
    };
  });
</script>

<section class="pt-8 pb-6 md:pt-10 md:pb-8 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div 
      class="stats-header text-center mb-12 transition-all duration-700"
      class:opacity-0={!visibleItems.has('header')}
      class:translate-y-8={!visibleItems.has('header')}
      class:opacity-100={visibleItems.has('header')}
      class:translate-y-0={visibleItems.has('header')}
      data-index="header"
    >
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        {t.stats.title}
      </h2>
      <p class="text-base md:text-lg text-gray-600">
        {t.stats.tagline}
      </p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {#each stats as stat, index}
        <div 
          class="stat-card bg-white rounded-2xl border border-gray-200 p-6 md:p-8 text-center hover:shadow-lg transition-all duration-700"
          class:opacity-0={!visibleItems.has(String(index))}
          class:scale-90={!visibleItems.has(String(index))}
          class:opacity-100={visibleItems.has(String(index))}
          class:scale-100={visibleItems.has(String(index))}
          class:delay-0={index === 0}
          class:delay-100={index === 1}
          class:delay-200={index === 2}
          class:delay-300={index === 3}
          data-index={index}
        >
        
          <div class="flex justify-center mb-4">
            <svg class="w-8 h-8 {stat.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon}/>
            </svg>
          </div>

          <p class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {stat.number}
          </p>

          <p class="text-sm text-gray-600">
            {t.stats[stat.key]}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>


<!-- <script>
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/translations';
  import { onMount } from 'svelte';

  let lang = 'en';
  let visibleItems = new Set();
  let observer;
  
  const unsubscribe = currentLanguage.subscribe(value => {
    lang = value;
  });

  $: t = translations[lang] || translations['en'];

  const stats = [
    {
      key: 'students',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      number: '50,000+',
      iconColor: 'text-purple-600'
    },
    {
      key: 'loans',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      number: '₹250 Cr+',
      iconColor: 'text-purple-600'
    },
    {
      key: 'approval',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      number: '98%',
      iconColor: 'text-purple-600'
    },
    {
      key: 'processing',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      number: '15 Days',
      iconColor: 'text-purple-600'
    }
  ];

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.dataset.index;
            visibleItems = new Set([...visibleItems, index]);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card) => observer.observe(card));

    const header = document.querySelector('.stats-header');
    if (header) observer.observe(header);

    return () => {
      if (observer) observer.disconnect();
    };
  });
</script>

<section class="pt-8 pb-6 md:pt-10 md:pb-8 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div 
      class="stats-header text-center mb-12 transition-all duration-700"
      class:opacity-0={!visibleItems.has('header')}
      class:translate-y-8={!visibleItems.has('header')}
      class:opacity-100={visibleItems.has('header')}
      class:translate-y-0={visibleItems.has('header')}
      data-index="header"
    >
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        {t?.stats?.title || 'Trusted by Thousands'}
      </h2>
      <p class="text-base md:text-lg text-gray-600">
        {t?.stats?.tagline || 'A Government of Maharashtra Undertaking'}
      </p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {#each stats as stat, index}
        <div 
          class="stat-card bg-white rounded-2xl border border-gray-200 p-6 md:p-8 text-center hover:shadow-lg transition-all duration-700"
          class:opacity-0={!visibleItems.has(String(index))}
          class:scale-90={!visibleItems.has(String(index))}
          class:opacity-100={visibleItems.has(String(index))}
          class:scale-100={visibleItems.has(String(index))}
          class:delay-0={index === 0}
          class:delay-100={index === 1}
          class:delay-200={index === 2}
          class:delay-300={index === 3}
          data-index={index}
        >
        
          <div class="flex justify-center mb-4">
            <svg class="w-8 h-8 {stat.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stat.icon}/>
            </svg>
          </div>

     
          <p class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {stat.number}
          </p>

       
          <p class="text-sm text-gray-600">
            {t?.stats?.[stat.key] || stat.key}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section> -->