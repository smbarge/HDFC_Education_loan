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

  import { slide } from 'svelte/transition';



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
  
    // onMount(() => {
    //   if (typeof window !== 'undefined') {
    //     const authUser = sessionStorage.getItem('authUser');
        
    //     if (!authUser) {
    //       goto(`/${locale}/login`);
    //       return;
    //     }

    //     const user = JSON.parse(authUser);
    //     userData = {
    //       name: user.name || "Guest User",
    //       phone: user.mobile || "",
    //       username: user.username || ""
    //     };
    //   }
    // });

  let hasExistingApplication = false;
  let applicationStatus = null;


  let showSubmissionBanner = false;
  let submissionInfo = null;


  const loanPurposeMap = {
  '1': 'Graduation',
  '2': 'Post Graduation', 
  '3': 'Diploma',
  '4': 'Professional Course',
  '5': 'Technical Course',
  '6': 'Medical Course',
  '7': 'Study Abroad',
  '8': 'Other'
};


// $: loanPurposeLabel = loanPurposeMap[String(purposeOfLoan)] || purposeOfLoan || 'N/A';
let submittedDate = null;


 onMount(async () => {
  if (!$user) {
    goto(`/${locale}/login`);
    return;
  }

  // // Check sessionStorage for fresh submission data
  // const saved = sessionStorage.getItem('submissionSuccess');
  // if (saved) {
  //   submissionInfo = JSON.parse(saved);
  //   sessionStorage.removeItem('submissionSuccess');
  // }

  // const savedDate = sessionStorage.getItem('submissionDate');
  // if (savedDate) {
  //   submittedDate = savedDate;
  //   sessionStorage.removeItem('submissionDate');
  // }


  const saved = sessionStorage.getItem('submissionSuccess');
  if (saved) {
    submissionInfo = JSON.parse(saved);
    submittedDate = submissionInfo.submittedDate || null;
    sessionStorage.removeItem('submissionSuccess');
  }

  const result = await getUserApplication($user.id);
  if (result.error === 0) {
    applicationId.set(result.applicationId);
    hasExistingApplication = true;
    applicationStatus = result.status;

    // If submitted but no fresh submissionInfo, fetch education data for display
    if (applicationStatus === 'submitted' && !submissionInfo) {
      try {
        const { getEducationDetailsData } = await import('$lib/api/authApi');
        const eduData = await getEducationDetailsData(result.applicationId);
        if (eduData.error === 0 && eduData.data) {
          submissionInfo = {
            applicantName: $user.name || '',
            applicationId: result.applicationId,
            purposeOfLoan: eduData.data.purposeOfLoan || '',
            loanAmount: eduData.data.loanRequired || eduData.data.loanAmount || ''
          };
        }
      } catch(e) {
        console.error('Could not fetch education data:', e);
      }
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

  

//   async function startNewApplication() {
//   try {
//     // Create new application
//     const result = await customCreateApplication({
//       user: userData.phone // User's mobile number
//     });

//     if (result.error !== 0) {
//       alert(result.errorMsg || 'Failed to create application');
//       return;
//     }

//     // Store application ID in session
//     sessionStorage.setItem('currentApplicationId', result.applicationId);
    
//     console.log('Application created with ID:', result.applicationId);
    
//     // Navigate to application start
//     goto(`/${locale}/application/start`);
    
//   } catch (error) {
//     console.error('Error creating application:', error);
//     alert('Failed to create application. Please try again.');
//   }
// }

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

  // function handleLogout() {
  //   if (typeof window !== 'undefined') {
  //     sessionStorage.removeItem('authUser');
  //     sessionStorage.removeItem('accessToken');
  //   }
    
  //   showProfileModal = false;
    
  //   // Show success message
  //   showSuccessToast();
    
  //   // Redirect to login after a short delay
  //   setTimeout(() => {
  //     goto(`/${locale}/login`);
  //   }, 1000);
  // }

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

  let showEligibility = false;

  function toggleEligibility(event) {
    event.stopPropagation();
    showEligibility = !showEligibility;
  }


  let showSupport = false;

  function toggleSupport(event) {
    event.stopPropagation();
    showSupport = !showSupport;
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

    <!-- //After sucessfuly Submission --------------------------------->

  {#if applicationStatus === 'submitted'}

<div class="w-full">

    <!-- Success Banner -->
    <div class="mb-6 bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
      <div class="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-5 flex items-center justify-between">
          <!-- Left: Success Message -->
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <h3 class="text-white font-bold text-xl">Application Submitted Successfully!</h3>
              <p class="text-green-100 text-sm mt-1">Your application has been received and is under review.</p>
            </div>
          </div>

          <!-- Right: View Application Button -->
          <button
            on:click={() => goto(`/${locale}/application/view-application`)}
            class="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            View Application
          </button>
        </div>

      <!-- Status Badge -->
      <div class="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center justify-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
        <span class="text-green-700 text-sm font-semibold">Status: Under Review</span>
      </div>

      <!-- Info Cards -->
        <div class="p-6 grid grid-cols-2 gap-4">
        <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <p class="text-xs text-gray-500 font-medium">Applicant</p>
          </div>
          <p class="font-bold text-gray-800 text-sm">{submissionInfo?.applicantName || userData.name || 'N/A'}</p>
        </div>

        <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p class="text-xs text-gray-500 font-medium">Application ID</p>
          </div>
          <p class="font-bold text-blue-600 text-sm">#{submissionInfo?.applicationId || $applicationId}</p>
        </div>

        <div class="bg-green-50 rounded-xl p-4 border border-green-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055"/>
              </svg>
            </div>
            <p class="text-xs text-gray-500 font-medium">Education Purpose</p>
          </div>
          <p class="font-bold text-gray-800 text-sm">
            {submissionInfo ? (loanPurposeMap[String(submissionInfo.purposeOfLoan)] || 'N/A') : 'N/A'}
          </p>
        </div>

        <div class="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="text-xs text-gray-500 font-medium">Loan Amount</p>
          </div>
          <p class="font-bold text-gray-800 text-sm">
            {submissionInfo?.loanAmount ? '₹' + Number(submissionInfo.loanAmount).toLocaleString('en-IN') : 'N/A'}
          </p>
        </div>
      </div>

      <!-- Application Timeline / Track -->
      <div class="px-6 pb-6">
        <h4 class="text-sm font-bold text-gray-700 mb-4">Application Track</h4>
        <div class="relative">
          <!-- Vertical line -->
          <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

          <!-- Step 1 — Submitted -->
          <div class="relative flex items-start gap-4 mb-5">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 z-10">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-green-700">Application Submitted</p>
                  <p class="text-xs text-gray-500">{submittedDate || 'Successfully Submitted'}</p>
            </div>
          </div>

          <!-- Step 2 — Under Review (active) -->
          <div class="relative flex items-start gap-4 mb-5">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 animate-pulse">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-blue-700">Under Review</p>
              <p class="text-xs text-gray-500">Your application is being reviewed by our team</p>
            </div>
          </div>

          <!-- Step 3 — Approved/Rejected (pending) -->
          <div class="relative flex items-start gap-4">
            <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 z-10">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-400">Approved / Rejected</p>
              <p class="text-xs text-gray-400">Decision pending</p>
            </div>
          </div>
        </div>
      </div>

      <!-- View Application Button -->
      <!-- <div class="px-6 pb-6">
        <button
          on:click={() => goto(`/${locale}/application/view-application`)}
          class="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span>View Application</span>
        </button>
      </div> -->
    </div>
  </div>


    <!-- end te sucessfuly submission data----------------------------- -->

    {:else}
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
          {#if hasExistingApplication}
              {#if applicationStatus === 'submitted'}
                <!-- view Application -->
                <button
                  on:click={() => goto(`/${locale}/application/view-application`)}
                  class="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span>View Application</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </button>
              {:else}
                <!-- Continue Application -->
                <button
                  on:click={() => goto(`/${locale}/application/start`)}
                  class="inline-flex items-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span>Continue Application</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </button>
              {/if}
          {:else}
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
          {/if}
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
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto items-start">
        
        <button
        on:click={viewEligibility}
        class="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-h-[220px]"        >
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
              <!-- <span class="text-purple-600 font-semibold text-sm flex items-center gap-1">
                {t.welcome.learnMore || 'Learn More'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span> -->
              <span 
              on:click|stopPropagation={toggleEligibility}
              class="text-purple-600 font-semibold text-sm flex items-center gap-1 cursor-pointer"
            >
              {t.welcome.learnMore || 'Learn More'}
              <svg 
                class="w-4 h-4 transition-transform duration-300 {showEligibility ? 'rotate-90' : ''}" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
            </div>
          </div>
          {#if showEligibility}
  <div transition:slide class="mt-4 pt-4 border-t border-gray-200">
    
    <div>
      <h4 class="font-semibold text-purple-700 mb-1">
        {t.eligibility.community.title}
      </h4>
      <ul class="list-disc list-inside space-y-1">
        {#each t.eligibility.community.items as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>

    <div>
      <h4 class="font-semibold text-purple-700 mb-1">
        {t.eligibility.age.title}
      </h4>
      <ul class="list-disc list-inside space-y-1">
        {#each t.eligibility.age.items as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>

    <div>
      <h4 class="font-semibold text-purple-700 mb-1">
        {t.eligibility.income.title}
      </h4>
      <ul class="list-disc list-inside space-y-1">
        {#each t.eligibility.income.items as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>

    <div>
      <h4 class="font-semibold text-purple-700 mb-1">
        {t.eligibility.documents.title}
      </h4>
      <ul class="list-disc list-inside space-y-1">
        {#each t.eligibility.documents.items as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>

  </div>
  {/if}
        </button>

        <!-- Required Documents Card -->
        <button
          on:click={viewDocuments}
          class="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-h-[220px]"        >
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
  class="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-h-[220px]"
>
  <div class="flex items-start gap-4">
    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    </div>

    <div class="w-full">
      <h3 class="text-lg font-bold text-gray-900 mb-2">
        {t.welcome.needHelp || 'Need Help?'}
      </h3>

      <p class="text-sm text-gray-600 mb-3">
        {t.welcome.supportDesc || 'Our support team is here to assist you'}
      </p>

      <!-- Toggle -->
      <span
        on:click|stopPropagation={toggleSupport}
        class="text-purple-600 font-semibold text-sm flex items-center gap-1 cursor-pointer"
      >
        {t.welcome.contactUs || 'Contact Us'}

        <svg
          class="w-4 h-4 transition-transform duration-300"
          class:rotate-90={showSupport}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5l7 7-7 7"/>
        </svg>
      </span>
    </div>
  </div>

  {#if showSupport}
    <div
      transition:slide={{ duration: 250 }}
      class="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700 space-y-4"
    >
      <!-- Call -->
      <div>
        <h4 class="font-semibold text-purple-700">
          {t.support.call.title}
        </h4>
        <p>{t.support.call.number}</p>
        <p class="text-xs text-gray-500">{t.support.call.hours}</p>
      </div>

      <!-- Email -->
      <div>
        <h4 class="font-semibold text-purple-700">
          {t.support.email.title}
        </h4>
        <p>{t.support.email.address}</p>
        <p class="text-xs text-gray-500">{t.support.email.response}</p>
      </div>

      <!-- Office -->
      <div>
        <h4 class="font-semibold text-purple-700">
          {t.support.office.title}
        </h4>
        <p>{t.support.office.location}</p>
        <p class="text-xs text-gray-500">{t.support.office.address}</p>
      </div>
    </div>
    {/if}
  </button>
      </div>
    </section>

   {/if}

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