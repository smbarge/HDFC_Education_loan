<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Header from '$lib/components/landingpage/Header.svelte';
  import { currentLang } from '$lib/translations/resistration';
  import { i18n } from '$lib/translations/resistration';
  import ProgressSteps from '$lib/components/registeration/ProgressSteps.svelte';


  let lang = 'en';
  let username = '';
  let password = '';
  let confirmPassword = '';
  let showPassword = false;
  let showConfirmPassword = false;
  let errors = {
    password: '',
    confirmPassword: ''
  };

  currentLang.subscribe(value => {
    lang = value;
  });

  $: t = (key) => i18n.t(lang, key);

  onMount(() => {
    if (typeof window !== 'undefined') {
      const data = window.__registrationData;
      if (!data) {
        goto('/registration');
        return;
      }
      if (!data.otpVerified) {
        goto('/registration/verify');
        return;
      }
      username = data.mobile;
    }
  });

  function validatePassword() {
    if (!password) {
      errors.password = t('errors.passwordRequired');
      return false;
    }
    if (password.length < 6) {
      errors.password = t('errors.passwordMinLength');
      return false;
    }
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) {
      errors.password = t('errors.passwordSpecial');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      errors.password = t('errors.passwordNumber');
      return false;
    }
    errors.password = '';
    return true;
  }

  function validateConfirmPassword() {
    if (!confirmPassword) {
      errors.confirmPassword = t('errors.confirmPasswordRequired');
      return false;
    }
    if (confirmPassword.length < 6) {
      errors.confirmPassword = t('errors.confirmPasswordMinLength');
      return false;
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = t('errors.confirmPasswordMatch');
      return false;
    }
    errors.confirmPassword = '';
    return true;
  }

  function handleCreateAccount() {
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (isPasswordValid && isConfirmPasswordValid) {
      if (typeof window !== 'undefined') {
        delete window.__registrationData;
      }
      goto('/registration/success');
    }
  }

  function getPasswordStrength() {
    if (!password) return { strength: 0, label: '', color: 'bg-gray-300' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  }

  function goHome() {
    goto('/');
  }

  function goBack() {
    goto('/registration/verify');
  }

  $: passwordStrength = getPasswordStrength();
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
 <ProgressSteps currentStep={3} {t} />

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid lg:grid-cols-2 gap-12 items-start">
      
      <!-- Left Column - Info Card & Image -->
     <div class="space-y-6">
        
        <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-3">
            {t('step1.Education_Loan_for_Minority_Communities')}
          </h2>
          <p class="text-gray-600 leading-relaxed">
            {t('step1.Register_now_to_apply_for_education_loans')}
          </p>
        </div>

        <!-- Student Image -->
        <div class="rounded-2xl overflow-hidden shadow-lg h-[520px] lg:h-[580px]">
          <img
            src="/create-account.jpg"
            alt="Student with education"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Right Column - Form -->
      <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span class="text-sm font-medium text-purple-700">{t('step3.Secure_Account')}</span>
        </div>

        <!-- Title -->
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {t('step3.title')}
        </h1>
        <p class="text-gray-600 mb-8">
          {t('step3.Set_up_your_account_credentials')}
        </p>

        <!-- Form -->
        <form on:submit|preventDefault={handleCreateAccount} class="space-y-6">
          
          <!-- Username Display -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t('step3.username')}
            </label>
            <div class="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="font-semibold text-gray-900">{username}</span>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              {t('step3.password')} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              {#if showPassword}
                <input
                  type="text"
                  id="password"
                  bind:value={password}
                  on:blur={validatePassword}
                  on:input={() => errors.password = ''}
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all {errors.password ? 'border-red-500 bg-red-50' : ''}"
                  placeholder={t('step3.passwordPlaceholder')}
                />
              {:else}
                <input
                  type="password"
                  id="password"
                  bind:value={password}
                  on:blur={validatePassword}
                  on:input={() => errors.password = ''}
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all {errors.password ? 'border-red-500 bg-red-50' : ''}"
                  placeholder={t('step3.passwordPlaceholder')}
                />
              {/if}
              <button
                type="button"
                on:click={() => showPassword = !showPassword}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {#if showPassword}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                {:else}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                {/if}
              </button>
            </div>
            
            <!-- Password Strength Indicator -->
            {#if password}
              <div class="mt-2">
                <div class="flex items-center gap-2 mb-1">
                  <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full {passwordStrength.color} transition-all duration-300"
                      style="width: {(passwordStrength.strength / 5) * 100}%"
                    ></div>
                  </div>
                  <span class="text-xs font-medium {passwordStrength.color === 'bg-red-500' ? 'text-red-600' : passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-600'}">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            {/if}
            
            {#if errors.password}
              <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {errors.password}
              </p>
            {/if}
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              {t('step3.confirmPassword')} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              {#if showConfirmPassword}
                <input
                  type="text"
                  id="confirmPassword"
                  bind:value={confirmPassword}
                  on:blur={validateConfirmPassword}
                  on:input={() => errors.confirmPassword = ''}
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all {errors.confirmPassword ? 'border-red-500 bg-red-50' : ''}"
                  placeholder={t('step3.confirmPasswordPlaceholder')}
                />
              {:else}
                <input
                  type="password"
                  id="confirmPassword"
                  bind:value={confirmPassword}
                  on:blur={validateConfirmPassword}
                  on:input={() => errors.confirmPassword = ''}
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all {errors.confirmPassword ? 'border-red-500 bg-red-50' : ''}"
                  placeholder={t('step3.confirmPasswordPlaceholder')}
                />
              {/if}
              <button
                type="button"
                on:click={() => showConfirmPassword = !showConfirmPassword}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {#if showConfirmPassword}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                {:else}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                {/if}
              </button>
            </div>
            {#if errors.confirmPassword}
              <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {errors.confirmPassword}
              </p>
            {/if}
          </div>

          <!-- Password Requirements Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {t('step3.passwordRequirements')}
                </p>
                <ul class="text-xs text-gray-600 mt-1 space-y-1">
                  <li>• {t('step3.requirement1')}</li>
                  <li>• {t('step3.requirement2')}</li>
                  <li>• {t('step3.requirement3')}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Create Account Button -->
          <button
            type="submit"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
          >
            {t('step3.createAccount')}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </form>

        <!-- Back Link -->
        <div class="mt-6 text-center">
          <button 
            on:click={goBack}
            class="text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            ← {t('step3.Back_to_OTP_Verification')}
          </button>
        </div>
      </div>

    </div>
  </div>
</div>