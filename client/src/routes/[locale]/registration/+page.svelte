<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import Header from '$lib/components/landingpage/Header.svelte';
  import ProgressSteps from '$lib/components/registeration/ProgressSteps.svelte';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let formData = {
    name: '',
    mobile: ''
  };

  let errors = {
    name: '',
    mobile: ''
  };

  function validateName() {
    if (!formData.name) {
      errors.name = t.errors.nameRequired;
      return false;
    }
    if (formData.name.length < 3) {
      errors.name = t.errors.nameMinLength;
      return false;
    }
    errors.name = '';
    return true;
  }

  function validateMobile() {
    if (!formData.mobile) {
      errors.mobile = t.errors.mobileRequired;
      return false;
    }
    if (!/^[0-9]+$/.test(formData.mobile)) {
      errors.mobile = t.errors.mobileDigits;
      return false;
    }
    if (!/^[6-9]/.test(formData.mobile)) {
      errors.mobile = t.errors.mobileStart;
      return false;
    }
    if (formData.mobile.length !== 10) {
      errors.mobile = t.errors.mobileLength;
      return false;
    }
    errors.mobile = '';
    return true;
  }

  function handleSubmit() {
    const isNameValid = validateName();
    const isMobileValid = validateMobile();

    if (isNameValid && isMobileValid) {
      if (typeof window !== 'undefined') {
        window.__registrationData = {
          name: formData.name,
          mobile: formData.mobile
        };
      }
      goto(`/${locale}/registration/verify`); 
    }
  }

  function goHome() {
    goto(`/${locale}`);
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
  <Header />
  
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

  <ProgressSteps currentStep={1} {t} />

  <!-- ✅ Centered Container -->
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-sm font-medium text-purple-700">{t.step1.Government_Initiative}</span>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        {t.step1.title} 
      </h1>
      <p class="text-gray-600 mb-8">
        {t.step1.Register_to_apply_for_an_education_loan}
      </p>

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            {t.step1.fullName} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            on:blur={validateName}
            placeholder={t.step1.fullNamePlaceholder}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all {errors.name ? 'border-red-500 bg-red-50' : ''}"
          />
          {#if errors.name}
            <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {errors.name}
            </p>
          {/if}
        </div>

        <div>
          <label for="mobile" class="block text-sm font-medium text-gray-700 mb-2">
            {t.step1.mobile} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span class="text-gray-600 font-medium">+91</span>
            </div>
            <input
              type="tel"
              id="mobile"
              bind:value={formData.mobile}
              on:blur={validateMobile}
              placeholder={t.step1.mobilePlaceholder}
              maxlength="10"
              class="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all {errors.mobile ? 'border-red-500 bg-red-50' : ''}"
            />
          </div>
          {#if errors.mobile}
            <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {errors.mobile}
            </p>
          {/if}
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-900">
                {t.step1.Your_data_is_protected_by_Government_of_Maharashtra_security_standards} 
              </p>
              <p class="text-xs text-gray-600 mt-1">
                {t.step1.We_never_share_your_personal_information_with_third_parties}
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
        >
          {t.step1.sendCode}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          {t.step1.alreadyAccount} 
          <a href="/{locale}/login" class="text-purple-600 font-semibold hover:underline">
            {t.step1.login}
          </a>
        </p>
      </div>
    </div>
  </div>
</div>

<!-- <script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import Header from '$lib/components/landingpage/Header.svelte';
  import ProgressSteps from '$lib/components/registeration/ProgressSteps.svelte';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let formData = {
    name: '',
    mobile: ''
  };

  let errors = {
    name: '',
    mobile: ''
  };

  function validateName() {
    if (!formData.name) {
      errors.name = t.errors.nameRequired;
      return false;
    }
    if (formData.name.length < 3) {
      errors.name = t.errors.nameMinLength;
      return false;
    }
    errors.name = '';
    return true;
  }

  function validateMobile() {
    if (!formData.mobile) {
      errors.mobile = t.errors.mobileRequired;
      return false;
    }
    if (!/^[0-9]+$/.test(formData.mobile)) {
      errors.mobile = t.errors.mobileDigits;
      return false;
    }
    if (!/^[6-9]/.test(formData.mobile)) {
      errors.mobile = t.errors.mobileStart;
      return false;
    }
    if (formData.mobile.length !== 10) {
      errors.mobile = t.errors.mobileLength;
      return false;
    }
    errors.mobile = '';
    return true;
  }

  function handleSubmit() {
    const isNameValid = validateName();
    const isMobileValid = validateMobile();

    if (isNameValid && isMobileValid) {
      if (typeof window !== 'undefined') {
        window.__registrationData = {
          name: formData.name,
          mobile: formData.mobile
        };
      }
      goto(`/${locale}/registration/verify`); 
    }
  }

  function goHome() {
    goto(`/${locale}`);
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
  <Header />
  
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

  <ProgressSteps currentStep={1} {t} />

  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid lg:grid-cols-2 gap-12 items-start">
      
      <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-3">
            {t.step1.Education_Loan_for_Minority_Communities}
          </h2>
          <p class="text-gray-600 leading-relaxed">
            {t.step1.Register_now_to_apply_for_education_loans}
          </p>
        </div>

        <div class="rounded-2xl overflow-hidden shadow-lg">
          <img
            src="/images/resistration.jpg"
            alt="Student with education"
            class="w-full h-auto object-cover"
          />
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm font-medium text-purple-700">{t.step1.Government_Initiative}</span>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {t.step1.title} 
        </h1>
        <p class="text-gray-600 mb-8">
          {t.step1.Register_to_apply_for_an_education_loan}
        </p>

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              {t.step1.fullName} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              bind:value={formData.name}
              on:blur={validateName}
              placeholder={t.step1.fullNamePlaceholder}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all {errors.name ? 'border-red-500 bg-red-50' : ''}"
            />
            {#if errors.name}
              <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {errors.name}
              </p>
            {/if}
          </div>

          <div>
            <label for="mobile" class="block text-sm font-medium text-gray-700 mb-2">
              {t.step1.mobile} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-600 font-medium">+91</span>
              </div>
              <input
                type="tel"
                id="mobile"
                bind:value={formData.mobile}
                on:blur={validateMobile}
                placeholder={t.step1.mobilePlaceholder}
                maxlength="10"
                class="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all {errors.mobile ? 'border-red-500 bg-red-50' : ''}"
              />
            </div>
            {#if errors.mobile}
              <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {errors.mobile}
              </p>
            {/if}
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {t.step1.Your_data_is_protected_by_Government_of_Maharashtra_security_standards} 
                </p>
                <p class="text-xs text-gray-600 mt-1">
                  {t.step1.We_never_share_your_personal_information_with_third_parties}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
          >
            {t.step1.sendCode}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            {t.step1.alreadyAccount} 
            <a href="/{locale}/login" class="text-purple-600 font-semibold hover:underline">
              {t.step1.login}
            </a>
          </p>
        </div>
      </div>

    </div>
  </div>
</div> -->