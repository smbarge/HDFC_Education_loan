<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';

  import { onMount } from 'svelte';

    let userData = {
      name: "Guest User",
      phone: "",
      username: ""
    };

    onMount(() => {
      if (typeof window !== 'undefined') {
        const authUser = sessionStorage.getItem('authUser');
        
        if (!authUser) {
          goto(`/${locale}/login`);
          return;
        }

        const user = JSON.parse(authUser);
        userData = {
          name: user.name || "Guest User",
          phone: user.mobile || "",
          username: user.username || ""
        };
      }
    });
  

  // Modal state
  let showProfileModal = false;

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  function startNewApplication() {
    goto(`/${locale}/application/start`);
  }

  function viewEligibility() {
    goto(`/${locale}`); 
  }

  function viewDocuments() {
    goto(`/${locale}`); 
  }

  function contactSupport() {
    // Scroll to support or open contact modal
  }

  function openProfileModal() {
    showProfileModal = true;
  }

  function closeProfileModal() {
    showProfileModal = false;
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authUser');
      sessionStorage.removeItem('accessToken');
    }
    
    showProfileModal = false;
    
    // Show success message
    showSuccessToast();
    
    // Redirect to login after a short delay
    setTimeout(() => {
      goto(`/${locale}/login`);
    }, 1000);
  }

  function handleChangePassword() {
    showProfileModal = false;
    goto(`/${locale}/change-password`);
  }

  function showSuccessToast() {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] flex items-center gap-2 animate-slide-in';
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Logout Successful!</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
</script>

<svelte:head>
  <style>
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  </style>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100">
  
  <DashboardHeader {t} {locale} {userData} on:openProfile={openProfileModal} />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    
    <section class="max-w-7xl mx-auto text-center mb-12">
      <div class="bg-white rounded-2xl shadow-md p-10 sm:p-12 overflow-hidden relative border border-purple-100">
        <div class="absolute top-0 right-0 w-48 h-48 bg-purple-100 opacity-30 rounded-full -mr-24 -mt-24"></div>
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-purple-200 opacity-20 rounded-full -ml-20 -mb-20"></div>
        
        <div class="relative z-10">
          <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
            </svg>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
            Welcome {userData.name}!
          </h1>
          <p class="text-base sm:text-lg mb-6 text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {t.welcome.newUserMessage || 'Start your education loan application journey today. Get financial support for your educational dreams.'}
          </p>
          <button
            on:click={startNewApplication}
            class="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span>{t.welcome.startApplication || 'Start New Application'}</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="mb-12">
      <h2 class="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
        {t.welcome.whyChooseUs || 'Why Choose MAMFDC?'}
      </h2>
      
      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <!-- Benefit 1 -->
        <div class="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">
            {t.welcome.benefitAmount}
          </h3>
          <p class="text-gray-600 leading-relaxed text-sm">
            {t.welcome.benefitAmountDesc || 'Get education loan up to ₹5,00,000 for your studies'}
          </p>
        </div>

        <!-- Benefit 2 -->
        <div class="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">
            {t.welcome.benefitRate || 'Low Interest Rate'}
          </h3>
          <p class="text-gray-600 leading-relaxed text-sm">
            {t.welcome.benefitRateDesc || 'Starting from 3% per annum with government subsidy'}
          </p>
        </div>

        <!-- Benefit 3 -->
        <div class="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">
            {t.welcome.benefitProcess || 'Quick Processing'}
          </h3>
          <p class="text-gray-600 leading-relaxed text-sm">
            {t.welcome.benefitProcessDesc || 'Get approval within 15-20 working days'}
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="mb-12 bg-white rounded-2xl shadow-md p-6 sm:p-10">
      <h2 class="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
        {t.welcome.howItWorks || 'How It Works'}
      </h2>
      
      <div class="max-w-4xl mx-auto">
        <!-- Step 1 -->
        <div class="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-gray-200">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
            1
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {t.welcome.step1Title}
            </h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              {t.welcome.step1Desc}
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-gray-200">
          <div class="flex-shrink-0">
           <div class="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
            2
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              {t.welcome.step2Title}
            </h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              {t.welcome.step2Desc}
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-gray-200">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
            3
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              {t.welcome.step3Title}
            </h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              {t.welcome.step3Desc}
            </p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
            4
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {t.welcome.step4Title }
            </h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              {t.welcome.step4Desc}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Info Cards -->
    <section class="mb-12">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        
        <button
          on:click={viewEligibility}
          class="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                {t.welcome.checkEligibility || 'Check Eligibility'}
              </h3>
              <p class="text-sm text-gray-600 mb-3">
                {t.welcome.eligibilityDesc || 'See if you qualify for the education loan program'}
              </p>
              <span class="text-purple-600 font-semibold text-sm flex items-center gap-1">
                {t.welcome.learnMore || 'Learn More'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>

        <!-- Required Documents Card -->
        <button
          on:click={viewDocuments}
          class="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                {t.welcome.requiredDocuments || 'Required Documents'}
              </h3>
              <p class="text-sm text-gray-600 mb-3">
                {t.welcome.documentsDesc || 'View the list of documents needed for application'}
              </p>
              <span class="text-purple-600 font-semibold text-sm flex items-center gap-1">
                {t.welcome.viewList || 'View List'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>

        <!-- Contact Support Card -->
        <button
          on:click={contactSupport}
          class="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                {t.welcome.needHelp || 'Need Help?'}
              </h3>
              <p class="text-sm text-gray-600 mb-3">
                {t.welcome.supportDesc || 'Our support team is here to assist you'}
              </p>
              <span class="text-purple-600 font-semibold text-sm flex items-center gap-1">
                {t.welcome.contactUs || 'Contact Us'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>
      </div>
    </section>
  </div>
</div>

<!-- Profile Modal Component -->
<ProfileModal 
  bind:showProfileModal={showProfileModal}
  {userData}
  {locale}
  on:close={closeProfileModal}
  on:logout={handleLogout}
  on:changePassword={handleChangePassword}
/>