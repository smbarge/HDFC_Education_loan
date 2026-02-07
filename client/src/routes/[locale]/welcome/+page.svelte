<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';

  let userData = {
    name: "Guest User",
    phone: "",
    username: ""
  };

  let showProfileModal = false;
  let hasApplication = false;
  let applicationData = null;

  // Dummy Application Data - Change these values to test different states
  const dummyApplicationData = {
    // Set to null to show welcome screen, or use one of the examples below
    
    // Example 1: In-Progress Application (incomplete)
    id: 'APP2024001234',
    status: 'in-progress', // 'in-progress', 'pending', 'approved', 'rejected'
    currentStep: 4, // Current step (1-6)
    loanAmount: '350000',
    purpose: 'Engineering Degree',
    submittedDate: '06/02/2024',
    applicantName: 'Akshata Sangale',
    course: 'B.Tech Computer Science',
    institution: 'Pune Institute of Technology'
    
    // Example 2: Pending Application (under review)
    // id: 'APP2024001235',
    // status: 'pending',
    // currentStep: 6,
    // loanAmount: '450000',
    // purpose: 'MBA Program',
    // submittedDate: '25/01/2024',
    // applicantName: 'Rahul Patil',
    // course: 'MBA Finance',
    // institution: 'Symbiosis Institute'
    
    // Example 3: Approved Application
    // id: 'APP2024001236',
    // status: 'approved',
    // currentStep: 6,
    // loanAmount: '500000',
    // purpose: 'Medical Education',
    // submittedDate: '15/01/2024',
    // approvedDate: '05/02/2024',
    // applicantName: 'Priya Sharma',
    // course: 'MBBS',
    // institution: 'Government Medical College'
    
    // Example 4: Rejected Application
    // id: 'APP2024001237',
    // status: 'rejected',
    // currentStep: 6,
    // loanAmount: '300000',
    // purpose: 'Hotel Management',
    // submittedDate: '10/01/2024',
    // rejectedDate: '02/02/2024',
    // rejectedReason: 'Incomplete documentation',
    // applicantName: 'Amit Desai',
    // course: 'BHM',
    // institution: 'IHM Mumbai'
  };

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

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

      // Load dummy application data
      loadDummyApplicationData();
    }
  });

  function loadDummyApplicationData() {
    // Toggle this to test with/without application
    const showApplicationTracking = true; // Set to false to show welcome screen
    
    if (showApplicationTracking && dummyApplicationData) {
      applicationData = dummyApplicationData;
      hasApplication = true;
    } else {
      applicationData = null;
      hasApplication = false;
    }
  }

  function startNewApplication() {
    goto(`/${locale}/application/start`);
  }

  function continueApplication() {
    const currentStep = applicationData?.currentStep || 1;
    const routes = [
      'start',
      'personal-details',
      'academic-info',
      'guarantor-details',
      'collateral-details',
      'upload-documents'
    ];
    goto(`/${locale}/application/${routes[currentStep - 1]}`);
  }

  function viewApplication() {
    // Navigate to view application page
    alert(`Viewing application: ${applicationData?.id}`);
    // goto(`/${locale}/application/view/${applicationData?.id}`);
  }

  function viewEligibility() {
    goto(`/${locale}/eligibility`);
  }

  function viewDocuments() {
    goto(`/${locale}/documents-list`);
  }

  function contactSupport() {
    alert('Contact Support: Call 1800-XXX-XXXX or email support@mamfdc.gov.in');
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
      localStorage.removeItem('applicationData');
    }
    
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

  function showSuccessToast() {
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

  function getStatusColor(status) {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'approved':
        return 'Approved / मंजूर';
      case 'rejected':
        return 'Rejected / नाकारले';
      case 'pending':
        return 'Pending / प्रलंबित';
      case 'in-progress':
        return 'In Progress / प्रगतीपथावर';
      default:
        return 'Unknown';
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'approved':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'rejected':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'pending':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
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
    
    {#if hasApplication && applicationData}
      <!-- APPLICATION TRACKING SECTION -->
      <section class="mb-8">
        <div class="bg-white rounded-2xl shadow-md overflow-hidden border border-purple-100">
          <!-- Header with Status -->
          <div class="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 text-white">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 class="text-2xl font-bold mb-2">Your Loan Application</h2>
                <p class="text-purple-100 text-sm">Application ID: {applicationData.id || 'N/A'}</p>
                <p class="text-purple-100 text-xs mt-1">Applicant: {applicationData.applicantName || userData.name}</p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <span class={`px-4 py-2 rounded-full border-2 font-semibold text-sm flex items-center gap-2 ${getStatusColor(applicationData.status)}`}>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getStatusIcon(applicationData.status)}/>
                  </svg>
                  {getStatusText(applicationData.status)}
                </span>
              </div>
            </div>
          </div>

          <!-- Application Stepper -->
          <div class="p-6 bg-gray-50 border-b border-gray-200">
            <ApplicationStepper currentStep={applicationData.currentStep || 1} {locale} />
          </div>

          <!-- Application Details -->
          <div class="p-6">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <!-- Loan Details -->
              <div class="bg-purple-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Loan Details / कर्ज तपशील
                </h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Amount:</span>
                    <span class="font-bold text-purple-700">₹{applicationData.loanAmount || 'N/A'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Purpose:</span>
                    <span class="font-medium">{applicationData.purpose || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Course Details -->
              <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  Education Details / शिक्षण तपशील
                </h3>
                <div class="space-y-2 text-sm">
                  <div>
                    <span class="text-gray-600 block">Course:</span>
                    <span class="font-medium">{applicationData.course || 'N/A'}</span>
                  </div>
                  <div>
                    <span class="text-gray-600 block">Institution:</span>
                    <span class="font-medium text-xs">{applicationData.institution || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Timeline -->
              <div class="bg-green-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Timeline / वेळापत्रक
                </h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Submitted:</span>
                    <span class="font-medium">{applicationData.submittedDate || 'N/A'}</span>
                  </div>
                  {#if applicationData.approvedDate}
                    <div class="flex justify-between">
                      <span class="text-gray-600">Approved:</span>
                      <span class="font-medium text-green-700">{applicationData.approvedDate}</span>
                    </div>
                  {/if}
                  {#if applicationData.rejectedDate}
                    <div class="flex justify-between">
                      <span class="text-gray-600">Rejected:</span>
                      <span class="font-medium text-red-700">{applicationData.rejectedDate}</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Status Messages -->
            <div class="mb-6 p-4 rounded-lg {applicationData.status === 'approved' ? 'bg-green-50 border border-green-200' : applicationData.status === 'rejected' ? 'bg-red-50 border border-red-200' : applicationData.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}">
              {#if applicationData.status === 'in-progress'}
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <h4 class="font-semibold text-blue-900 mb-1">Application Incomplete / अर्ज अपूर्ण</h4>
                    <p class="text-sm text-blue-800">You're currently on step {applicationData.currentStep} of 6. Please complete all steps to submit your application.</p>
                  </div>
                </div>
              {:else if applicationData.status === 'pending'}
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <h4 class="font-semibold text-yellow-900 mb-1">Under Review / पुनरावलोकनाधीन</h4>
                    <p class="text-sm text-yellow-800">Your application is being reviewed by our team. This process usually takes 15-20 working days. We'll notify you once a decision is made.</p>
                  </div>
                </div>
              {:else if applicationData.status === 'approved'}
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <h4 class="font-semibold text-green-900 mb-1">Congratulations! Application Approved / अभिनंदन! अर्ज मंजूर</h4>
                    <p class="text-sm text-green-800">Your loan application has been approved! The loan amount of ₹{applicationData.loanAmount} will be disbursed to {applicationData.institution} shortly.</p>
                  </div>
                </div>
              {:else if applicationData.status === 'rejected'}
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <h4 class="font-semibold text-red-900 mb-1">Application Rejected / अर्ज नाकारला</h4>
                    <p class="text-sm text-red-800 mb-2">Unfortunately, your application has been rejected. Reason: {applicationData.rejectedReason || 'Not specified'}</p>
                    <p class="text-sm text-red-700">Please contact our support team for more information or to reapply.</p>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Action Buttons -->
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
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  View Full Application
                </button>
              {/if}

              <button
                on:click={contactSupport}
                class="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all text-sm"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Contact Support
              </button>

              {#if applicationData.status === 'approved'}
                <button
                  class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  Download Approval Letter
                </button>
              {/if}
            </div>
          </div>
        </div>
      </section>

    {:else}
      <!-- NO APPLICATION - WELCOME SECTION -->
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
              Start your education loan application journey today. Get financial support for your educational dreams.
            </p>
            <button
              on:click={startNewApplication}
              class="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>Start New Application</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    {/if}

    <!-- Benefits Section -->
    <section class="mb-12">
      <h2 class="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
        Why Choose MAMFDC?
      </h2>
      
      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div class="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Up to ₹5 Lakhs</h3>
          <p class="text-gray-600 leading-relaxed text-sm">Get education loan up to ₹5,00,000 for your studies</p>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Low Interest Rate</h3>
          <p class="text-gray-600 leading-relaxed text-sm">Starting from 3% per annum with government subsidy</p>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Quick Processing</h3>
          <p class="text-gray-600 leading-relaxed text-sm">Get approval within 15-20 working days</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="mb-12 bg-white rounded-2xl shadow-md p-6 sm:p-10">
      <h2 class="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
      
      <div class="max-w-4xl mx-auto">
        {#each [
          { num: 1, title: 'Fill Application Form', desc: 'Complete the online application form with your personal and educational details. It takes only 10-15 minutes.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { num: 2, title: 'Upload Documents', desc: 'Submit required documents like Aadhar card, educational certificates, and income proof digitally.', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
          { num: 3, title: 'Verification Process', desc: 'Our team will verify your documents and eligibility. This usually takes 15-20 working days.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
          { num: 4, title: 'Get Approval', desc: 'Once approved, the loan amount will be disbursed directly to your educational institution.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
        ] as step, i}
          <div class="flex flex-col sm:flex-row gap-6 mb-8 {i < 3 ? 'pb-8 border-b border-gray-200' : ''}">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">{step.num}</div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={step.icon}/>
                </svg>
                {step.title}
              </h3>
              <p class="text-gray-600 leading-relaxed text-sm">{step.desc}</p>
            </div>
          </div>
        {/each}
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
              <h3 class="text-lg font-bold text-gray-900 mb-2">Check Eligibility</h3>
              <p class="text-sm text-gray-600 mb-3">See if you qualify for the education loan program</p>
              <span class="text-purple-600 font-semibold text-sm flex items-center gap-1">
                Learn More
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>

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
              <h3 class="text-lg font-bold text-gray-900 mb-2">Required Documents</h3>
              <p class="text-sm text-gray-600 mb-3">View the list of documents needed for application</p>
              <span class="text-purple-600 font-semibold text-sm flex items-center gap-1">
                View List
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </button>

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
              <h3 class="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
              <p class="text-sm text-gray-600 mb-3">Our support team is here to assist you</p>
              <span class="text-purple-600 font-semibold text-sm flex items-center gap-1">
                Contact Us
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

<ProfileModal 
  bind:showProfileModal={showProfileModal}
  {userData}
  {locale}
  on:close={closeProfileModal}
  on:logout={handleLogout}
  on:changePassword={handleChangePassword}
/>