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
  import SubmissionSuccessModal from '$lib/components/upload-documents/SubmissionSuccessModal.svelte';
  import { submitApplication,getViewApplicationData, notifyApplicationSubmission } from '$lib/api/authApi.js';
  import jsPDF from 'jspdf';



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
  $: mode = $page.url.searchParams.get('mode'); // 'review' = came from upload
  $: activeTab = mode === 'review' ? 'review' : 'identity';
  $: isReviewMode = mode === 'review';
    const allTabs = [
  { id: 'identity', reviewOnly: false },
  { id: 'personal', reviewOnly: false },
  { id: 'academic', reviewOnly: false },
  { id: 'guarantor', reviewOnly: false },
  { id: 'collateral', reviewOnly: false },
  { id: 'documents', reviewOnly: false },
  { id: 'review', reviewOnly: true }
];

  $: isReviewMode = $page.url.searchParams.get('mode') === 'review';
  $: activeTab = isReviewMode ? 'review' : 'identity';
  $: tabs = isReviewMode
    ? allTabs   // show ALL tabs including Review & Submit
    : allTabs.filter(t => !t.reviewOnly);  // hide Review & Submit

   onMount(async () => {
    if (!$user) { goto(`/${locale}/login`); return; }
    if (!$applicationId) { goto(`/${locale}/dashboard`); return; }

    try {
      const result = await getViewApplicationData($user.id, $applicationId);
      if (result.error !== 0) {
        error = result.errorMsg || 'Failed to load application';
      } else {
        appData = result.data;
        const stored = sessionStorage.getItem('submissionSuccess');
        if (!stored) isSubmitted = false;
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


//review 


  let isSubmitting = false;
  let submitError = '';
  let showSuccessModal = false;

  // true = already submitted (status=2), false = pending
  $: isSubmitted = false; // will be set after load

   async function handleSubmitApplication() {
    if (!$user?.id || !$applicationId) {
      submitError = 'Session expired. Please login again.';
      return;
    }
    isSubmitting = true;
    submitError = '';
    try {
     const result = await submitApplication($user.id, $applicationId);
      if (result.error !== 0) {
        submitError = result.errorMsg || 'Submission failed';
        return;
      }
      // Fire notification - don't block modal on success/fail
      notifyApplicationSubmission($user.id, $applicationId).catch(console.error);
      showSuccessModal = true;

    } catch (e) {
      submitError = 'Server error. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

 function label(val, fallback = 'N/A') {
    return val || fallback;
  }

function handleDownloadPDF() {
    const doc = new jsPDF();

     function pdfCurrency(val) {
      if (!val || isNaN(Number(val))) return 'N/A';
      return 'Rs. ' + Number(val).toLocaleString('en-IN');
    }

    const applicantName = appData.personal?.name || 'Applicant';
    const appId = $applicationId;
    const fileName = `${applicantName}_Application_${appId}.pdf`;

    let y = 15;
    const lineH = 7;
    const margin = 14;
    const pageH = doc.internal.pageSize.height;

    function checkPage() {
      if (y > pageH - 20) { doc.addPage(); y = 15; }
    }

    function sectionTitle(title, color = [88, 28, 135]) {
      checkPage();
      doc.setFillColor(...color);
      doc.rect(margin, y, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 3, y + 5.5);
      y += 12;
      doc.setTextColor(30, 30, 30);
    }

    function field(label, value) {
      checkPage();
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value || 'N/A'), margin + 55, y);
      y += lineH;
    }

    // Header
    doc.setFillColor(88, 28, 135);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Education Loan Application', margin, 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Application ID: #${appId}   |   Applicant: ${applicantName}`, margin, 17);
    y = 30;
    doc.setTextColor(30, 30, 30);

    // Identity
    sectionTitle('IDENTITY CHECK', [37, 99, 235]);
    field('Full Name', appData.personal?.name);
    field('Aadhar Number', appData.personal?.aadhar);
    field('Date of Birth', formatDate(appData.personal?.dob));
    field('Gender', appData.personal?.gender);
    field('Religion', appData.personal?.religion);
    field('Resident', appData.personal?.resident);

    // Personal
    sectionTitle('PERSONAL DETAILS',[37, 99, 235]);
    field('Mobile', appData.personal?.mobile);
    field('Email', appData.personal?.email);
    field('PAN Card', appData.personal?.pan);
    field('Marital Status', appData.personal?.marital_status);
    field('Education Qual.', appData.personal?.education_qualification);
    field('Guardian Name', appData.personal?.guardian_name);
    field('Occupation', appData.personal?.occupation);
    field('Annual Income', pdfCurrency(appData.personal?.income));
    field('Current Address', `${appData.personal?.current_address || ''}, ${appData.personal?.current_place || ''} - ${appData.personal?.current_pincode || ''}`);
    field('Permanent Address', `${appData.personal?.permanent_address || ''}, ${appData.personal?.permanent_place || ''} - ${appData.personal?.permanent_pincode || ''}`);

    // Academic
    sectionTitle('ACADEMIC INFORMATION', [37, 99, 235]);
    field('Student Name', appData.education?.student_name);
    field('Course Name', appData.education?.course_name);
    field('Course Type', appData.education?.course_type);
    field('Duration', `${appData.education?.course_duration || ''} Years`);
    field('Mode of Study', appData.education?.mode_of_study);
    field('Purpose of Loan', appData.education?.purpose_of_loan);
    field('Institution', appData.education?.institution_name);
    field('University', appData.education?.university);
    field('Admission Status', appData.education?.admission_status);
    field('Admission Year', appData.education?.admission_year);
    field('Total Fee', pdfCurrency(appData.education?.total_course_fee));
    field('Fee Paid', pdfCurrency(appData.education?.fee_paid));
    field('Remaining Fee', pdfCurrency(appData.education?.remaining_fee));
    field('Loan Required', pdfCurrency(appData.education?.loan_required_amount));
    field('Bank Name', appData.education?.bank_name);
    field('Branch', appData.education?.branch_name);
    field('IFSC Code', appData.education?.ifsc_code);
    field('Account No', appData.education?.account_number);

    // Guarantor
    if (appData.guarantor) {
      sectionTitle('GUARANTOR DETAILS', [37, 99, 235]);
      field('Full Name', appData.guarantor?.name);
      field('Mobile', appData.guarantor?.mobile);
      field('Aadhar', appData.guarantor?.aadhar);
      field('Current Address', `${appData.guarantor?.current_address || ''}, ${appData.guarantor?.current_place || ''}`);
      field('Permanent Address', `${appData.guarantor?.permanent_address || ''}, ${appData.guarantor?.permanent_place || ''}`);
    }

    // Collateral
    if (appData.collateral?.properties?.length > 0) {
      sectionTitle('COLLATERAL — PROPERTY', [37, 99, 235]);
      appData.collateral.properties.forEach((p, i) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text(`Property ${i + 1}`, margin, y); y += lineH;
        doc.setFont('helvetica', 'normal');
        field('Survey No', p.survey_no);
        field('District', p.district_id);
        field('Village', p.place);
        field('Area', `${p.area_value || ''} ${p.units || ''}`);
        field('Valuation', pdfCurrency(p.property_value));
      });
    }

    if (appData.collateral?.fds?.length > 0) {
      sectionTitle('COLLATERAL — FIXED DEPOSIT', [37, 99, 235]);
      appData.collateral.fds.forEach((fd, i) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text(`FD ${i + 1}`, margin, y); y += lineH;
        doc.setFont('helvetica', 'normal');
        field('Bank', fd.bank_name);
        field('Branch', fd.branch_name);
        field('FD Amount', pdfCurrency(fd.amount));
        field('Maturity Date', formatDate(fd.fd_maturity_date));
      });
    }

    if (appData.collateral?.lics?.length > 0) {
      sectionTitle('COLLATERAL — LIC POLICY',[37, 99, 235]);
      appData.collateral.lics.forEach((l, i) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text(`LIC ${i + 1}`, margin, y); y += lineH;
        doc.setFont('helvetica', 'normal');
        field('Policy Name', l.policy_name);
        field('Policy Type', l.policy_type);
        field('Surrender Value', pdfCurrency(l.policy_surrender_value));
        field('Receipt No', l.policy_receipt_no);
      });
    }

    if (appData.collateral?.govtEmployees?.length > 0) {
      sectionTitle('COLLATERAL — GOVT EMPLOYEE', [37, 99, 235]);
      appData.collateral.govtEmployees.forEach((g, i) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text(`Govt Employee ${i + 1}`, margin, y); y += lineH;
        doc.setFont('helvetica', 'normal');
        field('Department', g.department_office_name);
        field('Designation', g.designation);
        field('Employee ID', g.employee_id_number);
      });
    }

    // Documents list
    if (appData.allDocs?.length > 0) {
      sectionTitle('UPLOADED DOCUMENTS', [37, 99, 235]);
      appData.allDocs.forEach(doc2 => {
        checkPage();
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${doc2.document_name}`, margin + 2, y);
        y += lineH;
      });
    }

    // Footer on each page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${totalPages}  |  ${applicantName}  |  Application #${appId}`, margin, pageH - 8);
    }

    doc.save(fileName);
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
  
   <SubmissionSuccessModal
    bind:show={showSuccessModal}
    applicationId={$applicationId}
    on:goToDashboard={() => { applicationId.set(null); goto(`/${locale}/dashboard`); }}
  />

  <!-- <ApplicationStepper currentStep={6} {locale} /> -->

    <div class="w-full px-4 sm:px-6 lg:px-10 py-8 pb-16">

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">{t.dashboard.viewApplication}</h2>
        <p class="text-sm text-gray-500 mt-1">{t.dashboard.applicationId}: #{$applicationId}</p>
      </div>
       <div class="flex items-center gap-2">
        <button
          on:click={handleDownloadPDF}
          class="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold shadow"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          {t.applicationStart.downloadPdf}
        </button>
        <button
          on:click={() => goto(`/${locale}/dashboard`)}
          class="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          {t.applicationStart.backToDashboard}
        </button>
      </div>
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
          <p class="text-xs text-gray-500 mt-2 font-medium">{t.dashboard.applicantPhoto}</p>
        </div>

        <!-- Name + ID -->
        <div class="flex-1 text-center sm:text-left">
          <h3 class="text-2xl font-bold text-gray-900">{label(appData.personal?.name)}</h3>
          <p class="text-gray-500 text-sm mt-1">{t.dashboard.applicationId}: <span class="font-semibold text-purple-600">#{$applicationId}</span></p>
          {#if isReviewMode}
            <div class="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
              <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
              <span class="text-yellow-700 text-xs font-semibold">{t.dashboard.decisionPending}</span>
            </div>
          {:else}
            <div class="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-green-700 text-xs font-semibold">{t.dashboard.applicationSubmittedLabel} — {t.dashboard.UnderReview}</span>
            </div>
          {/if}
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
          <p class="text-xs text-gray-500 mt-2 font-medium">{t.uploadDocuments.ApplicantDocument.signature}</p>
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
        {tab.id === 'review' ? t.tabs.reviewSubmit : t.tabs[tab.id]}
        </button>
        {/each}
        </div>
        <!-- Tab Content -->
            <div class="p-6 sm:p-8">
       

          {#if activeTab === 'identity'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">{t.stepper.step1}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.applicationStart.nameLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.name)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.applicationStart.aadharLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.aadhar)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.applicationStart.dobLabel}</p>
                <p class="font-semibold text-gray-800">{formatDate(appData.personal?.dob)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.applicationStart.genderLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.gender)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.applicationStart.religionCommunity}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.religion)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.applicationStart.resident}</p>
                <p class="font-semibold text-gray-800">{appData.personal?.resident === 1 ? 'Yes' : 'No'}</p>
              </div>
            </div>

          <!-- ===== PERSONAL DETAILS ===== -->
          {:else if activeTab === 'personal'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">{t.stepper.step2}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.personalDetails.mobileLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.mobile)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.personalDetails.emailLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.email)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.personalDetails.panLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.pan)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.personalDetails.maritalStatusLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.marital_status)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.personalDetails.educationLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.education_qualification)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.personalDetails.parentNameLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.guardian_name)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.personalDetails.occupationLabel}</p>
                <p class="font-semibold text-gray-800">{label(appData.personal?.occupation)}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-1">{t.personalDetails.annualIncomeLabel}</p>
                <p class="font-semibold text-gray-800">{formatCurrency(appData.personal?.income)}</p>
              </div>
            </div>

            <!-- Addresses -->
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p class="text-xs font-bold text-blue-700 mb-2">{t.personalDetails.currentStreetLabel}</p>
                <p class="text-sm text-gray-700">{label(appData.personal?.current_address)}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {label(appData.personal?.current_place)}, {label(appData.personal?.current_pincode)}
                </p>
              </div>
              <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p class="text-xs font-bold text-purple-700 mb-2">{t.personalDetails.permanentStreetLabel}</p>
                <p class="text-sm text-gray-700">{label(appData.personal?.permanent_address)}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {label(appData.personal?.permanent_place)}, {label(appData.personal?.permanent_pincode)}
                </p>
              </div>
            </div>

          <!-- ===== ACADEMIC INFO ===== -->
          {:else if activeTab === 'academic'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">{t.stepper.step3}</h3>
            {#if appData.education}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.studentNameLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.student_name)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.courseNameLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.course_name)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.courseTypeLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.course_type)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.courseDurationLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.course_duration)} Years</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.modeOfStudyLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.mode_of_study)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.purposeOfLoanLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.purpose_of_loan)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.instituteNameLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.institution_name)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.universityNameLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.university)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.admissionStatusLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.admission_status)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.academicInfo.admissionYearLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.education.admission_year)}</p>
                </div>
              </div>

              <!-- Fee Details -->
              <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-green-50 rounded-xl p-3 border border-green-100 text-center">
                  <p class="text-xs text-gray-500">{t.academicInfo.totalCourseFeeLabel}</p>
                  <p class="font-bold text-green-700 text-sm">{formatCurrency(appData.education.total_course_fee)}</p>
                </div>
                <div class="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
                  <p class="text-xs text-gray-500">{t.academicInfo.feePaidLabel}</p>
                  <p class="font-bold text-blue-700 text-sm">{formatCurrency(appData.education.fee_paid)}</p>
                </div>
                <div class="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
                  <p class="text-xs text-gray-500">{t.academicInfo.remainingFeeLabel}</p>
                  <p class="font-bold text-red-700 text-sm">{formatCurrency(appData.education.remaining_fee)}</p>
                </div>
                <div class="bg-purple-50 rounded-xl p-3 border border-purple-100 text-center">
                  <p class="text-xs text-gray-500">{t.academicInfo.loanRequiredLabel}</p>
                  <p class="font-bold text-purple-700 text-sm">{formatCurrency(appData.education.loan_required_amount)}</p>
                </div>
              </div>

              <!-- Bank Details -->
              <div class="mt-4 bg-gray-50 rounded-xl p-4">
                <p class="text-xs font-bold text-gray-700 mb-3">{t.academicInfo.section5Title}</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p class="text-xs text-gray-500">{t.academicInfo.bankNameLabel}</p><p class="font-semibold text-sm">{label(appData.education.bank_name)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.academicInfo.branchNameLabel}</p><p class="font-semibold text-sm">{label(appData.education.branch_name)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.academicInfo.ifscCodeLabel}</p><p class="font-semibold text-sm">{label(appData.education.ifsc_code)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.academicInfo.accountNumberLabel}</p><p class="font-semibold text-sm">{label(appData.education.account_number)}</p></div>
                </div>
              </div>
            {:else}
              <p class="text-gray-400 text-sm">No academic info found.</p>
            {/if}

          <!-- ===== GUARANTOR DETAILS ===== -->
          {:else if activeTab === 'guarantor'}
            <h3 class="text-lg font-bold text-gray-800 mb-4">{t.stepper.step4}</h3>
            {#if appData.guarantor}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.guarantorDetails.guarantorFullNameLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.guarantor.name || appData.guarantor.name)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.guarantorDetails.guarantorMobileLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.guarantor.mobile || appData.guarantor.mobile)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">{t.guarantorDetails.guarantorAadharLabel}</p>
                  <p class="font-semibold text-gray-800">{label(appData.guarantor.aadhar || appData.guarantor.aadhar)}</p>
                </div>
                 <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p class="text-xs font-bold text-blue-700 mb-2">{t.guarantorDetails.currentStreetAddressLabel}</p>
                        <p class="text-sm text-gray-700">{label(appData.guarantor?.current_address)}</p>
                        <p class="text-xs text-gray-500 mt-1">
                        {label(appData.guarantor?.current_place)}, {label(appData.guarantor?.current_pincode)}
                        </p>
                    </div>
                    <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <p class="text-xs font-bold text-purple-700 mb-2">{t.guarantorDetails.permanentStreetAddressLabel}</p>
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
            <h3 class="text-lg font-bold text-gray-800 mb-4">{t.stepper.step5}</h3>

            <!-- Property -->
            {#if appData.collateral.properties?.length > 0}
              <p class="text-xs font-bold text-purple-700 uppercase mb-2">Property Collateral</p>

              {#each appData.collateral.properties as prop}
                <div class="bg-gray-50 rounded-xl p-4 mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.surveyNo}</p><p class="font-semibold text-sm">{label(prop.survey_no)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.propertyCollateralModal.district}</p><p class="font-semibold text-sm">{label(prop.district_id)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.village}</p><p class="font-semibold text-sm">{label(prop.place)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.propertyCollateralModal.units}</p><p class="font-semibold text-sm">{label(prop.units)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.personalDetails.areaLabel}</p><p class="font-semibold text-sm">{label(prop.area_value)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.valuation}</p><p class="font-semibold text-sm">{formatCurrency(prop.property_value)}</p></div>


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
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.policyName}</p><p class="font-semibold text-sm">{label(lic.policy_name)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.policyType}</p><p class="font-semibold text-sm">{label(lic.policy_type)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.policySurrenderValue}</p><p class="font-semibold text-sm">{formatCurrency(lic.policy_surrender_value)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.policyReceiptNo}</p><p class="font-semibold text-sm">{label(lic.policy_receipt_no)}</p></div>
                </div>
              {/each}
            {/if}

            <!-- Govt Employee -->
            {#if appData.collateral.govtEmployees?.length > 0}
              <p class="text-xs font-bold text-yellow-700 uppercase mb-2 mt-4">Govt Employee Guarantor</p>
              {#each appData.collateral.govtEmployees as govt}
                <div class="bg-gray-50 rounded-xl p-4 mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.govtEmployeeModal.departmentName}</p><p class="font-semibold text-sm">{label(govt.department_office_name)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.govtEmployeeModal.designation}</p><p class="font-semibold text-sm">{label(govt.designation)}</p></div>
                  <div><p class="text-xs text-gray-500">{t.collateralDetails.govtEmployeeModal.employeeID}</p><p class="font-semibold text-sm">{label(govt.employee_id_number)}</p></div>
                </div>
              {/each}
            {/if}

            {#if !appData.collateral.properties?.length && !appData.collateral.fds?.length && !appData.collateral.lics?.length && !appData.collateral.govtEmployees?.length}
              <p class="text-gray-400 text-sm">No collateral details found.</p>
            {/if}



          <!-- document -->
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

          <h3 class="text-lg font-bold text-gray-800 mb-6">{t.stepper.step6}</h3>

            {#if groupedSections.length > 0}
              {#each groupedSections as section}
                <div class="mb-6">
                  <!-- Section Header -->
                  <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl px-5 py-3">
                    <h4 class="text-white font-bold text-sm uppercase tracking-wide">{section.section_name}</h4>
                  </div>

                  <!-- Column Headers -->
                  <div class="bg-gray-100 border-x border-gray-200 px-5 py-2 grid grid-cols-12">
                    <p class="col-span-9 text-xs font-bold text-gray-500 uppercase">{t.uploadDocuments.ApplicantDocument.documentName}</p>
                    <p class="col-span-3 text-xs font-bold text-gray-500 uppercase text-right">{t.uploadDocuments.ApplicantDocument.uploadView}</p>
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
                          {t.uploadDocuments.ApplicantDocument.view}
                        </a>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
           {:else}
              <p class="text-gray-400 text-sm">No documents uploaded yet.</p>
            {/if}

            <!-- Review the application -------------- -->
            {:else if activeTab === 'review'}
            <h3 class="text-lg font-bold text-gray-800 mb-6">{t.dashboard.reviewAndSubmit}</h3>

            <!-- Summary Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p class="text-sm font-bold text-blue-600">{$applicationId}</p>
                <p class="text-xs text-gray-500 mt-1">{t.dashboard.applicationId}</p>
              </div>
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p class="text-sm font-bold text-blue-600">{label(appData.personal?.name)}</p>
                <p class="text-xs text-gray-500 mt-1">{t.applicationStart.nameLabel}</p>
              </div>
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p class="text-sm font-bold text-blue-600">{label(appData.education?.course_name)}</p>
                <p class="text-xs text-gray-500 mt-1">{t.academicInfo.courseNameLabel}</p>
              </div>
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p class="text-sm font-bold text-blue-600">{formatCurrency(appData.education?.loan_required_amount)}</p>
                <p class="text-xs text-gray-500 mt-1">{t.academicInfo.loanRequiredLabel}</p>
              </div>
            </div>

            <!-- Checklist -->
           <!-- Checklist -->
      <div class="mb-6 space-y-2">
      {#each [
        { label: 'personalDetails', done: !!appData.personal?.mobile },
        { label: 'academicInformation', done: !!appData.education?.course_name },
        { label: 'guarantorDetails', done: !!appData.guarantor },
        { label: 'collateralDetails', done: (appData.collateral?.properties?.length > 0 || appData.collateral?.fds?.length > 0 || appData.collateral?.lics?.length > 0 || appData.collateral?.govtEmployees?.length > 0) },
        { label: 'documentsUploaded', done: appData.allDocs?.length > 0 },
      ] as item}

      <div class="flex items-center gap-3 p-3 rounded-lg {item.done ? 'bg-green-20 border border-green-100' : 'bg-red-50 border border-red-100'}">

  <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 {item.done ? 'bg-green-500' : 'bg-red-400'}">
    {#if item.done}
      <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
      </svg>
    {:else}
      <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    {/if}
  </div>

  <span class="text-sm font-medium {item.done ? 'text-green-800' : 'text-red-700'}">
   {t.checklist[item.label] ?? item.label}
  </span>

  <span class="ml-auto text-xs font-semibold {item.done ? 'text-green-600' : 'text-red-500'}">
      {item.done ? t.checklist.complete : t.checklist.pending}
  </span>

</div>
{/each}
</div>

            <!-- Declaration -->
            <div class="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
              <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-yellow-800">
                <span class="font-bold">{t.declaration}: </span>
                {t.iHereBy}
              </p>
            </div>

            {#if submitError}
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600 font-medium">{submitError}</p>
              </div>
            {/if}

            <!-- Action Buttons -->
            <div class="flex justify-between items-center">
              <button
                on:click={() => goto(`/${locale}/application/upload-documents`)}
                class="flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                {t.uploadDocuments.backToDocs}
              </button>
              <div>
              <button
                on:click={handleSubmitApplication}
                disabled={isSubmitting}
                class="px-10 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg text-sm flex items-center gap-2"
              >
                {#if isSubmitting}
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting...
                {:else}
                  {t.uploadDocuments.submitApplication}
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

    {/if}
  </div>
</div>