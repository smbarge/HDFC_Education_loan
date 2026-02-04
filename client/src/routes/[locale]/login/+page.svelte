<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Header from '$lib/components/landingpage/Header.svelte';
  import loginValidation from '$lib/validation/login.js';

  import { customLoginApplicant } from '$lib/api/authApi.js';



  export let data;
  $: t = data.t;
  $: locale = data.locale;

  let formData = {
    username: '',
    password: ''
  };

  let errors = {
    username: '',
    password: ''
  };

  let showPassword = false;
  let rememberMe = false;

  function runValidation(field = null) {
  const result = loginValidation(formData, t);

  if (field) {
    errors[field] = result.getErrors(field)[0] || '';
  } else {
    errors.username = result.getErrors('username')[0] || '';
    errors.password = result.getErrors('password')[0] || '';
  }

  return !result.hasErrors();
}

  async function handleLogin() {
    const isValid = runValidation();
    if (!isValid) return;

    try {
      const response = await customLoginApplicant({
        mobile: formData.username,   // username = mobile number
        password: formData.password
      });

      if (response.error !== 0) {
        errors.password = response.errorMsg || 'Invalid credentials';
        return;
      }

      // ✅ Save session (simple & safe)
      sessionStorage.setItem(
        'authUser',
        JSON.stringify(response.user)
      );

      sessionStorage.setItem(
        'accessToken',
        response.token
      );

      goto(`/${locale}/dashboard`);

    } catch (err) {
      console.error(err);
      errors.password = 'Server error. Please try again.';
    }
  }



  function goHome() {
    goto(`/${locale}`);
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">

  <Header />
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
    <button
      on:click={goHome}
      class="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
      <span class="font-medium">{t.login.backToHome}</span>
    </button>
  </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
      
      <div class="relative h-full min-h-[500px] lg:min-h-[600px]">
      <div class="relative rounded-2xl overflow-hidden shadow-2xl w-[600px] h-[550px] sm:w-[600px] sm:h-[650px] bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600">
        
          <img
            src ='/create-account.jpg'
            alt="Student education"
            class="absolute inset-0 w-full h-full object-cover object-center"
          />
         
          <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-purple-300/60 via-purple-500/20 to-transparent"></div>
        
          <div class="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-balck z-10">
            <h2 class="text-2xl sm:text-3xl font-bold mb-3">
              {t.login.welcomeBack}
            </h2>
            <p class="text-base sm:text-lg text-balck-100 leading-relaxed">
              {t.login.accessAccount}
            </p>
          </div>
        </div>

        <div class="absolute -top-4 -right-4 w-20 h-20 sm:w-24 sm:h-24 bg-purple-200 rounded-full blur-2xl opacity-60 animate-pulse pointer-events-none"></div>
        <div class="absolute -bottom-4 -left-4 w-24 h-24 sm:w-32 sm:h-32 bg-blue-200 rounded-full blur-2xl opacity-60 animate-pulse pointer-events-none" style="animation-delay: 1s;"></div>
      </div>

      <div class="flex flex-col justify-center">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
         
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span class="text-sm font-medium text-purple-700">{t.login.secureLogin}</span>
          </div>

          <div class="mb-8">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t.login.title}
            </h1>
            <p class="text-gray-600 text-sm sm:text-base">
              {t.login.subtitle}
            </p>
          </div>

          <!-- Form -->
          <form on:submit|preventDefault={handleLogin} class="space-y-6" autocomplete="off">
            
            <!-- Username -->
            <div class="space-y-2">
              <label for="username" class="block text-sm font-medium text-gray-700">
                {t.login.username} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  bind:value={formData.username}
                  on:blur={() => runValidation('username')}
                  on:input={() => errors.username = ''}
                  placeholder={t.login.usernamePlaceholder}
                  class="block w-full h-12 pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 {errors.username ? 'border-red-500 bg-red-50' : 'bg-white hover:border-purple-300'}"
                />
              </div>

              {#if errors.username}
                <p class="flex items-center gap-1 text-sm text-red-600 mt-1">
                  <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span>{errors.username}</span>
                </p>
              {/if}
            </div>

            <!-- Password -->
            <div class="space-y-1">
              <label for="password" class="block text-sm font-medium text-gray-700">
                {t.login.password} <span class="text-red-500">*</span>
              </label>

              <div class="relative">
                <svg
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>

                {#if showPassword}
                  <input
                    id="password"
                    type="text"
                    bind:value={formData.password}
                    on:blur={() => runValidation('password')}
                    on:input={() => errors.password = ''}
                    placeholder={t.login.passwordPlaceholder}
                    class="w-full h-12 pl-11 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all {errors.password ? 'border-red-500 bg-red-50' : 'bg-white hover:border-purple-300'}"
                  />
                {:else}
                  <input
                    id="password"
                    type="password"
                    bind:value={formData.password}
                    on:blur={() => runValidation('password')}

                    on:input={() => errors.password = ''}
                    placeholder={t.login.passwordPlaceholder}
                    class="w-full h-12 pl-11 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all {errors.password ? 'border-red-500 bg-red-50' : 'bg-white hover:border-purple-300'}"
                  />
                {/if}

                <button
                  type="button"
                  on:click={() => showPassword = !showPassword}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-purple-600 hover:text-purple-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {#if errors.password}
                <p class="text-sm text-red-600 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  {errors.password}
                </p>
              {/if}
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  bind:checked={rememberMe}
                  class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                />
                <span class="text-sm text-gray-700 select-none group-hover:text-gray-900">{t.login.rememberMe}</span>
              </label>
              <a href="/{locale}/forgot-password" class="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors duration-200">
                {t.login.forgotPassword}
              </a>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {t.login.loginSecure}
                  </p>
                  <p class="text-xs text-gray-600 mt-1">
                    {t.login.protectedBy}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:shadow-xl hover:shadow-purple-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span>{t.login.signIn}</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-600 text-center">
              {t.login.noAccount}
              <a href="/{locale}/registration" class="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-colors duration-200">
                {t.login.registerNow}
              </a>
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
