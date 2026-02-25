<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import DocumentsSection from '$lib/components/dashboard/DocumentsSection.svelte';
  import { customCreateApplication,getUserApplication } from '$lib/api/authApi';

  import { user, logout as logoutStore , applicationId } from '$lib/stores/userStore';

  import { onMount } from 'svelte';



    // Use store value directly
    $: userData = $user ? {
      name: $user.name || "Guest User",
      phone: $user.mobile || "",
      username: $user.username || ""
    } : {
      name: "Guest User",
      phone: "",
      username: ""
    };


    $: console.log("User data is______:", userData);
  

  let hasExistingApplication = false;

  onMount(async () => {
  if (!$user) {
    goto(`/${locale}/login`);
  }

  if ($applicationId) {
    hasExistingApplication = true;
  } else {
    const result = await getUserApplication($user.id);
    if (result.error === 0) {
      applicationId.set(result.applicationId);
      hasExistingApplication = true;
    }
  }
});

  // Modal state
  let showProfileModal = false;
  let documentsSection;

  //For exiting application



  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  function startNewApplication() {
    goto(`/${locale}/application/start`);
  }

  
  function viewEligibility() {
    
  }

  function viewDocuments() {
    if (documentsSection) {
      documentsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
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
  logoutStore();
  showProfileModal = false;
  showSuccessToast();
  
  setTimeout(() => {
    goto(`/${locale}/login`);
  }, 1000);
}


  function handleChangePassword() {
    showProfileModal = false;
    goto(`/${locale}/change-password`);
  }

  function continueApplication() {
  goto(`/${locale}/application/start`);
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

  // Example status (later you can replace this with API value)
  let applicationStatus = "Application Submitted";
  // Possible values:
  // "Application Submitted"
  // "Documents Verified"
  // "Loan Approved"
  // "Amount Disbursed"

  const statusProgressMap = {
    "Application Submitted": 25,
    "Documents Verified": 50,
    "Loan Approved": 75,
    "Amount Disbursed": 100
  };

  $: progress = statusProgressMap[applicationStatus] || 0;
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

    <!-- Decorative Background -->
    <div class="absolute top-0 right-0 w-48 h-48 bg-purple-100 opacity-30 rounded-full -mr-24 -mt-24"></div>
    <div class="absolute bottom-0 left-0 w-40 h-40 bg-purple-200 opacity-20 rounded-full -ml-20 -mb-20"></div>

    <div class="relative z-10">

      <!-- Icon -->
      <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 17v-6h13M9 5v6h13M5 5h.01M5 12h.01M5 19h.01"/>
        </svg>
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
        Track Your Application
      </h1>

      <!-- Description -->
      <p class="text-base sm:text-lg mb-8 text-gray-600 leading-relaxed max-w-2xl mx-auto">
        Stay updated with your education loan application progress.
      </p>

      <!-- Status Card -->
      <div class="bg-purple-50 rounded-xl p-6 mb-8 max-w-3xl mx-auto shadow-sm">

        <p class="text-gray-700 mb-2">
          <strong>Application ID:</strong> EDU20260001
        </p>

        <p class="text-gray-700 mb-4">
          <strong>Status:</strong> {applicationStatus}
        </p>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            class="bg-green-500 h-3 rounded-full transition-all duration-500"
            style="width: {progress}%">
          </div>
        </div>

        <p class="text-sm text-gray-500 mt-2">
          {progress}% Completed
        </p>
      </div>

      <!-- Button -->
      <button
        on:click={() => goto('application/start')}
        class="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
      >
        <span>View Full Application Details</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
      </button>

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

    <!-- Document Sectiion -->
    <div bind:this={documentsSection} class="mt-12 scroll-mt-24">
      <DocumentsSection />
    </div>


    <!-- Quick Info Cards -->
    <section class="mb-12">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
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