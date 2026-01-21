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

  const sections = [
    { 
      key: 'applicant', 
      icon: 'user',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-200'
    },
    { 
      key: 'coApplicant', 
      icon: 'users',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-200'
    },
    { 
      key: 'guarantorProperty', 
      icon: 'home',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-200'
    },
    { 
      key: 'guarantorLIC', 
      icon: 'shield',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-200'
    }
  ];

  const icons = {
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  };

  function formatItem(item) {
    if (!item) return { type: 'spacer' };
    
    const trimmed = item.trim();
    
    if (trimmed.endsWith(':')) {
      return { type: 'heading', text: trimmed };
    }
    
    if (trimmed.startsWith('•') || trimmed.startsWith('*')) {
      return { type: 'subitem', text: trimmed.substring(1).trim() };
    }
    
    return { type: 'item', text: trimmed };
  }

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

    const cards = document.querySelectorAll('.document-card');
    cards.forEach((card) => observer.observe(card));

    const header = document.querySelector('.documents-header');
    if (header) observer.observe(header);

    const note = document.querySelector('.documents-note');
    if (note) observer.observe(note);

    return () => {
      if (observer) observer.disconnect();
    };
  });
</script>

<section class="pt-8 pb-6 md:pt-10 md:pb-8 bg-gradient-to-b from-gray-50 to-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   
    <div 
      class="documents-header text-center mb-12 lg:mb-16 transition-all duration-700"
      class:opacity-0={!visibleItems.has('header')}
      class:translate-y-10={!visibleItems.has('header')}
      class:opacity-100={visibleItems.has('header')}
      class:translate-y-0={visibleItems.has('header')}
      data-index="header"
    >
      <h2 class="text-4xl font-bold text-gray-900 mb-4">
        {t?.documents?.title || 'Required Documents'}
      </h2>
      <p class="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
        {t?.documents?.subtitle || 'Please prepare the following documents for a smooth application process'}
      </p>
    </div>

   
    <div class="grid md:grid-cols-2 gap-6 lg:gap-8">
      {#each sections as section, index}
        <div class="document-card group relative bg-white rounded-2xl border-2 border-gray-200 {section.hoverBorder} p-6 lg:p-8 transition-all duration-700 hover:shadow-xl hover:-translate-y-1"
          class:opacity-0={!visibleItems.has(String(index))}
          class:-translate-x-12={!visibleItems.has(String(index)) && index % 2 === 0}
          class:translate-x-12={!visibleItems.has(String(index)) && index % 2 === 1}
          class:opacity-100={visibleItems.has(String(index))}
          class:translate-x-0={visibleItems.has(String(index))}
          class:delay-0={Math.floor(index / 2) === 0}
          class:delay-150={Math.floor(index / 2) === 1}
          data-index={index}
        >
          
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 {section.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg class="w-6 h-6 {section.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[section.icon]}/>
              </svg>
            </div>
            <h3 class="text-xl lg:text-2xl font-bold text-gray-900">
              {t?.documents?.[section.key]?.title || section.key}
            </h3>
          </div>

          <ul class="space-y-3">
            {#each (t?.documents?.[section.key]?.items || []) as item}
              {@const formatted = formatItem(item)}
              
              {#if formatted.type === 'spacer'}
                <div class="h-2"></div>
              {:else if formatted.type === 'heading'}
                <li class="font-semibold text-gray-900 mt-4 first:mt-0">
                  {formatted.text}
                </li>
              {:else if formatted.type === 'subitem'}
                <li class="flex items-start gap-2 ml-6 text-sm text-gray-600">
                  <span class="text-gray-400 mt-1 flex-shrink-0">•</span>
                  <span>{formatted.text}</span>
                </li>
              {:else}
                <li class="flex items-start gap-3 text-sm md:text-base text-gray-700 group/item">
                  <svg class="w-5 h-5 {section.iconColor} mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons.document}/>
                  </svg>
                  <span class="leading-relaxed">{formatted.text}</span>
                </li>
              {/if}
            {/each}
          </ul>

          
          <div class="absolute top-0 right-0 w-20 h-20 {section.iconBg} rounded-bl-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          
         
          <div class="absolute left-6 right-6 bottom-6">
          <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full {section.iconBg}
                        rounded-full
                        transform scale-x-0
                        group-hover:scale-x-100
                        transition-transform duration-500
                        origin-left">
            </div>
          </div>
        </div>

        </div>
      {/each}
    </div>

    {#if t?.documents?.note}
      <div 
        class="documents-note mt-8 lg:mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl hover:shadow-md transition-all duration-700"
        class:opacity-0={!visibleItems.has('note')}
        class:scale-90={!visibleItems.has('note')}
        class:opacity-100={visibleItems.has('note')}
        class:scale-100={visibleItems.has('note')}
        data-index="note"
      >
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm md:text-base text-gray-700 leading-relaxed">
            {t.documents.note}
          </p>
        </div>
      </div>
    {/if}
  </div>
</section>