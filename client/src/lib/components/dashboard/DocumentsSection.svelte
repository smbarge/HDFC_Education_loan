<script>
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale] || i18n['en'];

  const sections = [
    { 
      key: 'applicant',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    { 
      key: 'coApplicant',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    { 
      key: 'guarantorProperty',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    { 
      key: 'guarantorLIC',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    }
  ];

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
</script>

<!-- Required Documents Section -->
<section class="mb-12">
  <div class="text-center mb-8">
    <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
      {t.documents?.title || 'Required Documents'}
    </h2>
    <p class="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
      {t.documents?.subtitle || 'Please prepare the following documents for a smooth application process'}
    </p>
  </div>

  <div class="grid md:grid-cols-2 gap-6 max-w-8xl mx-auto">
    {#each sections as section}
      <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
        
        <!-- Header -->
        <div class="flex items-center gap-3 mb-5">
          <div class="w-12 h-12 {section.iconBg} rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 {section.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={section.icon}/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">
            {t.documents?.[section.key]?.title || section.key}
          </h3>
        </div>

        <!-- Document List -->
        <ul class="space-y-2.5">
          {#each (t.documents?.[section.key]?.items || []) as item}
            {@const formatted = formatItem(item)}
            
            {#if formatted.type === 'spacer'}
              <div class="h-2"></div>
            {:else if formatted.type === 'heading'}
              <li class="font-semibold text-gray-900 mt-3 first:mt-0 text-sm">
                {formatted.text}
              </li>
            {:else if formatted.type === 'subitem'}
              <li class="flex items-start gap-2 ml-6 text-sm text-gray-600">
                <span class="text-gray-400 mt-1">•</span>
                <span>{formatted.text}</span>
              </li>
            {:else}
              <li class="flex items-start gap-2.5 text-sm text-gray-700">
                <svg class="w-4 h-4 {section.iconColor} mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span class="leading-relaxed">{formatted.text}</span>
              </li>
            {/if}
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <!-- Note Section -->
  {#if t.documents?.note}
    <div class="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl max-w-6xl mx-auto">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-sm text-gray-700 leading-relaxed">
          {t.documents.note}
        </p>
      </div>
    </div>
  {/if}
</section>