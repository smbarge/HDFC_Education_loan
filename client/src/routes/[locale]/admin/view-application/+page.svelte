<script>
  // @ts-nocheck
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getViewApplicationData } from '$lib/api/authApi.js';


  $: locale = $page.params.locale || 'en';

  let isLoading = true;
  let appData = null;
  let error = null;
  let appId = null;

  function formatDate(val) {
    if (!val) return 'N/A';
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function formatCurrency(val) {
    if (!val) return 'N/A';
    return '₹' + Number(val).toLocaleString('en-IN');
  }
  function lbl(val, fallback = 'N/A') {
    return val || fallback;
  }

  onMount(async () => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) { goto(`/${locale}/admin/login`); return; }

  appId = $page.url.searchParams.get('appId');
  if (!appId) {
    error = 'No application ID provided.';
    isLoading = false;
    return;
  }

  // Set adminToken as accessToken so getViewApplicationData picks it up
  localStorage.setItem('accessToken', adminToken);
  console.log('adminToken set as accessToken:', adminToken?.substring(0, 30) + '...');

  try {
    const result = await getViewApplicationData(0, appId);
    console.log('getViewApplicationData result:', result);

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

</script>

<svelte:head>
  <title>View Application — Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">

  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/MaulanaAzad.jpg" alt="MAMFDC Logo" class="h-10 w-auto object-contain"/>
        <div>
          <h1 class="text-sm font-semibold text-gray-900">MAMFDC — Admin View</h1>
          <p class="text-xs text-gray-500">Application #{appId}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          on:click={() => window.print()}
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
          </svg>
          Print
        </button>
        <button
          on:click={() => window.close()}
          class="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Close
        </button>
      </div>
    </div>
  </header>

  <div class="w-full px-4 sm:px-6 lg:px-10 py-6 pb-10">

    {#if isLoading}
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center">
        <svg class="animate-spin h-9 w-9 text-purple-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p class="text-gray-500">Loading application...</p>
      </div>

    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700">{error}</div>

    {:else if appData}

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        <!-- Banner -->
        <div class="bg-gradient-to-r from-purple-700 to-purple-900 px-6 sm:px-8 py-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="text-white text-lg font-bold">MAMFDC Education Loan Application</h3>
              <p class="text-purple-200 text-sm mt-0.5">
                Application ID: <span class="font-bold text-white">#{appId}</span>
              </p>
            </div>
            <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-400 text-blue-900 rounded-full text-xs font-bold self-start">
              Admin View
            </span>
          </div>
        </div>

        <!-- Photo + Info + Signature -->
        <div class="border-b-4 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <div class="px-6 sm:px-8 py-2 bg-purple-700">
            <h4 class="text-white font-bold text-xs uppercase tracking-widest">Applicant Info</h4>
          </div>
          <div class="px-6 sm:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">

            <!-- Photo -->
            <div class="flex flex-col items-center gap-2 flex-shrink-0">
              {#if appData.documents?.photo}
                <img src={appData.documents.photo} alt="Photo"
                  class="w-32 h-36 object-cover border-4 border-purple-300 rounded-lg shadow-lg"/>
              {:else}
                <div class="w-32 h-36 border-4 border-dashed border-purple-300 rounded-lg bg-purple-50 flex items-center justify-center">
                  <span class="text-xs text-purple-400">No Photo</span>
                </div>
              {/if}
              <span class="text-xs text-purple-700 font-bold uppercase">Photo</span>
            </div>

            <!-- Core Info -->
            <div class="flex-1 bg-white rounded-lg border-2 border-purple-200 p-5 shadow-sm">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {#each [
                  ['Name',   lbl(appData.personal?.name)],
                  ['DOB',    formatDate(appData.personal?.dob)],
                  ['Aadhar', lbl(appData.personal?.aadhar)],
                  ['Mobile', lbl(appData.personal?.mobile)],
                  ['Email',  lbl(appData.personal?.email)],
                ] as [label, value]}
                  <div class="flex flex-col gap-1">
                    <span class="text-xs font-semibold text-purple-700 uppercase tracking-wide">{label}</span>
                    <span class="text-base font-bold text-gray-900 border-b-2 border-dotted border-gray-300 pb-1 break-all">{value}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Signature -->
            <div class="flex flex-col items-center gap-2 flex-shrink-0">
              {#if appData.documents?.signature}
                <div class="bg-white rounded-lg border-4 border-purple-300 shadow-lg p-2">
                  <img src={appData.documents.signature} alt="Signature" class="h-24 w-44 object-contain"/>
                </div>
              {:else}
                <div class="h-24 w-44 border-4 border-dashed border-purple-300 rounded-lg bg-purple-50 flex items-center justify-center">
                  <span class="text-xs text-purple-400">No Signature</span>
                </div>
              {/if}
              <span class="text-xs text-purple-700 font-bold uppercase">Signature</span>
            </div>
          </div>
        </div>

        <!-- IDENTITY CHECK -->
        <div class="border-b border-gray-200">
          <div class="bg-purple-700 px-6 sm:px-8 py-2">
            <h4 class="text-white font-bold text-xs uppercase tracking-widest">Identity Check</h4>
          </div>
          <div class="px-6 sm:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
            {#each [
              ['Full Name',          lbl(appData.personal?.name)],
              ['Aadhar Number',      lbl(appData.personal?.aadhar)],
              ['Date of Birth',      formatDate(appData.personal?.dob)],
              ['Gender',             lbl(appData.personal?.gender)],
              ['Religion/Community', lbl(appData.personal?.religion)],
              ['Resident',           appData.personal?.resident],
            ] as [label, value]}
              <div class="flex items-baseline gap-2 py-2 border-b border-dotted border-gray-200">
                <span class="text-xs text-gray-500 w-44 flex-shrink-0">{label}</span>
                <span class="text-sm font-semibold text-gray-900">{value || '—'}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- PERSONAL DETAILS -->
        <div class="border-b border-gray-200">
          <div class="bg-purple-700 px-6 sm:px-8 py-2">
            <h4 class="text-white font-bold text-xs uppercase tracking-widest">Personal Details</h4>
          </div>
          <div class="px-6 sm:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
            {#each [
              ['Mobile',             lbl(appData.personal?.mobile)],
              ['Email',              lbl(appData.personal?.email)],
              ['PAN',                lbl(appData.personal?.pan)],
              ['Marital Status',     lbl(appData.personal?.marital_status)],
              ['Education',          lbl(appData.personal?.education_qualification)],
              ['Guardian Name',      lbl(appData.personal?.guardian_name)],
              ['Occupation',         lbl(appData.personal?.occupation)],
              ['Annual Income',      formatCurrency(appData.personal?.income)],
            ] as [label, value]}
              <div class="flex items-baseline gap-2 py-2 border-b border-dotted border-gray-200">
                <span class="text-xs text-gray-500 w-44 flex-shrink-0">{label}</span>
                <span class="text-sm font-semibold text-gray-900">{value || '—'}</span>
              </div>
            {/each}
          </div>
          <div class="px-6 sm:px-8 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="py-2">
              <span class="text-xs text-gray-500 block mb-1 font-semibold">Current Address</span>
              <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
                {lbl(appData.personal?.current_address)}, {lbl(appData.personal?.current_place)} — {lbl(appData.personal?.current_pincode)}
              </span>
            </div>
            <div class="py-2">
              <span class="text-xs text-gray-500 block mb-1 font-semibold">Permanent Address</span>
              <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
                {lbl(appData.personal?.permanent_address)}, {lbl(appData.personal?.permanent_place)} — {lbl(appData.personal?.permanent_pincode)}
              </span>
            </div>
          </div>
        </div>

        <!-- EDUCATION DETAILS -->
        {#if appData.education}
          <div class="border-b border-gray-200">
            <div class="bg-purple-700 px-6 sm:px-8 py-2">
              <h4 class="text-white font-bold text-xs uppercase tracking-widest">Academic Information</h4>
            </div>
            <div class="px-6 sm:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
              {#each [
                ['Student Name',     lbl(appData.education.student_name)],
                ['Course Name',      lbl(appData.education.course_name)],
                ['Course Type',      lbl(appData.education.course_type)],
                ['Duration',         `${lbl(appData.education.course_duration)} Years`],
                ['Mode of Study',    lbl(appData.education.mode_of_study)],
                ['Purpose of Loan',  lbl(appData.education.purpose_of_loan)],
                ['University',       lbl(appData.education.university)],
                ['Admission Status', lbl(appData.education.admission_status)],
                ['Admission Year',   lbl(appData.education.admission_year)],
              ] as [label, value]}
                <div class="flex items-baseline gap-2 py-2 border-b border-dotted border-gray-200">
                  <span class="text-xs text-gray-500 w-44 flex-shrink-0">{label}</span>
                  <span class="text-sm font-semibold text-gray-900">{value || '—'}</span>
                </div>
              {/each}
            </div>
            <div class="px-6 sm:px-8 pb-2">
              <span class="text-xs text-gray-500 block mb-1 font-semibold">Institution Name</span>
              <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
                {lbl(appData.education.institution_name)}
              </span>
            </div>
            <!-- Fee Row -->
            <div class="px-6 sm:px-8 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-x-10">
              {#each [
                ['Total Fee',   formatCurrency(appData.education.total_course_fee),      'text-gray-900'],
                ['Fee Paid',    formatCurrency(appData.education.fee_paid),              'text-blue-700'],
                ['Remaining',   formatCurrency(appData.education.remaining_fee),         'text-red-600'],
                ['Loan Amount', formatCurrency(appData.education.loan_required_amount),  'text-purple-700'],
              ] as [label, value, color]}
                <div class="flex flex-col py-2 border-b border-dotted border-gray-200">
                  <span class="text-xs text-gray-500">{label}</span>
                  <span class="text-sm font-bold {color} mt-0.5">{value}</span>
                </div>
              {/each}
            </div>
            <!-- Bank Details -->
            <div class="mx-6 sm:mx-8 my-3 rounded-lg border border-gray-200 overflow-hidden">
              <div class="bg-gray-100 px-4 py-1.5">
                <span class="text-xs font-bold text-gray-600 uppercase tracking-wide">Bank Details</span>
              </div>
              <div class="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-x-8">
                {#each [
                  ['Bank Name',      lbl(appData.education.bank_name)],
                  ['Branch',         lbl(appData.education.branch_name)],
                  ['IFSC Code',      lbl(appData.education.ifsc_code)],
                  ['Account Number', lbl(appData.education.account_number)],
                ] as [label, value]}
                  <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                    <span class="text-xs text-gray-500">{label}</span>
                    <span class="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</span>
                  </div>
                {/each}
              </div>
            </div>
            <div class="pb-2"></div>
          </div>
        {/if}

        <!-- GUARANTOR -->
        {#if appData.guarantor}
          <div class="border-b border-gray-200">
            <div class="bg-purple-700 px-6 sm:px-8 py-2">
              <h4 class="text-white font-bold text-xs uppercase tracking-widest">Guarantor Details</h4>
            </div>
            <div class="px-6 sm:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
              {#each [
                ['Full Name', lbl(appData.guarantor.name)],
                ['Mobile',    lbl(appData.guarantor.mobile)],
                ['Aadhar',    lbl(appData.guarantor.aadhar)],
              ] as [label, value]}
                <div class="flex items-baseline gap-2 py-2 border-b border-dotted border-gray-200">
                  <span class="text-xs text-gray-500 w-44 flex-shrink-0">{label}</span>
                  <span class="text-sm font-semibold text-gray-900">{value || '—'}</span>
                </div>
              {/each}
            </div>
            <div class="px-6 sm:px-8 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="py-2">
                <span class="text-xs text-gray-500 block mb-1 font-semibold">Current Address</span>
                <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
                  {lbl(appData.guarantor?.current_address)}, {lbl(appData.guarantor?.current_place)} — {lbl(appData.guarantor?.current_pincode)}
                </span>
              </div>
              <div class="py-2">
                <span class="text-xs text-gray-500 block mb-1 font-semibold">Permanent Address</span>
                <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
                  {lbl(appData.guarantor?.permanent_address)}, {lbl(appData.guarantor?.permanent_place)} — {lbl(appData.guarantor?.permanent_pincode)}
                </span>
              </div>
            </div>
          </div>
        {/if}

        <!-- COLLATERAL -->
        {#if appData.collateral && (appData.collateral.properties?.length || appData.collateral.fds?.length || appData.collateral.lics?.length || appData.collateral.govtEmployees?.length)}
          <div class="border-b border-gray-200">
            <div class="bg-purple-700 px-6 sm:px-8 py-2">
              <h4 class="text-white font-bold text-xs uppercase tracking-widest">Collateral Details</h4>
            </div>
            <div class="px-6 sm:px-8 py-4 space-y-4">

              {#each appData.collateral.properties || [] as prop, i}
                <div>
                  <p class="text-xs font-bold text-purple-700 uppercase mb-2">Property {i + 1}</p>
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8">
                    {#each [
                      ['Survey No',  lbl(prop.survey_no)],
                      ['District',   lbl(prop.district_id)],
                      ['Place',      lbl(prop.place)],
                      ['Units',      lbl(prop.units)],
                      ['Area',       lbl(prop.area_value)],
                      ['Valuation',  formatCurrency(prop.property_value)],
                    ] as [label, value]}
                      <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                        <span class="text-xs text-gray-500">{label}</span>
                        <span class="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}

              {#each appData.collateral.fds || [] as fd, i}
                <div>
                  <p class="text-xs font-bold text-blue-700 uppercase mb-2">Fixed Deposit {i + 1}</p>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-8">
                    {#each [
                      ['Bank Name',     lbl(fd.bank_name)],
                      ['Branch',        lbl(fd.branch_name)],
                      ['FD Amount',     formatCurrency(fd.amount)],
                      ['Maturity Date', formatDate(fd.fd_maturity_date)],
                    ] as [label, value]}
                      <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                        <span class="text-xs text-gray-500">{label}</span>
                        <span class="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}

              {#each appData.collateral.lics || [] as lic, i}
                <div>
                  <p class="text-xs font-bold text-green-700 uppercase mb-2">LIC Policy {i + 1}</p>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-8">
                    {#each [
                      ['Policy Name',     lbl(lic.policy_name)],
                      ['Policy Type',     lbl(lic.policy_type)],
                      ['Surrender Value', formatCurrency(lic.policy_surrender_value)],
                      ['Receipt No',      lbl(lic.policy_receipt_no)],
                    ] as [label, value]}
                      <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                        <span class="text-xs text-gray-500">{label}</span>
                        <span class="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}

              {#each appData.collateral.govtEmployees || [] as govt, i}
                <div>
                  <p class="text-xs font-bold text-amber-700 uppercase mb-2">Govt. Employee {i + 1}</p>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-8">
                    {#each [
                      ['Department', lbl(govt.department_office_name)],
                      ['Designation',lbl(govt.designation)],
                      ['Employee ID',lbl(govt.employee_id_number)],
                    ] as [label, value]}
                      <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                        <span class="text-xs text-gray-500">{label}</span>
                        <span class="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}

            </div>
          </div>
        {/if}

        <!-- DOCUMENTS -->
        {#if appData.allDocs?.length > 0}
          <div>
            <div class="bg-purple-700 px-6 sm:px-8 py-2 flex items-center justify-between">
              <h4 class="text-white font-bold text-xs uppercase tracking-widest">Uploaded Documents</h4>
              <span class="text-purple-200 text-xs">{appData.allDocs.length} files</span>
            </div>
            <div class="px-6 sm:px-8 py-4 space-y-2">
              {#each appData.allDocs as doc}
                <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">{doc.document_name}</p>
                      <p class="text-xs text-gray-400">{doc.section_name || ''}</p>
                    </div>
                  </div>
                  <a href={doc.file_name} target="_blank" rel="noopener noreferrer"
                    class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
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
        {/if}

      </div>
    {/if}
  </div>
</div>