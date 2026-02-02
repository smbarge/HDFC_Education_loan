<script>
  import { i18n } from '$lib/i18n';
  
  export let currentStep = 1;
  export let locale = 'en';
  
  $: t = i18n[locale];
  
  const steps = [
    { 
      id: 1, 
      icon: 'user-check'
    },
    { 
      id: 2, 
      icon: 'user'
    },
    { 
      id: 3, 
      icon: 'book'
    },
    { 
      id: 4, 
      icon: 'users'
    },
    { 
      id: 5, 
      icon: 'file'
    },
    { 
      id: 6, 
      icon: 'check-circle'
    }
  ];
</script>

<div class="w-full bg-white border-b border-gray-200 mb-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex items-center justify-between">
      {#each steps as step, index}
        <div class="flex flex-col items-center flex-1 relative">
          <!-- Step Circle -->
          <div class="flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 {currentStep >= step.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}">
            {#if step.icon === 'user-check'}
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            {:else if step.icon === 'user'}
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            {:else if step.icon === 'book'}
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            {:else if step.icon === 'users'}
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            {:else if step.icon === 'file'}
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            {:else if step.icon === 'check-circle'}
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            {/if}
          </div>
          
          <!-- Step Label -->
          <div class="mt-2 text-center">
            <p class="text-[0.65rem] sm:text-sm font-medium {currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'}">
              {t.stepper?.[`step${step.id}`] || ''}
            </p>
          </div>
          
          <!-- Connector Line -->
          {#if index < steps.length - 1}
            <div
              class="absolute top-7 h-0.5 {currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'}"
              style="left: calc(50% + 28px); width: calc(100% - 56px); transform: translateY(-50%);"
            ></div>
          {/if}

        </div>
      {/each}
    </div>
  </div>
</div>