<script>
  import { goto } from '$app/navigation';
  import Header from '$lib/components/landingpage/Header.svelte';
  import ProgressSteps from '$lib/components/registeration/ProgressSteps.svelte';
  import { currentLang } from '$lib/translations/resistration';
  import { i18n } from '$lib/translations/resistration';

  let lang = 'en';

  currentLang.subscribe(value => {
    lang = value;
  });

  $: t = (key) => i18n.t(lang, key);

  function handleSignIn() {
    goto('/login');
  }

  function goHome() {
    goto('/');
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
  <!-- Header -->
  <Header />
  
  <!-- Back to Home Button -->
  <div class="max-w-6xl mx-auto px-4 pt-6">
    <button
      on:click={goHome}
      class="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
      <span class="font-medium">Back to Home</span>
    </button>
  </div>

  <!-- Progress Steps -->
 <ProgressSteps currentStep={4} {t} />

  <!-- Main Content -->
  <div class="max-w-xl mx-auto px-4 py-12">
    <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      
      <!-- Success Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </div>

      <!-- Badge -->
      <div class="flex justify-center mb-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm font-medium text-green-700">{t('step4.Registration_Successful')}</span>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">
        {t('step4.success')}
      </h1>
      <p class="text-gray-600 mb-2 text-center">
        {t('step4.welcome')}
      </p>
      <p class="text-xl font-bold text-purple-600 mb-8 text-center">
        {t('step4.companyName')}
      </p>

      <!-- Success Message -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-sm font-medium text-gray-900">
              {t('step4.success')}
            </p>
            <p class="text-xs text-gray-600 mt-1">
              {t('step4.You_can_now_login_with_your_credentials_to_access_your_account_and_apply_for_education_loans')}
            </p>
          </div>
        </div>
      </div>

      <!-- Sign In Button -->
      <button
        on:click={handleSignIn}
        class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 mb-4"
      >
        {t('step4.signIn')}
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
      </button>

      <!-- Additional Info -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          {t('step4.description')}
        </p>
      </div>
    </div>
  </div>
</div>