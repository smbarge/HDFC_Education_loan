<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';
  import { user, applicationId } from '$lib/stores/userStore';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import SubmissionSuccessModal from '$lib/components/upload-documents/SubmissionSuccessModal.svelte';
  import { logout as logoutStore } from '$lib/stores/userStore';
  import { getViewApplicationData } from '$lib/api/authApi.js';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let showProfileModal = false;
  let showSuccessModal = false;
  let isSubmitting = false;
  let isLoading = true;
  let loadError = '';
  let appData = null;
  let activeSection = 'personal';

  $: userData = $user ? {
    name: $user.name || '',
    phone: $user.mobile || '',
    username: $user.username || '',
    id: $user.id || null
  } : null;

  onMount(async () => {
    if (!$user) { goto(`/${locale}/login`); return; }
    if (!$applicationId) { goto(`/${locale}/dashboard`); return; }

    const result = await getViewApplicationData($user.id, $applicationId);
    if (result.error !== 0) {
      loadError = result.errorMsg || 'Failed to load application data';
    } else {
      appData = result.data;
    }
    isLoading = false;
  });

  function label(val) {
    return val || '—';
  }

  function formatCurrency(val) {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  }

  function formatDate(val) {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN');
  }

  const sections = [
    { id: 'personal',   label: 'Personal Details',   icon: '👤' },
    { id: 'education',  label: 'Academic Info',       icon: '🎓' },
    { id: 'guarantor',  label: 'Guarantor Details',   icon: '🤝' },
    { id: 'collateral', label: 'Collateral Details',  icon: '🏠' },
    { id: 'documents',  label: 'Documents',           icon: '📄' },
  ];

  let activeTab = 'reviewSubmit';
    $: tabs = [
  { id: 'identity',   label: t?.tabs?.identity },
  { id: 'personal',   label: t?.tabs?.personal },
  { id: 'academic',   label: t?.tabs?.academic },
  { id: 'guarantor',  label: t?.tabs?.guarantor },
  { id: 'collateral', label: t?.tabs?.collateral },
  { id: 'documents',  label: t?.tabs?.documents },
  { id: 'reviewSubmit',  label: t?.tabs?.reviewSubmit }
];

  async function handleSubmit() {
    isSubmitting = true;
    try {
      const res = await fetch(`/api/createApplication/${$user.id}/${$applicationId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: $applicationId })
      });
      const data = await res.json();
      if (data.error === 0) {
        showSuccessModal = true;
      } else {
        alert(data.errorMsg || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Please try again.');
    } finally {
      isSubmitting = false;
    }
  }

  function handleBack() {
    goto(`/${locale}/application/upload-documents`);
  }
</script>

<div class="min-h-screen bg-gray-50">
  <DashboardHeader
    {t} {locale} {userData}
    on:openProfile={() => showProfileModal = true}
  />

  <ProfileModal
    {userData} {locale}
    bind:showProfileModal
    on:close={() => showProfileModal = false}
    on:logout={() => { logoutStore(); goto(`/${locale}/login`); }}
  />

  <SubmissionSuccessModal
    show={showSuccessModal}
    applicationId={$applicationId}
    on:goToDashboard={() => goto(`/${locale}/dashboard`)}
  />

  <div class="max-w-6xl mx-auto px-4 py-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Review & Submit Application</h1>
        <p class="text-sm text-gray-500 mt-1">Please review all your details before final submission</p>
      </div>
      <button on:click={handleBack}
        class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back
      </button>
    </div>

    {#if isLoading}
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg class="animate-spin h-10 w-10 text-purple-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p class="text-gray-500 text-sm">Loading your application...</p>
        </div>
      </div>

    {:else if loadError}
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-600 font-medium">{loadError}</p>
      </div>

    {:else if appData}

      <!-- Applicant Header Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 flex items-center gap-6">
        {#if appData.documents?.photo}
          <img src={appData.documents.photo} alt="Applicant" class="w-20 h-20 rounded-full object-cover border-4 border-purple-200 shadow"/>
        {:else}
          <div class="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-200">
            <span class="text-3xl font-bold text-purple-600">{(appData.personal?.name || 'A')[0]}</span>
          </div>
        {/if}
        <div class="flex-1">
          <h2 class="text-xl font-bold text-gray-900">{label(appData.personal?.name)}</h2>
          <p class="text-sm text-gray-500">Application ID: <span class="font-semibold text-purple-600">#{$applicationId}</span></p>
          <span class="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Pending Submission
          </span>
        </div>
        {#if appData.documents?.signature}
          <div class="text-center">
            <img src={appData.documents.signature} alt="Signature" class="h-14 object-contain border border-gray-200 rounded-lg p-1 bg-gray-50"/>
            <p class="text-xs text-gray-400 mt-1">Signature</p>
          </div>
        {/if}
      </div>

      <!-- Section Tabs -->
      <!-- <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
        {#each sections as sec}
          <button
            on:click={() => activeSection = sec.id}
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
              {activeSection === sec.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'}"
          >
            <span>{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        {/each}
      </div> -->
      <div class="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {#each tabs as tab}
            <button
              on:click={() => activeTab = tab.id}
              class="flex-shrink-0 px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap
                {activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
            >
              {tab.label}
            </button>
          {/each}
        </div>

      <!-- Section Content -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">

        <!-- PERSONAL DETAILS -->
        {#if activeSection === 'personal'}
          <h3 class="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">Personal Details</h3>

          <!-- Identity -->
          <div class="mb-6">
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Identity Information</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><p class="text-xs text-gray-400">Full Name</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.name)}</p></div>
              <div><p class="text-xs text-gray-400">Aadhar No</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.aadhar)}</p></div>
              <div><p class="text-xs text-gray-400">Date of Birth</p><p class="font-semibold text-sm text-gray-800">{formatDate(appData.personal?.dob)}</p></div>
              <div><p class="text-xs text-gray-400">Gender</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.gender)}</p></div>
              <div><p class="text-xs text-gray-400">Religion</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.religion)}</p></div>
              <div><p class="text-xs text-gray-400">Resident</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.resident)}</p></div>
              <div><p class="text-xs text-gray-400">Mobile</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.mobile)}</p></div>
              <div><p class="text-xs text-gray-400">Email</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.email)}</p></div>
              <div><p class="text-xs text-gray-400">PAN</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.pan)}</p></div>
            </div>
          </div>

          <!-- Current Address -->
          <div class="mb-6">
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Current Address</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-3"><p class="text-xs text-gray-400">Address</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.current_address)}</p></div>
              <div><p class="text-xs text-gray-400">District</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.current_district)}</p></div>
              <div><p class="text-xs text-gray-400">Taluka</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.current_taluka)}</p></div>
              <div><p class="text-xs text-gray-400">Place</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.current_place)}</p></div>
              <div><p class="text-xs text-gray-400">Area</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.current_area)}</p></div>
              <div><p class="text-xs text-gray-400">Pincode</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.current_pincode)}</p></div>
            </div>
          </div>

          <!-- Permanent Address -->
          <div class="mb-6">
            <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Permanent Address</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-3"><p class="text-xs text-gray-400">Address</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.permanent_address)}</p></div>
              <div><p class="text-xs text-gray-400">District</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.permanent_district)}</p></div>
              <div><p class="text-xs text-gray-400">Taluka</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.permanent_taluka)}</p></div>
              <div><p class="text-xs text-gray-400">Place</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.permanent_place)}</p></div>
              <div><p class="text-xs text-gray-400">Area</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.permanent_area)}</p></div>
              <div><p class="text-xs text-gray-400">Pincode</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.permanent_pincode)}</p></div>
            </div>
          </div>

          <!-- Other Personal -->
          <div>
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Other Details</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><p class="text-xs text-gray-400">Marital Status</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.marital_status)}</p></div>
              <div><p class="text-xs text-gray-400">Education</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.education_qualification)}</p></div>
              <div><p class="text-xs text-gray-400">Occupation</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.occupation)}</p></div>
              <div><p class="text-xs text-gray-400">Income</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(appData.personal?.income)}</p></div>
              <div><p class="text-xs text-gray-400">Guardian Name</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.guardian_name)}</p></div>
              <div><p class="text-xs text-gray-400">Relation</p><p class="font-semibold text-sm text-gray-800">{label(appData.personal?.relation)}</p></div>
            </div>
          </div>

        <!-- EDUCATION -->
        {:else if activeSection === 'education'}
          <h3 class="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">Academic Information</h3>

          <div class="mb-6">
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Course Details</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><p class="text-xs text-gray-400">Student Name</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.student_name)}</p></div>
              <div><p class="text-xs text-gray-400">Course Name</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.course_name)}</p></div>
              <div><p class="text-xs text-gray-400">Course Type</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.course_type)}</p></div>
              <div><p class="text-xs text-gray-400">Stream</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.stream_specialization)}</p></div>
              <div><p class="text-xs text-gray-400">Duration</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.course_duration)} years</p></div>
              <div><p class="text-xs text-gray-400">Mode of Study</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.mode_of_study)}</p></div>
              <div><p class="text-xs text-gray-400">Admission Status</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.admission_status)}</p></div>
              <div><p class="text-xs text-gray-400">Admission Year</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.admission_year)}</p></div>
            </div>
          </div>

          <div class="mb-6">
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Institution Details</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2"><p class="text-xs text-gray-400">Institution Name</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.institution_name)}</p></div>
              <div><p class="text-xs text-gray-400">University</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.university)}</p></div>
              <div class="sm:col-span-3"><p class="text-xs text-gray-400">Address</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.institution_address)}</p></div>
              <div><p class="text-xs text-gray-400">District</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.institution_district)}</p></div>
              <div><p class="text-xs text-gray-400">Taluka</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.institution_taluka)}</p></div>
              <div><p class="text-xs text-gray-400">Pincode</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.institution_pincode)}</p></div>
            </div>
          </div>

          <div class="mb-6">
            <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Fee & Loan Details</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><p class="text-xs text-gray-400">Total Course Fee</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(appData.education?.total_course_fee)}</p></div>
              <div><p class="text-xs text-gray-400">Fee Paid</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(appData.education?.fee_paid)}</p></div>
              <div><p class="text-xs text-gray-400">Remaining Fee</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(appData.education?.remaining_fee)}</p></div>
              <div><p class="text-xs text-gray-400">Loan Required</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(appData.education?.loan_required_amount)}</p></div>
              <div><p class="text-xs text-gray-400">Purpose of Loan</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.purpose_of_loan)}</p></div>
            </div>
          </div>

          <div>
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Bank Details</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><p class="text-xs text-gray-400">Bank Name</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.bank_name)}</p></div>
              <div><p class="text-xs text-gray-400">Branch</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.branch_name)}</p></div>
              <div><p class="text-xs text-gray-400">IFSC Code</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.ifsc_code)}</p></div>
              <div><p class="text-xs text-gray-400">Account Number</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.account_number)}</p></div>
              <div class="sm:col-span-2"><p class="text-xs text-gray-400">Bank Address</p><p class="font-semibold text-sm text-gray-800">{label(appData.education?.bank_address)}</p></div>
            </div>
          </div>

        <!-- GUARANTOR -->
        {:else if activeSection === 'guarantor'}
          <h3 class="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">Guarantor Details</h3>
          {#if appData.guarantor}
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-5 py-3">
              <p class="text-white font-bold text-xs uppercase tracking-wide">Guarantor Information</p>
            </div>
            <div class="border border-t-0 border-gray-200 rounded-b-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><p class="text-xs text-gray-400">Name</p><p class="font-semibold text-sm text-gray-800">{label(appData.guarantor.name)}</p></div>
              <div><p class="text-xs text-gray-400">Mobile</p><p class="font-semibold text-sm text-gray-800">{label(appData.guarantor.mobile)}</p></div>
              <div><p class="text-xs text-gray-400">Aadhar</p><p class="font-semibold text-sm text-gray-800">{label(appData.guarantor.aadhar)}</p></div>
              <div><p class="text-xs text-gray-400">Gender</p><p class="font-semibold text-sm text-gray-800">{label(appData.guarantor.gender)}</p></div>
              <div><p class="text-xs text-gray-400">Occupation</p><p class="font-semibold text-sm text-gray-800">{label(appData.guarantor.occupation)}</p></div>
              <div><p class="text-xs text-gray-400">Income</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(appData.guarantor.income)}</p></div>
            </div>
          {:else}
            <p class="text-gray-400 text-sm">No guarantor details found.</p>
          {/if}

        <!-- COLLATERAL -->
        {:else if activeSection === 'collateral'}
          <h3 class="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">Collateral Details</h3>

          {#if appData.collateral?.properties?.length > 0}
            <div class="mb-6">
              <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-5 py-3">
                <p class="text-white font-bold text-xs uppercase tracking-wide">🏠 Property Collateral</p>
              </div>
              {#each appData.collateral.properties as prop, i}
                <div class="border border-t-0 border-gray-200 {i === appData.collateral.properties.length - 1 ? 'rounded-b-xl' : ''} p-5 bg-white grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div><p class="text-xs text-gray-400">Survey No</p><p class="font-semibold text-sm text-gray-800">{label(prop.survey_no)}</p></div>
                  <div><p class="text-xs text-gray-400">District</p><p class="font-semibold text-sm text-gray-800">{label(prop.district_id)}</p></div>
                  <div><p class="text-xs text-gray-400">Village</p><p class="font-semibold text-sm text-gray-800">{label(prop.place)}</p></div>
                  <div><p class="text-xs text-gray-400">Units</p><p class="font-semibold text-sm text-gray-800">{label(prop.units)}</p></div>
                  <div><p class="text-xs text-gray-400">Area</p><p class="font-semibold text-sm text-gray-800">{label(prop.area_value)}</p></div>
                  <div><p class="text-xs text-gray-400">Valuation</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(prop.property_value)}</p></div>
                </div>
              {/each}
            </div>
          {/if}

          {#if appData.collateral?.fds?.length > 0}
            <div class="mb-6">
              <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl px-5 py-3">
                <p class="text-white font-bold text-xs uppercase tracking-wide">🏦 Fixed Deposit Collateral</p>
              </div>
              {#each appData.collateral.fds as fd, i}
                <div class="border border-t-0 border-gray-200 {i === appData.collateral.fds.length - 1 ? 'rounded-b-xl' : ''} p-5 bg-white grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div><p class="text-xs text-gray-400">Bank Name</p><p class="font-semibold text-sm text-gray-800">{label(fd.bank_name)}</p></div>
                  <div><p class="text-xs text-gray-400">Branch</p><p class="font-semibold text-sm text-gray-800">{label(fd.branch_name)}</p></div>
                  <div><p class="text-xs text-gray-400">FD Amount</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(fd.amount)}</p></div>
                  <div><p class="text-xs text-gray-400">FD Account No</p><p class="font-semibold text-sm text-gray-800">{label(fd.fd_acc_no)}</p></div>
                  <div><p class="text-xs text-gray-400">Maturity Date</p><p class="font-semibold text-sm text-gray-800">{formatDate(fd.fd_maturity_date)}</p></div>
                </div>
              {/each}
            </div>
          {/if}

          {#if appData.collateral?.lics?.length > 0}
            <div class="mb-6">
              <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl px-5 py-3">
                <p class="text-white font-bold text-xs uppercase tracking-wide">📋 LIC Policy Collateral</p>
              </div>
              {#each appData.collateral.lics as lic, i}
                <div class="border border-t-0 border-gray-200 {i === appData.collateral.lics.length - 1 ? 'rounded-b-xl' : ''} p-5 bg-white grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div><p class="text-xs text-gray-400">Policy Name</p><p class="font-semibold text-sm text-gray-800">{label(lic.policy_name)}</p></div>
                  <div><p class="text-xs text-gray-400">Policy Type</p><p class="font-semibold text-sm text-gray-800">{label(lic.policy_type)}</p></div>
                  <div><p class="text-xs text-gray-400">Receipt No</p><p class="font-semibold text-sm text-gray-800">{label(lic.policy_receipt_no)}</p></div>
                  <div><p class="text-xs text-gray-400">Surrender Value</p><p class="font-semibold text-sm text-gray-800">{formatCurrency(lic.policy_surrender_value)}</p></div>
                  <div><p class="text-xs text-gray-400">Maturity Date</p><p class="font-semibold text-sm text-gray-800">{formatDate(lic.policy_maturity_date)}</p></div>
                </div>
              {/each}
            </div>
          {/if}

          {#if appData.collateral?.govtEmployees?.length > 0}
            <div class="mb-6">
              <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-t-xl px-5 py-3">
                <p class="text-white font-bold text-xs uppercase tracking-wide">🏛️ Govt Employee Guarantor</p>
              </div>
              {#each appData.collateral.govtEmployees as govt, i}
                <div class="border border-t-0 border-gray-200 {i === appData.collateral.govtEmployees.length - 1 ? 'rounded-b-xl' : ''} p-5 bg-white grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div><p class="text-xs text-gray-400">Department</p><p class="font-semibold text-sm text-gray-800">{label(govt.department_office_name)}</p></div>
                  <div><p class="text-xs text-gray-400">Designation</p><p class="font-semibold text-sm text-gray-800">{label(govt.designation)}</p></div>
                  <div><p class="text-xs text-gray-400">Employee ID</p><p class="font-semibold text-sm text-gray-800">{label(govt.employee_id_number)}</p></div>
                  <div><p class="text-xs text-gray-400">Retirement Date</p><p class="font-semibold text-sm text-gray-800">{formatDate(govt.date_of_retirement)}</p></div>
                </div>
              {/each}
            </div>
          {/if}

          {#if !appData.collateral?.properties?.length && !appData.collateral?.fds?.length && !appData.collateral?.lics?.length && !appData.collateral?.govtEmployees?.length}
            <p class="text-gray-400 text-sm">No collateral details found.</p>
          {/if}

        <!-- DOCUMENTS -->
        {:else if activeSection === 'documents'}
          <h3 class="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">Uploaded Documents</h3>

          {@const sectionNameMap = {
            1: 'APPLICANT DOCUMENTS', 2: 'APPLICANT DOCUMENTS', 3: 'APPLICANT DOCUMENTS',
            4: 'APPLICANT DOCUMENTS', 5: 'APPLICANT DOCUMENTS',
            6: 'CO-APPLICANT DOCUMENTS',
            7: 'COLLATERAL — Property', 8: 'COLLATERAL — Govt Employee',
            9: 'COLLATERAL — LIC Policy', 10: 'COLLATERAL — Fixed Deposit',
            11: 'STUDY ABROAD DOCUMENTS', 12: 'GUARANTOR DOCUMENTS'
          }}
          {@const sectionOrderMap = { 1:1,2:1,3:1,4:1,5:1, 6:2, 12:3, 7:4, 8:5, 9:6, 10:7, 11:8 }}
          {@const groupedSections = (() => {
            const sections = {};
            (appData.allDocs || []).forEach(doc => {
              const sid = doc.section_id;
              const sname = sectionNameMap[sid] || doc.section_name || 'Other Documents';
              if (!sections[sname]) sections[sname] = { section_name: sname, order: sectionOrderMap[sid] || 99, docs: [] };
              sections[sname].docs.push(doc);
            });
            return Object.values(sections).sort((a, b) => a.order - b.order);
          })()}

          {#if groupedSections.length > 0}
            {#each groupedSections as section}
              <div class="mb-5">
                <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-5 py-3">
                  <p class="text-white font-bold text-xs uppercase tracking-wide">{section.section_name}</p>
                </div>
                <div class="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden divide-y divide-gray-100">
                  {#each section.docs as doc}
                    <div class="flex items-center justify-between px-5 py-3 bg-white hover:bg-gray-50">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-gray-800">{doc.document_name}</p>
                          <p class="text-xs text-gray-400">{doc.org_filename || ''}</p>
                        </div>
                      </div>
                      <a href={doc.file_name} target="_blank" rel="noopener noreferrer"
                        class="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        View
                      </a>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          {:else}
            <p class="text-gray-400 text-sm">No documents uploaded yet.</p>
          {/if}
        {/if}
      </div>

      <!-- Declaration + Submit -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-start gap-3 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm text-yellow-800">
            <span class="font-bold">Declaration:</span> I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. I understand that providing false information may result in rejection of my application.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-end">
          <button on:click={handleBack}
            class="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
            ← Back to Documents
          </button>
          <button
            on:click={handleSubmit}
            disabled={isSubmitting}
            class="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg text-sm flex items-center gap-2 justify-center"
          >
            {#if isSubmitting}
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Submitting...
            {:else}
              Submit Application
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>

    {/if}
  </div>
</div>