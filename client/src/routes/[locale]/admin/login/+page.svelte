<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';
import { adminLogin, validateAdminToken } from '$lib/api/adminapi.js';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let formData = { username: '', password: '' };
  let errors = {};
  let submitError = '';
  let isSubmitting = false;
  let showPassword = false;

 onMount(() => {
  const adminToken = document.cookie.match(/(?:^|; )adminTokenJS=([^;]*)/)?.[1]
                  || localStorage.getItem('adminToken') || '';
  if (adminToken && validateAdminToken(adminToken)) goto(`/${locale}/admin/dashboard`);
});

  function validateField(field) {
    if (field === 'username') {
      if (!formData.username.trim()) {
        errors = { ...errors, username: 'Username is required' };
      } else {
        const { username: _, ...rest } = errors; errors = rest;
      }
    }
    if (field === 'password') {
      if (!formData.password.trim()) {
        errors = { ...errors, password: 'Password is required' };
      } else {
        const { password: _, ...rest } = errors; errors = rest;
      }
    }
  }

  function validateForm() {
    errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.password.trim()) errors.password = 'Password is required';
    return Object.keys(errors).length === 0;
  }

async function handleLogin() {
  submitError = '';

  if (!validateForm()) return;

  isSubmitting = true;

  try {
        const result = await adminLogin(formData.username, formData.password);
            console.log('=== ADMIN LOGIN SUCCESS ===');
            console.log('Access Token:', result.access_token);

        if (result.error !== 0) {
        submitError = result.errorMsg;
        return;
        }

        // IF DONT WANT CONSOLE REMVE 
        try {
        const payload = JSON.parse(atob(result.access_token.split('.')[1]));
       // console.log('Token Payload (decoded):', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000).toLocaleString());
      } catch(e) {
        console.log('Could not decode token payload');
      }

        // store token + district
        // cookies set by server — keep these only as client-side fallback
        localStorage.setItem('adminToken', result.access_token);
        localStorage.setItem('adminDistrict', result.district || '');
        localStorage.setItem('adminUsername', result.username || '');

        goto(`/${locale}/admin/dashboard`);

  } catch (error) {
    submitError = error.message || "Server error. Please try again.";

  } finally {
    isSubmitting = false;
  }
}

  function handleKeydown(e) { if (e.key === 'Enter') handleLogin(); }
</script>

<svelte:head>
  <title>District Admin Login - MAMFDC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</svelte:head>

<div class="min-h-screen flex flex-col" style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #e0f2fe 100%)">

  <!-- Header — same as existing pages -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 lg:py-4 flex items-center justify-between">
      <!-- Logo + Title -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        <div class="flex-shrink-0">
          <img src="/MaulanaAzad.jpg" alt="MAMFDC Logo" class="h-8 sm:h-10 md:h-12 lg:h-[70px] w-auto object-contain"/>
        </div>
        <div class="leading-tight min-w-0 flex-1">
          <h1 class="text-xs sm:text-sm md:text-base lg:text-xl font-semibold text-gray-900 truncate">
            {t.header.title}
          </h1>
          <p class="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 truncate">
            {t?.header?.subtitle || 'A Govt. of Maharashtra Undertaking'}
          </p>
        </div>
      </div>
      <!-- Language switcher -->
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {#each [['en','English'],['hi','हिंदी'],['mr','मराठी']] as [code, label]}
          <button
            on:click={() => goto(`/${code}/admin/login`)}
            class="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md text-xs sm:text-sm lg:text-base font-medium transition-colors
              {locale === code ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
          >{label}</button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Back to Home -->
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7">
    <button
      on:click={() => goto(`/${locale}/admin`)}
      class="flex items-center gap-1.5 text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
      {t.loginPage.backToHome}
    </button>
  </div>

  <!-- Main Content -->
  <main class="flex-1 flex items-center justify-center px-4 py-8 lg:py-12">
    <div class="w-full max-w-4xl lg:max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

      <!-- LEFT — Illustration -->
      <div class="flex-1 flex items-center justify-center">
        <img
          src="/admin/login.png"
          alt="District Login"
          class="w-full max-w-sm lg:max-w-xl object-contain mix-blend-multiply"
        />
      </div>

      <!-- RIGHT — Login Card -->
      <div class="w-full max-w-sm lg:max-w-lg">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 lg:p-10">

          <!-- Title -->
          <h2 class="text-3xl lg:text-4xl font-bold text-purple-600 mb-6 lg:mb-8">{t.loginPage.districtLogin}</h2>

          <!-- Error -->
          {#if submitError}
            <div class="mb-4 lg:mb-5 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg class="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm lg:text-base text-red-600 font-medium">{submitError}</p>
            </div>
          {/if}

          <!-- User Name -->
          <div class="mb-4 lg:mb-5">
            <label class="block text-sm lg:text-base font-semibold text-gray-800 mb-1.5 lg:mb-2">
              {t.loginPage.username}
            </label>
            <input
              type="text"
              bind:value={formData.username}
              on:input={() => validateField('username')}
              on:keydown={handleKeydown}
              placeholder="Enter username"
              class="w-full px-4 lg:px-5 py-3 lg:py-3.5 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50
                {errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
            />
            {#if errors.username}
              <p class="mt-1 text-xs lg:text-sm text-red-600">{errors.username}</p>
            {/if}
          </div>

          <!-- Password -->
          <div class="mb-3 lg:mb-4">
            <div class="flex items-center justify-between mb-1.5 lg:mb-2">
              <label class="text-sm lg:text-base font-semibold text-gray-800">{t.loginPage.password}</label>
              <!-- View checkbox — exactly like reference image -->
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  bind:checked={showPassword}
                  class="w-3.5 h-3.5 lg:w-4 lg:h-4 accent-purple-600"
                />
                <span class="text-sm lg:text-base text-gray-600">View</span>
              </label>
            </div>
            {#if showPassword}
              <input
                type="text"
                bind:value={formData.password}
                on:input={() => validateField('password')}
                on:keydown={handleKeydown}
                placeholder="Enter password"
                class="w-full px-4 lg:px-5 py-3 lg:py-3.5 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50
                  {errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
              />
            {:else}
              <input
                type="password"
                bind:value={formData.password}
                on:input={() => validateField('password')}
                on:keydown={handleKeydown}
                placeholder="Enter password"
                class="w-full px-4 lg:px-5 py-3 lg:py-3.5 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50
                  {errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
              />
            {/if}
            {#if errors.password}
              <p class="mt-1 text-xs lg:text-sm text-red-600">{errors.password}</p>
            {/if}
          </div>

          <!-- Forgot Password -->
          <div class="mb-5 lg:mb-7">
            <button class="text-sm lg:text-base text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors">
              {t.loginPage.forgotPassword}
            </button>
          </div>

          <!-- Login Button -->
          <button
            on:click={handleLogin}
            disabled={isSubmitting}
            class="w-full py-3 lg:py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-base lg:text-lg shadow-md"
          >
            {#if isSubmitting}
              <span class="inline-flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4 lg:h-5 lg:w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            {:else}
              {t.loginPage.login}
            {/if}
          </button>

          <!-- Register link -->
          <p class="text-center text-sm lg:text-base text-gray-500 mt-4 lg:mt-5">
            {t.loginPage.noAccount}
            <button
              on:click={() => goto(`/${locale}/admin/register`)}
              class="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
            >
              {t.loginPage.registerHere}
            </button>
          </p>

        </div>
      </div>

    </div>
  </main>

</div>