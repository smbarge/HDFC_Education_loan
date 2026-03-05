<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import { customCreateApplication,getUserApplication } from '$lib/api/authApi';

  import { user, logout as logoutStore , applicationId } from '$lib/stores/userStore';

  import { onMount } from 'svelte';


  let fullApplication = null;
  let loading = true;



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

  let hasExistingApplication = false;

  onMount(async () => {

    if ($applicationId) {
  const res = await fetch(`/api/viewApplication/${$applicationId}`);
  const result = await res.json();

  if (result.error === 0) {
    fullApplication = result.data;
  }
  loading = false;
}

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
  
    {#if loading}
  <div class="text-center py-10 text-gray-500">
    Loading application details...
  </div>
{:else if fullApplication}

  <!-- Application Section -->
  <div class="bg-white rounded-xl shadow p-6 mb-6">
    <h2 class="text-xl font-semibold text-purple-700 mb-4">
      Application Information
    </h2>
    <p><strong>Application ID:</strong> {$applicationId}</p>
    <p><strong>User ID:</strong> {fullApplication.application?.user_id}</p>
  </div>

  <!-- Personal Details -->
  <div class="bg-white rounded-xl shadow p-6 mb-6">
    <h2 class="text-xl font-semibold text-purple-700 mb-4">
      Personal Details
    </h2>
    <p><strong>Name:</strong> {fullApplication.personal?.name}</p>
    <p><strong>DOB:</strong> {fullApplication.personal?.dob}</p>
    <p><strong>Gender:</strong> {fullApplication.personal?.gender}</p>
    <p><strong>Mobile:</strong> {fullApplication.personal?.mobile}</p>
    <p><strong>Email:</strong> {fullApplication.personal?.email}</p>
    <p><strong>PAN:</strong> {fullApplication.personal?.pan}</p>
    <p><strong>Aadhar:</strong> {fullApplication.personal?.aadhar}</p>
  </div>

  <!-- Education Details -->
  <div class="bg-white rounded-xl shadow p-6 mb-6">
    <h2 class="text-xl font-semibold text-purple-700 mb-4">
      Education Details
    </h2>
    <p><strong>Student Name:</strong> {fullApplication.education?.student_name}</p>
    <p><strong>Course:</strong> {fullApplication.education?.course_name}</p>
    <p><strong>University:</strong> {fullApplication.education?.university}</p>
    <p><strong>Loan Required:</strong> ₹ {fullApplication.education?.loan_required_amount}</p>
    <p><strong>Purpose:</strong> {fullApplication.education?.purpose_of_loan}</p>
  </div>

  <!-- Guarantor Details -->
  {#if fullApplication.guarantor}
  <div class="bg-white rounded-xl shadow p-6 mb-6">
    <h2 class="text-xl font-semibold text-purple-700 mb-4">
      Guarantor Details
    </h2>
    <p><strong>Name:</strong> {fullApplication.guarantor?.name}</p>
    <p><strong>Mobile:</strong> {fullApplication.guarantor?.mobile}</p>
    <p><strong>Email:</strong> {fullApplication.guarantor?.email}</p>
    <p><strong>Occupation:</strong> {fullApplication.guarantor?.occupation}</p>
    <p><strong>Income:</strong> ₹ {fullApplication.guarantor?.income}</p>
  </div>
  {/if}

{:else}
  <div class="text-center text-gray-500">
    No application data found.
  </div>
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