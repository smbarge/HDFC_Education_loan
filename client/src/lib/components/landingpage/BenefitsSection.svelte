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

  const benefits = [
    { 
      key: 'maxLoan', 
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: 'text-purple-600'
    },
    { 
      key: 'interest', 
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      iconColor: 'text-purple-600'
    },
    { 
      key: 'repayment', 
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      iconColor: 'text-purple-600'
    },
    { 
      key: 'documentation', 
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      iconColor: 'text-purple-600'
    },
    { 
      key: 'approval', 
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: 'text-purple-600'
    },
    { 
      key: 'familyIncome', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      iconColor: 'text-purple-600'
    }
  ];

  onMount(() => {
    // Intersection Observer for scroll animations
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

    // Observe all benefit cards
    const cards = document.querySelectorAll('.benefit-card');
    cards.forEach((card) => observer.observe(card));

    // Observe header
    const header = document.querySelector('.benefits-header');
    if (header) observer.observe(header);

    return () => {
      if (observer) observer.disconnect();
    };
  });
</script>

<section class="pt-8 pb-6 md:pt-10 md:pb-8 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Header -->
    <div 
      class="benefits-header text-center mb-16 transition-all duration-700"
      class:opacity-0={!visibleItems.has('header')}
      class:translate-y-10={!visibleItems.has('header')}
      class:opacity-100={visibleItems.has('header')}
      class:translate-y-0={visibleItems.has('header')}
      data-index="header"
    >
      <h2 class="text-4xl font-bold text-gray-900 mb-4">
        {t?.benefits?.title || 'Loan Benefits & Features'}
      </h2>
      <p class="text-lg text-gray-600">
        {t?.benefits?.subtitle || 'Comprehensive financial support designed for your educational journey'}
      </p>
    </div>

    <!-- Benefits Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each benefits as benefit, index}
        <div 
          class="benefit-card bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-purple-300 transition-all duration-700 hover:-translate-y-1"
          class:opacity-0={!visibleItems.has(String(index))}
          class:scale-90={!visibleItems.has(String(index))}
          class:opacity-100={visibleItems.has(String(index))}
          class:scale-100={visibleItems.has(String(index))}
          class:delay-0={index % 3 === 0}
          class:delay-100={index % 3 === 1}
          class:delay-200={index % 3 === 2}
          data-index={index}
        >
          <!-- Icon and Title Row -->
          <div class="flex items-start gap-4 mb-4">
            <!-- Icon -->
            <div class="flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110">
              <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg class="w-8 h-8 {benefit.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={benefit.icon}/>
                </svg>
              </div>
            </div>

            <!-- Title and Amount -->
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-1">
                {t?.benefits?.[benefit.key]?.title || benefit.key}
              </h3>
              
              <!-- Amount/Value -->
              <p class="text-base font-semibold text-purple-600">
                {t?.benefits?.[benefit.key]?.amount || 
                 t?.benefits?.[benefit.key]?.rate || 
                 t?.benefits?.[benefit.key]?.period || 
                 t?.benefits?.[benefit.key]?.process || 
                 t?.benefits?.[benefit.key]?.time || 
                 t?.benefits?.[benefit.key]?.limit || ''}
              </p>
            </div>
          </div>

          <!-- Description -->
          <p class="text-base text-gray-600 leading-relaxed">
            {t?.benefits?.[benefit.key]?.description || ''}
          </p>

        </div>
      {/each}
    </div>
  </div>
</section>