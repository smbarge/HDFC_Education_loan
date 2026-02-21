<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import { user, logout as logoutStore } from '$lib/stores/userStore';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  $: userData = $user ? {
    name: $user.name || "Guest User",
    phone: $user.mobile || "",
    username: $user.username || ""
  } : {
    name: "Guest User",
    phone: "",
    username: ""
  };

  let showProfileModal = false;
  let applicationData = null;

  // Dummy data - Replace with real API call
  const dummyApplicationData = {
    id: 'APP2024001234',
    status: 'in-progress',
    currentStep: 4,
    loanAmount: '350000',
    purpose: 'Engineering Degree',
    submittedDate: '06/02/2024',
    applicantName: 'Akshata Sangale',
    course: 'B.Tech Computer Science',
    institution: 'Pune Institute of Technology'
  };

  onMount(() => {
    if (!$user) {
      goto(`/${locale}/login`);
      return;
    }
    
    // Load application data (replace with real API call)
    loadApplicationData();
  });

  function loadApplicationData() {
    // TODO: Replace with real API call
    applicationData = dummyApplicationData;
  }

  function continueApplication() {
    const routes = ['start', 'personal-details', 'academic-info', 'guarantor-details', 'collateral-details', 'upload-documents'];
    goto(`/${locale}/application/${routes[(applicationData?.currentStep || 1) - 1]}`);
  }

  function viewApplication() {
    alert(`Viewing application: ${applicationData?.id}`);
  }

  function contactSupport() {
    alert('Contact Support: Call 1800-XXX-XXXX');
  }

  function handleLogout() {
    logoutStore();
    showProfileModal = false;
    showSuccessToast();
    setTimeout(() => goto(`/${locale}/login`), 1000);
  }

  function showSuccessToast() {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] flex items-center gap-2';
    toast.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Logout Successful!</span>';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function getStatusColor(status) {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'approved': return 'Approved / मंजूर';
      case 'rejected': return 'Rejected / नाकारले';
      case 'pending': return 'Pending / प्रलंबित';
      case 'in-progress': return 'In Progress / प्रगतीपथावर';
      default: return 'Unknown';
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'approved': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'rejected': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'pending': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100">
  
  <DashboardHeader {t} {locale} {userData} on:openProfile={() => showProfileModal = true} />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    
    {#if applicationData}
      <!-- APPLICATION TRACKING -->
      <section class="mb-8">
        <div class="bg-white rounded-2xl shadow-md overflow-hidden border border-purple-100">
          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 text-white">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 class="text-2xl font-bold mb-2">Your Loan Application</h2>
                <p class="text-purple-100 text-sm">Application ID: {applicationData.id}</p>
                <p class="text-purple-100 text-xs mt-1">Applicant: {applicationData.applicantName}</p>
              </div>
              <span class={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getStatusColor(applicationData.status)}`}>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getStatusIcon(applicationData.status)}/>
                </svg>
                {getStatusText(applicationData.status)}
              </span>
            </div>
          </div>

          <!-- Stepper -->
          <div class="p-6 bg-gray-50 border-b">
            <ApplicationStepper currentStep={applicationData.currentStep} {locale} />
          </div>

          <!-- Details -->
          <div class="p-6">
            <div class="grid md:grid-cols-3 gap-6 mb-6">
              <div class="bg-purple-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Loan Details</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Amount:</span>
                    <span class="font-bold text-purple-700">₹{applicationData.loanAmount}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Purpose:</span>
                    <span class="font-medium">{applicationData.purpose}</span>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Education Details</h3>
                <div class="space-y-2 text-sm">
                  <div>
                    <span class="text-gray-600 block">Course:</span>
                    <span class="font-medium">{applicationData.course}</span>
                  </div>
                  <div>
                    <span class="text-gray-600 block">Institution:</span>
                    <span class="font-medium text-xs">{applicationData.institution}</span>
                  </div>
                </div>
              </div>

              <div class="bg-green-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Submitted:</span>
                    <span class="font-medium">{applicationData.submittedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3">
              {#if applicationData.status === 'in-progress'}
                <button
                  on:click={continueApplication}
                  class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  Continue Application
                </button>
              {:else}
                <button
                  on:click={viewApplication}
                  class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
                >
                  View Full Application
                </button>
              {/if}

              <button
                on:click={contactSupport}
                class="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all text-sm"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    {:else}
      <!-- No Application -->
      <div class="text-center py-12">
        <p class="text-gray-600">No application found. <a href="/{locale}/welcome" class="text-purple-600 underline">Start a new one</a></p>
      </div>
    {/if}
  </div>
</div>

<ProfileModal 
  bind:showProfileModal={showProfileModal}
  {userData}
  {locale}
  on:close={() => showProfileModal = false}
  on:logout={handleLogout}
/>