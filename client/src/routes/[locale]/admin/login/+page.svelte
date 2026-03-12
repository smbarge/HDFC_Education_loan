<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let formData = { username: '', password: '' };
  let errors = {};
  let submitError = '';
  let isSubmitting = false;
  let showPassword = false;

  onMount(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) goto(`/${locale}/admin/dashboard`);
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
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'adminLogin', username: formData.username, password: formData.password })
      });
      const result = await response.json();
      if (result.error !== 0) { submitError = result.errorMsg || 'Invalid username or password'; return; }
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminUser', JSON.stringify(result.user));
      goto(`/${locale}/admin/dashboard`);
    } catch (err) {
      submitError = 'Server error. Please try again.';
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

<div class="min-h-screen bg-white flex flex-col">

  <!-- Header — same as existing pages -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
      <!-- Logo + Title -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        <div class="flex-shrink-0">
          <img src="/MaulanaAzad.jpg" alt="MAMFDC Logo" class="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain"/>
        </div>
        <div class="leading-tight min-w-0 flex-1">
          <h1 class="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900 truncate">
            {t.header.title}
          </h1>
          <p class="text-[9px] sm:text-[10px] md:text-xs text-gray-600 truncate">
            {t?.header?.subtitle || 'A Govt. of Maharashtra Undertaking'}
          </p>
        </div>
      </div>
      <!-- Language switcher -->
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {#each [['en','English'],['hi','हिंदी'],['mr','मराठी']] as [code, label]}
          <button
            on:click={() => goto(`/${code}/admin/login`)}
            class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors
              {locale === code ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
          >{label}</button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Back to Home -->
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5">
    <button
      on:click={() => goto(`/${locale}/admin`)}
      class="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
      Back to Home
    </button>
  </div>

  <!-- Main Content -->
  <main class="flex-1 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

      <!-- LEFT — Illustration -->
      <div class="flex-1 flex items-center justify-center">
        <img
          src="/admin/login.png"
          alt="District Login"
          class="w-full max-w-sm lg:max-w-md object-contain rounded-2xl"
        />
      </div>

      <!-- RIGHT — Login Card -->
      <div class="w-full max-w-sm lg:max-w-md">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">

          <!-- Title -->
          <h2 class="text-3xl font-bold text-purple-600 mb-6">District Login</h2>

          <!-- Error -->
          {#if submitError}
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-600 font-medium">{submitError}</p>
            </div>
          {/if}

          <!-- User Name -->
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-800 mb-1.5">
              User Name
            </label>
            <input
              type="text"
              bind:value={formData.username}
              on:input={() => validateField('username')}
              on:keydown={handleKeydown}
              placeholder="Enter username"
              class="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50
                {errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
            />
            {#if errors.username}
              <p class="mt-1 text-xs text-red-600">{errors.username}</p>
            {/if}
          </div>

          <!-- Password -->
          <div class="mb-3">
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-sm font-semibold text-gray-800">Password</label>
              <!-- View checkbox — exactly like reference image -->
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  bind:checked={showPassword}
                  class="w-3.5 h-3.5 accent-purple-600"
                />
                <span class="text-sm text-gray-600">View</span>
              </label>
            </div>
            {#if showPassword}
              <input
                type="text"
                bind:value={formData.password}
                on:input={() => validateField('password')}
                on:keydown={handleKeydown}
                placeholder="Enter password"
                class="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50
                  {errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
              />
            {:else}
              <input
                type="password"
                bind:value={formData.password}
                on:input={() => validateField('password')}
                on:keydown={handleKeydown}
                placeholder="Enter password"
                class="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50
                  {errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
              />
            {/if}
            {#if errors.password}
              <p class="mt-1 text-xs text-red-600">{errors.password}</p>
            {/if}
          </div>

          <!-- Forgot Password -->
          <div class="mb-5">
            <button class="text-sm text-purple-600 hover:text-purple-800 font-medium underline underline-offset-2 transition-colors">
              Forgot Password?
            </button>
          </div>

          <!-- Login Button -->
          <button
            on:click={handleLogin}
            disabled={isSubmitting}
            class="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-base shadow-md"
          >
            {#if isSubmitting}
              <span class="inline-flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            {:else}
              Login
            {/if}
          </button>

          <!-- Register link -->
          <p class="text-center text-sm text-gray-500 mt-4">
            Don't have an account yet?
            <button
              on:click={() => goto(`/${locale}/admin/register`)}
              class="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
            >
              Register Here
            </button>
          </p>

        </div>
      </div>

    </div>
  </main>

</div>