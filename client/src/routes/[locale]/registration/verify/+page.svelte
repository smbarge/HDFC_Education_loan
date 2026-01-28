<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import Header from '$lib/components/landingpage/Header.svelte';
  import ProgressSteps from '$lib/components/registeration/ProgressSteps.svelte';

  // ✅ Get locale and translations reactively
  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let otp = '';
  let maskedPhone = '';
  let error = '';
  let resendDisabled = false;
  let countdown = 0;

  onMount(() => {
    if (typeof window !== 'undefined') {
      const data = window.__registrationData;
      if (!data) {
        goto(`/${locale}/registration`);
        return;
      }
      maskedPhone = `XXXXXX${data.mobile.slice(-4)}`;
    }
  });

  function validateOTP() {
    if (!otp) {
      error = t.errors.otpRequired;
      return false;
    }
    if (otp.length !== 6) {
      error = t.errors.otpLength;
      return false;
    }
    if (!/^[0-9]+$/.test(otp)) {
      error = t.errors.otpDigits;
      return false;
    }

    error = '';
    return true;
  }

  function handleVerify() {
    if (validateOTP()) {
      if (typeof window !== 'undefined') {
        window.__registrationData.otpVerified = true;
      }
      goto(`/${locale}/registration/create-account`);
    }
  }

  function handleResend() {
    resendDisabled = true;
    countdown = 30;
    
    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(interval);
        resendDisabled = false;
      }
    }, 1000);
    
    console.log('OTP resent');
  }

  function goBack() {
    goto(`/${locale}/registration`);
  }

  function goHome() {
    goto(`/${locale}`);
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
      <span class="font-medium">{t.login.backToHome}</span>
    </button>
  </div>

  <!-- Progress Steps -->
  <ProgressSteps currentStep={2} {t} />

  <!-- Main Content -->
  <div class="max-w-xl mx-auto px-4 py-12">
    <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <!-- Badge -->
      <div class="flex justify-left mb-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span class="text-sm font-medium text-purple-700">{t.step2.Secure_Verification}</span>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-gray-900 mb-2 text-left">
        {t.step2.title}
      </h1>
      <p class="text-gray-600 mb-2 text-left">
        {t.step2.otpSent}
      </p>
      <p class="text-purple-600 font-semibold mb-8 text-left">
        +91 {maskedPhone}
      </p>

      <!-- Form -->
      <form on:submit|preventDefault={handleVerify} class="space-y-6">
        
        <!-- OTP Input -->
        <div>
          <label for="otp" class="block text-sm font-medium text-gray-700 mb-2">
            {t.step2.enterOtp} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="otp"
            bind:value={otp}
            on:blur={validateOTP}
            on:input={() => error = ''}
            placeholder={t.step2.otpPlaceholder}
            maxlength="6"
            inputmode="numeric"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-semibold {error ? 'border-red-500 bg-red-50' : ''}"
          />
          {#if error}
            <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {error}
            </p>
          {/if}
        </div>

        <!-- Resend OTP -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            {t.step2.didntReceive}
            <button 
              type="button" 
              on:click={handleResend} 
              disabled={resendDisabled}
              class="text-purple-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline ml-1"
            >
              {#if resendDisabled}
                {t.step2.resendIn} {countdown}s
              {:else}
                {t.step2.resendOtp}
              {/if}
            </button>
          </p>
        </div>

        <!-- Timer Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-900">
                {t.step2.otpValid}
              </p>
              <p class="text-xs text-gray-600 mt-1">
                {t.step2.otpExpire}
              </p>
            </div>
          </div>
        </div>

        <!-- Verify Button -->
        <button
          type="submit"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
        >
          {t.step2.verifyOtp}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
      </form>

      <!-- Back Link -->
      <div class="mt-6 text-center">
        <button 
          on:click={goBack}
          class="text-sm text-gray-600 hover:text-purple-600 transition-colors"
        >
          ← {t.step2.Back_to_Registration}
        </button>
      </div>
    </div>
  </div>
</div>