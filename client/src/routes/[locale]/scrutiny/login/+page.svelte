<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';
  import { validateScrutinyToken, clearScrutinySession } from '$lib/api/stateapi.js';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let formData = { username: '', password: '' };
  let errors = {};
  let submitError = '';
  let isSubmitting = false;
  let showPassword = false;

  // ── If already logged in, skip to dashboard ───────────────────────────────
  onMount(() => {
    const token = localStorage.getItem('scrutinyToken')
      || document.cookie.match(/(?:^|; )scrutinyTokenJS=([^;]*)/)?.[1] || '';

    if (token && validateScrutinyToken(token)) {
      goto(`/${locale}/scrutiny/dashboard`);
    }
  });

  // ── Validation ─────────────────────────────────────────────────────────────
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

  // ── Login handler ──────────────────────────────────────────────────────────
  async function handleLogin() {
    submitError = '';
    if (!validateForm()) return;

    isSubmitting = true;

    try {
      // ── Step 1: Call scrutiny auth endpoint ──
      const response = await fetch('/api/scrutiny/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',          // sends/receives HttpOnly cookies
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok || data.error !== 0) {
        submitError = data.errorMsg || 'Invalid credentials. Please try again.';
        return;
      }

      console.log('=== SCRUTINY LOGIN SUCCESS ===');
      console.log('User:', data.username);

      // ── Step 2: Save to localStorage BEFORE navigating ──
      localStorage.setItem('scrutinyToken',    data.access_token);
      localStorage.setItem('scrutinyUsername', data.username || formData.username);
      localStorage.setItem('scrutinyUser',     JSON.stringify({
        username: data.username || formData.username
      }));

      // ── Step 3: Write JS-readable cookies as belt-and-suspenders backup ──
      document.cookie = `scrutinyTokenJS=${data.access_token}; Path=/; SameSite=Strict; Max-Age=86400`;
      document.cookie = `scrutinyUsername=${data.username || formData.username}; Path=/; SameSite=Strict; Max-Age=86400`;

      // ── Step 4: Confirm storage actually worked ──
      const saved = localStorage.getItem('scrutinyToken');
      console.log('Token persisted to localStorage:', saved ? 'YES' : 'NO — private/incognito may block this');

      // ── Step 5: Flush delay — give browser time to commit storage ──
      await new Promise(resolve => setTimeout(resolve, 80));

      // ── Step 6: Navigate ──
      goto(`/${locale}/scrutiny/dashboard`);

    } catch (err) {
      console.error('Scrutiny login error:', err);
      submitError = 'Server error. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') handleLogin();
  }
</script>

<svelte:head>
  <title>Scrutiny Login - MAMFDC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</svelte:head>

<div class="min-h-screen flex flex-col" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #e0f2fe 100%)">

  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 lg:py-4 flex items-center justify-between">
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        <div class="flex-shrink-0">
          <img src="/MaulanaAzad.jpg" alt="MAMFDC Logo"
            class="h-8 sm:h-10 md:h-12 lg:h-[70px] w-auto object-contain"/>
        </div>
        <div class="leading-tight min-w-0 flex-1">
          <h1 class="text-xs sm:text-sm md:text-base lg:text-xl font-semibold text-gray-900 truncate">
            {t?.header?.title || 'MAMFDC'}
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
            on:click={() => goto(`/${code}/scrutiny/login`)}
            class="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
              {locale === code ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
          >{label}</button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Back button -->
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7">
    <button
      on:click={() => goto(`/${locale}`)}
      class="flex items-center gap-1.5 text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
      Back to Home
    </button>
  </div>

  <!-- Main -->
  <main class="flex-1 flex items-center justify-center px-4 py-8 lg:py-12">
    <div class="w-full max-w-4xl lg:max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

      <!-- Left — illustration -->
      <div class="flex-1 flex items-center justify-center">
        <img
          src="/admin/login.png"
          alt="Scrutiny Login"
          class="w-full max-w-sm lg:max-w-xl object-contain mix-blend-multiply"
        />
      </div>

      <!-- Right — login card -->
      <div class="w-full max-w-sm lg:max-w-lg">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 lg:p-10">

          <!-- Title -->
          <div class="mb-6 lg:mb-8">
            <h2 class="text-3xl lg:text-4xl font-bold text-green-600">Scrutiny Login</h2>
            <p class="text-sm text-gray-500 mt-1">State-level application review portal</p>
          </div>

          <!-- Error banner -->
          {#if submitError}
            <div class="mb-4 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-600 font-medium">{submitError}</p>
            </div>
          {/if}

          <!-- Username -->
          <div class="mb-4 lg:mb-5">
            <label class="block text-sm lg:text-base font-semibold text-gray-800 mb-1.5">
              Username
            </label>
            <input
              type="text"
              bind:value={formData.username}
              on:input={() => validateField('username')}
              on:keydown={handleKeydown}
              placeholder="Enter username"
              class="w-full px-4 py-3 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gray-50
                {errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
            />
            {#if errors.username}
              <p class="mt-1 text-xs text-red-600">{errors.username}</p>
            {/if}
          </div>

          <!-- Password -->
          <div class="mb-3 lg:mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-sm lg:text-base font-semibold text-gray-800">Password</label>
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  bind:checked={showPassword}
                  class="w-3.5 h-3.5 accent-green-600"
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
                class="w-full px-4 py-3 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gray-50
                  {errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
              />
            {:else}
              <input
                type="password"
                bind:value={formData.password}
                on:input={() => validateField('password')}
                on:keydown={handleKeydown}
                placeholder="Enter password"
                class="w-full px-4 py-3 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gray-50
                  {errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}"
              />
            {/if}

            {#if errors.password}
              <p class="mt-1 text-xs text-red-600">{errors.password}</p>
            {/if}
          </div>

          <!-- Spacer -->
          <div class="mb-5 lg:mb-7"></div>

          <!-- Login button -->
          <button
            on:click={handleLogin}
            disabled={isSubmitting}
            class="w-full py-3 lg:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-base lg:text-lg shadow-md"
          >
            {#if isSubmitting}
              <span class="inline-flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            {:else}
              Login
            {/if}
          </button>

        </div>
      </div>

    </div>
  </main>

</div>