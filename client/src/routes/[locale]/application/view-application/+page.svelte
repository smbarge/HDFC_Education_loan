<script>
  // @ts-nocheck
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import { user, logout as logoutStore, applicationId } from '$lib/stores/userStore';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let showProfileModal = false;
  let isLoading = true;
  let appData = null;
  let error = null;

  $: userData = $user ? {
    name: $user.name || 'Guest User',
    phone: $user.mobile || '',
    username: $user.username || ''
  } : { name: 'Guest User', phone: '', username: '' };


  // Active tab
  let activeTab = 'identity';
  const tabs = [
    { id: 'identity',   label: 'Identity Check' },
    { id: 'personal',   label: 'Personal Details' },
    { id: 'academic',   label: 'Academic Info' },
    { id: 'guarantor',  label: 'Guarantor Details' },
    { id: 'collateral', label: 'Collateral Details' },
    { id: 'documents',  label: 'Document Upload' },
  ];

  onMount(async () => {
    if (!$user) { goto(`/${locale}/login`); return; }
    if (!$applicationId) { goto(`/${locale}/dashboard`); return; }

    try {
      const res = await fetch(
        `/api/createApplication/${$user.id}/${$applicationId}/view`
      );
      const result = await res.json();
      if (result.error !== 0) {
        error = result.errorMsg || 'Failed to load application';
      } else {
        appData = result.data;
      }
    } catch (e) {
      error = 'Failed to load application data';
    } finally {
      isLoading = false;
    }
  });

  function formatDate(val) {
    if (!val) return 'N/A';
    return new Date(val).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  function formatCurrency(val) {
    if (!val) return 'N/A';
    return '₹' + Number(val).toLocaleString('en-IN');
  }

  function label(val, fallback = 'N/A') {
    return val || fallback;
  }
</script>

<svelte:head>
  <title>View Application - Education Loan</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100">

  <DashboardHeader {t} {locale} {userData} on:openProfile={() => showProfileModal = true} />

  <ProfileModal
    {userData} {locale}
    bind:showProfileModal
    on:close={() => showProfileModal = false}
    on:logout={() => { logoutStore(); goto(`/${locale}/login`); }}
  />

  <!-- <ApplicationStepper currentStep={6} {locale} /> -->

    <div class="w-full px-4 sm:px-6 lg:px-10 py-8 pb-16">

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">View Application</h2>
        <p class="text-sm text-gray-500 mt-1">Application ID: #{$applicationId}</p>
      </div>
      <button
        on:click={() => goto(`/${locale}/dashboard`)}
        class="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to Dashboard
      </button>
    </div>

    {#if isLoading}
      <!-- Loading -->
      <div class="bg-white rounded-2xl shadow p-16 text-center">
        <svg class="animate-spin h-10 w-10 text-purple-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p class="text-gray-500">Loading your application...</p>
      </div>

    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">{error}</div>

    {:else if appData}

      <!-- Photo + Signature Row -->
      <div class="bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <!-- Photo -->
        <div class="text-center">
          {#if appData.documents?.photo}
            <img
              src={appData.documents.photo}
              alt="Applicant Photo"
              class="w-28 h-28 rounded-full object-cover border-4 border-purple-200 shadow mx-auto"
            />
          {:else}
            <div class="w-28 h-28 rounded-full bg-purple-100 flex items-center justify-center mx-auto border-4 border-purple-200">
              <svg class="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          {/if}
          <p class="text-xs text-gray-500 mt-2 font-medium">Applicant Photo</p>
        </div>

        <!-- Name + ID -->
        <div class="flex-1 text-center sm:text-left">
          <h3 class="text-2xl font-bold text-gray-900">{label(appData.personal?.name)}</h3>
          <p class="text-gray-500 text-sm mt-1">Application ID: <span class="font-semibold text-purple-600">#{$applicationId}</span></p>
          <div class="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-green-700 text-xs font-semibold">Submitted — Under Review</span>
          </div>
        </div>

        <!-- Signature -->
        <div class="text-center">
          {#if appData.documents?.signature}
            <img
              src={appData.documents.signature}
              alt="Signature"
              class="h-16 w-40 object-contain border border-gray-200 rounded-lg bg-gray-50 p-1"
            />
          {:else}
            <div class="h-16 w-40 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <span class="text-xs text-gray-400">No Signature</span>
            </div>
          {/if}
          <p class="text-xs text-gray-500 mt-2 font-medium">Signature</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-2xl shadow-md overflow-hidden">

        <!-- Tab Headers -->
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

        <!-- Tab Content -->
            <div class="p-6 sm:p-8">
       

          {#if activeTab === 'identity'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">Identity Check</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Full Name</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.name)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Aadhar Number</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.aadhar)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Date of Birth</p>
                <p class="font-semibold text-gray-800">{formatDate(appData.personal?.dob)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Gender</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.gender)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Religion / Community</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.religion)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Resident</p>
                <p class="font-semibold text-gray-800">{appData.personal?.resident === 1 ? 'Yes' : 'No'}</p>
              </div>
            </div>

          <!-- ===== PERSONAL DETAILS ===== -->
          {:else if activeTab === 'personal'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">Personal Details</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Mobile</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.mobile)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Email</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.email)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">PAN Card</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.pan)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Marital Status</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.marital_status)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Education Qualification</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.education_qualification)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Guardian Name</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.guardian_name)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Occupation</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.occupation)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">Annual Income</p>
                <p class="font-semibold text-gray-800">{formatCurrency(appData.personal?.income)}</p>
              </div>
            </div>

            <!-- Addresses -->
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p class="text-xs font-bold text-blue-700 mb-2">Current Address</p>
                <p class="text-sm text-gray-700">{label(appData.personal?.current_address)}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {label(appData.personal?.current_place)}, {label(appData.personal?.current_pincode)}
                </p>
              </div>
              <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p class="text-xs font-bold text-purple-700 mb-2">Permanent Address</p>
                <p class="text-sm text-gray-700">{label(appData.personal?.permanent_address)}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {label(appData.personal?.permanent_place)}, {label(appData.personal?.permanent_pincode)}
                </p>
              </div>
            </div>

          <!-- ===== ACADEMIC INFO ===== -->
          {:else if activeTab === 'academic'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">Academic Info</h3>
            {#if appData.education}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Student Name</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.student_name)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Course Name</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.course_name)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Course Type</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.course_type)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Course Duration</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.course_duration)} Years</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Mode of Study</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.mode_of_study)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Purpose of Loan</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.purpose_of_loan)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Institution Name</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.institution_name)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">University</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.university)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Admission Status</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.admission_status)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Admission Year</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.admission_year)}</p>
                </div>
              </div>

              <!-- Fee Details -->
              <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-green-50 rounded-xl p-3 border border-green-100 text-center">
                  <p class="text-xs text-gray-500">Total Fee</p>
                  <p class="font-bold text-green-700 text-sm">{formatCurrency(appData.education.total_course_fee)}</p>
                </div>
                <div class="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
                  <p class="text-xs text-gray-500">Fee Paid</p>
                  <p class="font-bold text-blue-700 text-sm">{formatCurrency(appData.education.fee_paid)}</p>
                </div>
                <div class="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
                  <p class="text-xs text-gray-500">Remaining</p>
                  <p class="font-bold text-red-700 text-sm">{formatCurrency(appData.education.remaining_fee)}</p>
                </div>
                <div class="bg-purple-50 rounded-xl p-3 border border-purple-100 text-center">
                  <p class="text-xs text-gray-500">Loan Required</p>
                  <p class="font-bold text-purple-700 text-sm">{formatCurrency(appData.education.loan_required_amount)}</p>
                </div>
              </div>

              <!-- Bank Details -->
              <div class="mt-4 bg-gray-50 rounded-xl p-4">
                <p class="text-xs font-bold text-gray-700 mb-3">Bank Details</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p class="text-xs text-gray-500">Bank Name</p><p class="font-semibold text-sm">{label(appData.education.bank_name)}</p></div>
                  <div><p class="text-xs text-gray-500">Branch</p><p class="font-semibold text-sm">{label(appData.education.branch_name)}</p></div>
                  <div><p class="text-xs text-gray-500">IFSC</p><p class="font-semibold text-sm">{label(appData.education.ifsc_code)}</p></div>
                  <div><p class="text-xs text-gray-500">Account No</p><p class="font-semibold text-sm">{label(appData.education.account_number)}</p></div>
                </div>
              </div>
            {:else}
              <p class="text-gray-400 text-sm">No academic info found.</p>
            {/if}

          <!-- ===== GUARANTOR DETAILS ===== -->
          {:else if activeTab === 'guarantor'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">Guarantor Details</h3>
            {#if appData.guarantor}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Full Name</p>
                  <p class="font-semibold text-gray-800">{label(appData.guarantor.name || appData.guarantor.name)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Mobile</p>
                  <p class="font-semibold text-gray-800">{label(appData.guarantor.mobile || appData.guarantor.mobile)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Aadhar</p>
                  <p class="font-semibold text-gray-800">{label(appData.guarantor.aadhar || appData.guarantor.aadhar)}</p>
                </div>
                 <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p class="text-xs font-bold text-blue-700 mb-2">Current Address</p>
                        <p class="text-sm text-gray-700">{label(appData.guarantor?.current_address)}</p>
                        <p class="text-xs text-gray-500 mt-1">
                        {label(appData.guarantor?.current_place)}, {label(appData.guarantor?.current_pincode)}
                        </p>
                    </div>
                    <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <p class="text-xs font-bold text-purple-700 mb-2">Permanent Address</p>
                        <p class="text-sm text-gray-700">{label(appData.guarantor?.permanent_address)}</p>
                        <p class="text-xs text-gray-500 mt-1">
                        {label(appData.guarantor?.permanent_place)}, {label(appData.guarantor?.permanent_pincode)}
                        </p>
                 </div>
            </div>
              </div>
            {:else}
              <p class="text-gray-400 text-sm">No guarantor details found.</p>
            {/if}

          <!-- ===== COLLATERAL DETAILS ===== -->
          {:else if activeTab === 'collateral'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">Collateral Details</h3>

            <!-- Property -->
            {#if appData.collateral.properties?.length > 0}
              <p class="text-xs font-bold text-purple-700 uppercase mb-2">Property Collateral</p>
              {#each appData.collateral.properties as prop}
                <div class="bg-gray-50 rounded-xl p-4 mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p class="text-xs text-gray-500">Owner Name</p><p class="font-semibold text-sm">{label(prop.owner_name)}</p></div>
                  <div><p class="text-xs text-gray-500">Survey No</p><p class="font-semibold text-sm">{label(prop.survey_no)}</p></div>
                  <div><p class="text-xs text-gray-500">District</p><p class="font-semibold text-sm">{label(prop.district)}</p></div>
                  <div><p class="text-xs text-gray-500">Village</p><p class="font-semibold text-sm">{label(prop.village)}</p></div>
                  <div><p class="text-xs text-gray-500">Valuation</p><p class="font-semibold text-sm">{formatCurrency(prop.valuation)}</p></div>
                </div>
              {/each}
            {/if}

            <!-- FD -->
            {#if appData.collateral.fds?.length > 0}
              <p class="text-xs font-bold text-blue-700 uppercase mb-2 mt-4">FD Collateral</p>
              {#each appData.collateral.fds as fd}
                <div class="bg-gray-50 rounded-xl p-4 mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p class="text-xs text-gray-500">Bank Name</p><p class="font-semibold text-sm">{label(fd.bank_name)}</p></div>
                  <div><p class="text-xs text-gray-500">Branch</p><p class="font-semibold text-sm">{label(fd.branch_name)}</p></div>
                  <div><p class="text-xs text-gray-500">FD Amount</p><p class="font-semibold text-sm">{formatCurrency(fd.amount)}</p></div>
                  <div><p class="text-xs text-gray-500">Maturity Date</p><p class="font-semibold text-sm">{formatDate(fd.fd_maturity_date)}</p></div>
                </div>
              {/each}
            {/if}

            <!-- LIC -->
            {#if appData.collateral.lics?.length > 0}
              <p class="text-xs font-bold text-green-700 uppercase mb-2 mt-4">LIC Collateral</p>
              {#each appData.collateral.lics as lic}
                <div class="bg-gray-50 rounded-xl p-4 mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p class="text-xs text-gray-500">Policy Name</p><p class="font-semibold text-sm">{label(lic.policy_name)}</p></div>
                  <div><p class="text-xs text-gray-500">Policy Type</p><p class="font-semibold text-sm">{label(lic.policy_type)}</p></div>
                  <div><p class="text-xs text-gray-500">Surrender Value</p><p class="font-semibold text-sm">{formatCurrency(lic.policy_surrender_value)}</p></div>
                  <div><p class="text-xs text-gray-500">Receipt No</p><p class="font-semibold text-sm">{label(lic.policy_receipt_no)}</p></div>
                </div>
              {/each}
            {/if}

            <!-- Govt Employee -->
            {#if appData.collateral.govtEmployees?.length > 0}
              <p class="text-xs font-bold text-yellow-700 uppercase mb-2 mt-4">Govt Employee Guarantor</p>
              {#each appData.collateral.govtEmployees as govt}
                <div class="bg-gray-50 rounded-xl p-4 mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p class="text-xs text-gray-500">Full Name</p><p class="font-semibold text-sm">{label(govt.full_name)}</p></div>
                  <div><p class="text-xs text-gray-500">Department</p><p class="font-semibold text-sm">{label(govt.department_name)}</p></div>
                  <div><p class="text-xs text-gray-500">Designation</p><p class="font-semibold text-sm">{label(govt.designation)}</p></div>
                  <div><p class="text-xs text-gray-500">Employee ID</p><p class="font-semibold text-sm">{label(govt.employee_id_number)}</p></div>
                </div>
              {/each}
            {/if}

            {#if !appData.collateral.properties?.length && !appData.collateral.fds?.length && !appData.collateral.lics?.length && !appData.collateral.govtEmployees?.length}
              <p class="text-gray-400 text-sm">No collateral details found.</p>
            {/if}



            
          <!-- ===== DOCUMENT UPLOAD ===== -->
          {:else if activeTab === 'documents'}
            {@const sectionNameMap = {
              1: 'APPLICANT DOCUMENTS',
              2: 'APPLICANT DOCUMENTS',
              3: 'APPLICANT DOCUMENTS',
              4: 'APPLICANT DOCUMENTS',
              5: 'APPLICANT DOCUMENTS',
              6: 'CO-APPLICANT DOCUMENTS',
              7: 'COLLATERAL DOCUMENT — Property',
              8: 'COLLATERAL DOCUMENT — Govt Employee',
              9: 'COLLATERAL DOCUMENT — LIC Policy',
              10: 'COLLATERAL DOCUMENT — Fixed Deposit',
              11: 'STUDY ABROAD DOCUMENTS',
              12: 'GUARANTOR DOCUMENTS',
            }}
            {@const sectionOrderMap = { 1:1, 2:1, 3:1, 4:1, 5:1, 6:2, 12:3, 7:4, 8:5, 9:6, 10:7, 11:8 }}
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

            <h3 class="text-lg font-bold text-gray-800 mb-6">Uploaded Documents</h3>

            {#if groupedSections.length > 0}
              {#each groupedSections as section}
                <div class="mb-6">
                  <!-- Section Header -->
                  <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-5 py-3">
                    <h4 class="text-white font-bold text-sm uppercase tracking-wide">{section.section_name}</h4>
                  </div>

                  <!-- Column Headers -->
                  <div class="bg-gray-100 border-x border-gray-200 px-5 py-2 grid grid-cols-12">
                    <p class="col-span-9 text-xs font-bold text-gray-500 uppercase">Documents Name</p>
                    <p class="col-span-3 text-xs font-bold text-gray-500 uppercase text-right">View</p>
                  </div>

                  <!-- Docs -->
                  <div class="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden divide-y divide-gray-100">
                    {#each section.docs as doc}
                      <div class="flex items-center justify-between px-5 py-3 bg-white hover:bg-gray-50 transition-colors">
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
                        <a
                          href={doc.file_name}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                        >
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
      </div>

    {/if}
  </div>
</div>