<script>
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

  const criteria = [
    {
      key: 'community',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-200'
    },
    {
      key: 'age',
      icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-200'
    },
    {
      key: 'income',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      hoverBorder: 'hover:border-green-200'
    },
    {
      key: 'documents',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      hoverBorder: 'hover:border-orange-200',
    }
  ];

  const checkIcon = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';

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

    const cards = document.querySelectorAll('.eligibility-card');
    cards.forEach((card) => observer.observe(card));

    const header = document.querySelector('.eligibility-header');
    if (header) observer.observe(header);

    const cta = document.querySelector('.eligibility-cta');
    if (cta) observer.observe(cta);

    const note = document.querySelector('.eligibility-note');
    if (note) observer.observe(note);

    return () => {
      if (observer) observer.disconnect();
    };
  });
</script>

<section class="pt-8 pb-6 md:pt-10 md:pb-8 bg-gradient-to-b from-white to-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Header -->
    <div 
      class="eligibility-header text-center mb-12 lg:mb-16 transition-all duration-700"
      class:opacity-0={!visibleItems.has('header')}
      class:translate-y-10={!visibleItems.has('header')}
      class:opacity-100={visibleItems.has('header')}
      class:translate-y-0={visibleItems.has('header')}
      data-index="header"
    >
      <h2 class="text-4xl font-bold text-gray-900 mb-4">
        {t?.eligibility?.title || 'Who Can Apply?'}
      </h2>
      <p class="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
        {t?.eligibility?.subtitle || 'Check if you meet the eligibility criteria for the education loan'}
      </p>
    </div>

    <!-- Eligibility Cards -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each criteria as criterion, index}
        <div 
          class="eligibility-card group relative bg-white rounded-2xl border-2 border-gray-200 {criterion.hoverBorder} p-6 transition-all duration-700 hover:shadow-xl hover:-translate-y-2"
          class:opacity-0={!visibleItems.has(String(index))}
          class:translate-y-12={!visibleItems.has(String(index))}
          class:scale-95={!visibleItems.has(String(index))}
          class:opacity-100={visibleItems.has(String(index))}
          class:translate-y-0={visibleItems.has(String(index))}
          class:scale-100={visibleItems.has(String(index))}
          class:delay-0={index % 4 === 0}
          class:delay-100={index % 4 === 1}
          class:delay-200={index % 4 === 2}
          class:delay-300={index % 4 === 3}
          data-index={index}
        >
          <!-- Icon -->
          <div class="w-14 h-14 {criterion.bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-7 h-7 {criterion.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={criterion.icon}/>
            </svg>
          </div>

          <!-- Title -->
          <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-4">
            {t?.eligibility?.[criterion.key]?.title || criterion.key}
          </h3>

          <!-- Items List -->
          <ul class="space-y-3">
            {#each (t?.eligibility?.[criterion.key]?.items || []) as item}
              <li class="flex items-start gap-2.5 text-sm md:text-base text-gray-700">
                <svg class="w-5 h-5 {criterion.iconColor} flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={checkIcon}/>
                </svg>
                <span class="leading-relaxed">{item}</span>
              </li>
            {/each}
          </ul>

          <!-- Decorative Element -->
          <div class="absolute -bottom-1 -right-1 w-20 h-20 {criterion.bgColor} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          
          <!-- Bottom accent line -->
          <div class="absolute bottom-0 left-0 right-0 h-1 {criterion.bgColor} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>
      {/each}
    </div>

    <!-- Optional CTA Section -->
    {#if t?.eligibility?.cta}
      <div 
        class="eligibility-cta mt-12 lg:mt-16 text-center transition-all duration-700"
        class:opacity-0={!visibleItems.has('cta')}
        class:scale-90={!visibleItems.has('cta')}
        class:opacity-100={visibleItems.has('cta')}
        class:scale-100={visibleItems.has('cta')}
        data-index="cta"
      >
        <div class="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-300">
          <svg class="w-12 h-12 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="text-left">
            <h4 class="text-lg font-bold text-gray-900 mb-1">{t.eligibility.cta.title}</h4>
            <p class="text-sm text-gray-600">{t.eligibility.cta.description}</p>
          </div>
          <button class="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 hover:scale-105 transition-all duration-200 whitespace-nowrap">
            {t.eligibility.cta.button || 'Check Eligibility'}
          </button>
        </div>
      </div>
    {/if}

    <!-- Bottom Note -->
    {#if t?.eligibility?.note}
      <div 
        class="eligibility-note mt-8 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-lg transition-all duration-700"
        class:opacity-0={!visibleItems.has('note')}
        class:-translate-x-10={!visibleItems.has('note')}
        class:opacity-100={visibleItems.has('note')}
        class:translate-x-0={visibleItems.has('note')}
        data-index="note"
      >
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm md:text-base text-gray-700 leading-relaxed">
            <span class="font-semibold text-gray-900">Note:</span> {t.eligibility.note}
          </p>
        </div>
      </div>
    {/if}
  </div>
</section>