<script>
  export let currentStep = 1;
  export let t; 
</script>

<div class="bg-white border-b border-gray-200 mt-4">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between">
      <!-- Step 1 -->
      <div class="flex flex-col items-center flex-1">
        <div class="relative">
          <div class="w-12 h-12 {currentStep >= 1 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white shadow-md mb-2">
            {#if currentStep > 1}
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            {:else}
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            {/if}
          </div>
        </div>
        <p class="text-xs font-semibold {currentStep >= 1 ? 'text-purple-600' : 'text-gray-500'}">
          {t.step1.Mobile_No_and_Name}
        </p>
      </div>

      <div class="flex-1 h-0.5 {currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'} mx-2"></div>

      <!-- Step 2 -->
      <div class="flex flex-col items-center flex-1">
        <div class="w-12 h-12 {currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center {currentStep >= 2 ? 'text-white' : 'text-gray-500'} mb-2">
          {#if currentStep > 2}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          {/if}
        </div>
        <p class="text-xs {currentStep >= 2 ? 'text-purple-600 font-semibold' : 'text-gray-500'}">
          {t.step1.OTP_Verification}
        </p>
      </div>

      <div class="flex-1 h-0.5 {currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'} mx-2"></div>

      <!-- Step 3 -->
      <div class="flex flex-col items-center flex-1">
        <div class="w-12 h-12 {currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center {currentStep >= 3 ? 'text-white' : 'text-gray-500'} mb-2">
          {#if currentStep > 3}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          {/if}
        </div>
        <p class="text-xs {currentStep >= 3 ? 'text-purple-600 font-semibold' : 'text-gray-500'}">
          {t.step1.Create_Account}
        </p>
      </div>

      <div class="flex-1 h-0.5 {currentStep >= 4 ? 'bg-purple-600' : 'bg-gray-300'} mx-2"></div>

      <!-- Step 4 -->
      <div class="flex flex-col items-center flex-1">
        <div class="w-12 h-12 {currentStep >= 4 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center {currentStep >= 4 ? 'text-white' : 'text-gray-500'} mb-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if currentStep >= 4}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            {/if}
          </svg>
        </div>
        <p class="text-xs {currentStep >= 4 ? 'text-purple-600 font-semibold' : 'text-gray-500'}">
          {t.step1.Completed}
        </p>
      </div>
    </div>
  </div>
</div>

<!-- <script>
  export let currentStep = 1; // 1, 2, 3, or 4
  export let t = (key) => key; // Translation function passed from parent
</script>

<div class="bg-white border-b border-gray-200 mt-4">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between">
      
      <div class="flex flex-col items-center flex-1">
        <div class="relative">
          <div class="w-12 h-12 {currentStep >= 1 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white shadow-md mb-2">
            {#if currentStep > 1}
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            {:else}
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            {/if}
          </div>
        </div>
        <p class="text-xs font-semibold {currentStep >= 1 ? 'text-purple-600' : 'text-gray-500'}">
          {t('step1.Mobile_No_and_Name')}
        </p>
      </div>

      <div class="flex-1 h-0.5 {currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'} mx-2"></div>


      <div class="flex flex-col items-center flex-1">
        <div class="w-12 h-12 {currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center {currentStep >= 2 ? 'text-white' : 'text-gray-500'} mb-2">
          {#if currentStep > 2}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          {/if}
        </div>
        <p class="text-xs {currentStep >= 2 ? 'text-purple-600 font-semibold' : 'text-gray-500'}">
          {t('step1.OTP_Verification')}
        </p>
      </div>

      <div class="flex-1 h-0.5 {currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'} mx-2"></div>

      <div class="flex flex-col items-center flex-1">
        <div class="w-12 h-12 {currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center {currentStep >= 3 ? 'text-white' : 'text-gray-500'} mb-2">
          {#if currentStep > 3}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          {/if}
        </div>
        <p class="text-xs {currentStep >= 3 ? 'text-purple-600 font-semibold' : 'text-gray-500'}">
          {t('step1.Create_Account')}
        </p>
      </div>

      <div class="flex-1 h-0.5 {currentStep >= 4 ? 'bg-purple-600' : 'bg-gray-300'} mx-2"></div>

   
      <div class="flex flex-col items-center flex-1">
        <div class="w-12 h-12 {currentStep >= 4 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center {currentStep >= 4 ? 'text-white' : 'text-gray-500'} mb-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if currentStep >= 4}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            {/if}
          </svg>
        </div>
        <p class="text-xs {currentStep >= 4 ? 'text-purple-600 font-semibold' : 'text-gray-500'}">
          {t('step1.Completed')}
        </p>
      </div>
    </div>
  </div>
</div> -->