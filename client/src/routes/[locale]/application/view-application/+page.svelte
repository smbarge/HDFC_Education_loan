<script>
  // @ts-nocheck
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import { user, logout as logoutStore, applicationId } from '$lib/stores/userStore';
  import SubmissionSuccessModal from '$lib/components/upload-documents/SubmissionSuccessModal.svelte';
  import { submitApplication, getViewApplicationData, notifyApplicationSubmission } from '$lib/api/authApi.js';
  import jsPDF from 'jspdf';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let showProfileModal = false;
  let isLoading = true;
  let appData = null;
  let error = null;
  let isSubmitting = false;
  let submitError = '';
  let showSuccessModal = false;
  let agreeChecked = false;

  $: userData = $user
    ? { name: $user.name || 'Guest User', phone: $user.mobile || '', username: $user.username || '' }
    : { name: 'Guest User', phone: '', username: '' };

  $: isReviewMode = $page.url.searchParams.get('mode') === 'review';

  onMount(async () => {
    if (!$user) { goto(`/${locale}/login`); return; }
    if (!$applicationId) { goto(`/${locale}/dashboard`); return; }
    try {
      const result = await getViewApplicationData($user.id, $applicationId);
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
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function formatCurrency(val) {
    if (!val) return 'N/A';
    return '₹' + Number(val).toLocaleString('en-IN');
  }
  function label(val, fallback = 'N/A') {
    return val || fallback;
  }

  async function handleSubmitApplication() {
    if (!agreeChecked) return;
    if (!$user?.id || !$applicationId) { submitError = 'Session expired. Please login again.'; return; }
    isSubmitting = true;
    submitError = '';
    try {
      const result = await submitApplication($user.id, $applicationId);
      if (result.error !== 0) { submitError = result.errorMsg || 'Submission failed'; return; }
      await notifyApplicationSubmission($user.id, $applicationId).catch(console.error);
      showSuccessModal = true;
    } catch (e) {
      submitError = 'Server error. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDownloadPDF() {
    const doc = new jsPDF();

    function pdfCurrency(val) {
      if (!val || isNaN(Number(val))) return 'N/A';
      return 'Rs. ' + Number(val).toLocaleString('en-IN');
    }

    const applicantName = appData.personal?.name || 'Applicant';
    const appId = $applicationId;
    const fileName = `${applicantName}_Application_${appId}.pdf`;

    let y = 15;
    const lineH = 6;
    const margin = 14;
    const pageW = doc.internal.pageSize.width;
    const pageH = doc.internal.pageSize.height;
    const contentWidth = pageW - (2 * margin);

    function checkPage() {
      if (y > pageH - 25) {
        doc.addPage();
        y = 15;
      }
    }

    function sectionTitle(title) {
      checkPage();
      doc.setFillColor(88, 28, 135);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 2, y + 4.5);
      y += 10;
      doc.setTextColor(30, 30, 30);
    }

    function field(lbl, value) {
      checkPage();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(lbl + ':', margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);

      // Split text if too long
      const maxWidth = contentWidth - 52;
      const textValue = String(value || 'N/A');
      const lines = doc.splitTextToSize(textValue, maxWidth);

      doc.text(lines, margin + 50, y);

      // Dotted underline
      doc.setDrawColor(180, 180, 180);
      doc.setLineDash([1, 1], 0);
      doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
      doc.setLineDash([], 0);

      y += lineH + (lines.length > 1 ? (lines.length - 1) * 4 : 0);
    }

    function subSectionHeader(title) {
      checkPage();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(88, 28, 135);
      doc.text(title, margin, y);
      y += 5;
    }

    // Helper function to load image and convert to base64
    async function loadImageAsBase64(url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error('Failed to load image:', e);
        return null;
      }
    }

    // ═══════════════════════════════════
    // PDF HEADER BANNER
    // ═══════════════════════════════════
    doc.setFillColor(88, 28, 135);
    doc.rect(0, 0, pageW, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION LOAN APPLICATION', pageW / 2, 12, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Application No: #${appId}`, pageW / 2, 19, { align: 'center' });
    doc.text(`Applicant: ${applicantName}`, pageW / 2, 25, { align: 'center' });

    y = 38;

    // ═══════════════════════════════════
    // PHOTO, BASIC INFO, SIGNATURE ROW
    // ═══════════════════════════════════
    const photoUrl = appData.documents?.photo;
    const signatureUrl = appData.documents?.signature;

    // Load images if available
    let photoBase64 = null;
    let signatureBase64 = null;

    if (photoUrl) {
      photoBase64 = await loadImageAsBase64(photoUrl);
    }
    if (signatureUrl) {
      signatureBase64 = await loadImageAsBase64(signatureUrl);
    }

    // Photo
    if (photoBase64) {
      try {
        doc.addImage(photoBase64, 'JPEG', margin, y, 25, 30);
      } catch (e) {
        console.error('Failed to add photo:', e);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(margin, y, 25, 30);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Photo', margin + 12.5, y + 15, { align: 'center' });
      }
    } else {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, 25, 30);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Photo', margin + 12.5, y + 15, { align: 'center' });
    }

    // Basic info in middle
    const infoX = margin + 28;
    const infoY = y;
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);

    const infoFields = [
      { label: 'Name', value: applicantName, y: 3 },
      { label: 'DOB', value: formatDate(appData.personal?.dob), y: 9 },
      { label: 'Aadhar', value: label(appData.personal?.aadhar), y: 15 },
      { label: 'Mobile', value: label(appData.personal?.mobile), y: 21 },
      { label: 'Email', value: label(appData.personal?.email), y: 27 }
    ];

    infoFields.forEach(field => {
      doc.setFont('helvetica', 'bold');
      doc.text(field.label + ':', infoX, infoY + field.y);
      doc.setFont('helvetica', 'normal');
      const valueText = doc.splitTextToSize(field.value, 100);
      doc.text(valueText, infoX + 18, infoY + field.y);
    });

    // Signature
    const sigX = pageW - margin - 35;
    if (signatureBase64) {
      try {
        doc.addImage(signatureBase64, 'PNG', sigX, y, 35, 15);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(sigX, y, 35, 15);
      } catch (e) {
        console.error('Failed to add signature:', e);
        doc.rect(sigX, y, 35, 15);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Signature', sigX + 17.5, y + 8, { align: 'center' });
      }
    } else {
      doc.rect(sigX, y, 35, 15);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Signature', sigX + 17.5, y + 8, { align: 'center' });
    }

    y += 35;

    // ═══════════════════════════════════
    // IDENTITY CHECK
    // ═══════════════════════════════════
    sectionTitle('IDENTITY CHECK');

    field('Full Name', appData.personal?.name);
    field('Aadhar Number', appData.personal?.aadhar);
    field('Date of Birth', formatDate(appData.personal?.dob));
    field('Gender', appData.personal?.gender);
    field('Religion/Community', appData.personal?.religion);
    field('Resident', appData.personal?.resident === 1 ? 'Yes' : 'No');

    y += 3;

    // ═══════════════════════════════════
    // PERSONAL DETAILS
    // ═══════════════════════════════════
    sectionTitle('PERSONAL DETAILS');

    field('Mobile Number', appData.personal?.mobile);
    field('Email Address', appData.personal?.email);
    field('PAN Card', appData.personal?.pan);
    field('Marital Status', appData.personal?.marital_status);
    field('Education Qualification', appData.personal?.education_qualification);
    field('Guardian/Parent Name', appData.personal?.guardian_name);
    field('Occupation', appData.personal?.occupation);
    field('Annual Income', pdfCurrency(appData.personal?.income));

    // Current Address - with proper text wrapping
    checkPage();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Current Address:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    const currentAddr = `${appData.personal?.current_address || ''}, ${appData.personal?.current_place || ''} - ${appData.personal?.current_pincode || ''}`;
    const currentAddrLines = doc.splitTextToSize(currentAddr, contentWidth - 52);
    doc.text(currentAddrLines, margin + 50, y);
    doc.setDrawColor(180, 180, 180);
    doc.setLineDash([1, 1], 0);
    doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
    doc.setLineDash([], 0);
    y += lineH + (currentAddrLines.length > 1 ? (currentAddrLines.length - 1) * 4 : 0);

    // Permanent Address - with proper text wrapping
    checkPage();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Permanent Address:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    const permAddr = `${appData.personal?.permanent_address || ''}, ${appData.personal?.permanent_place || ''} - ${appData.personal?.permanent_pincode || ''}`;
    const permAddrLines = doc.splitTextToSize(permAddr, contentWidth - 52);
    doc.text(permAddrLines, margin + 50, y);
    doc.setDrawColor(180, 180, 180);
    doc.setLineDash([1, 1], 0);
    doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
    doc.setLineDash([], 0);
    y += lineH + (permAddrLines.length > 1 ? (permAddrLines.length - 1) * 4 : 0);

    y += 3;

    // ═══════════════════════════════════
    // ACADEMIC INFORMATION
    // ═══════════════════════════════════
    if (appData.education) {
      sectionTitle('ACADEMIC INFORMATION');

      field('Student Name', appData.education.student_name);
      field('Course Name', appData.education.course_name);
      field('Course Type', appData.education.course_type);
      field('Course Duration', `${appData.education.course_duration || ''} Years`);
      field('Mode of Study', appData.education.mode_of_study);
      field('Purpose of Loan', appData.education.purpose_of_loan);

      // Institution Name with proper wrapping
      checkPage();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Institution Name:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      const instLines = doc.splitTextToSize(String(appData.education.institution_name || 'N/A'), contentWidth - 52);
      doc.text(instLines, margin + 50, y);
      doc.setDrawColor(180, 180, 180);
      doc.setLineDash([1, 1], 0);
      doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
      doc.setLineDash([], 0);
      y += lineH + (instLines.length > 1 ? (instLines.length - 1) * 4 : 0);

      field('University Name', appData.education.university);
      field('Admission Status', appData.education.admission_status);
      field('Admission Year', appData.education.admission_year);
      field('Total Course Fee', pdfCurrency(appData.education.total_course_fee));
      field('Fee Paid', pdfCurrency(appData.education.fee_paid));
      field('Remaining Fee', pdfCurrency(appData.education.remaining_fee));
      field('Loan Required Amount', pdfCurrency(appData.education.loan_required_amount));

      y += 2;
      subSectionHeader('BANK DETAILS');
      field('Bank Name', appData.education.bank_name);
      field('Branch Name', appData.education.branch_name);
      field('IFSC Code', appData.education.ifsc_code);
      field('Account Number', appData.education.account_number);

      y += 3;
    }

    // ═══════════════════════════════════
    // GUARANTOR DETAILS
    // ═══════════════════════════════════
    if (appData.guarantor) {
      sectionTitle('GUARANTOR DETAILS');

      field('Full Name', appData.guarantor.name);
      field('Mobile Number', appData.guarantor.mobile);
      field('Aadhar Number', appData.guarantor.aadhar);

      // Guarantor Current Address
      checkPage();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Current Address:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      const gCurrentAddr = `${appData.guarantor?.current_address || ''}, ${appData.guarantor?.current_place || ''} - ${appData.guarantor?.current_pincode || ''}`;
      const gCurrentLines = doc.splitTextToSize(gCurrentAddr, contentWidth - 52);
      doc.text(gCurrentLines, margin + 50, y);
      doc.setDrawColor(180, 180, 180);
      doc.setLineDash([1, 1], 0);
      doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
      doc.setLineDash([], 0);
      y += lineH + (gCurrentLines.length > 1 ? (gCurrentLines.length - 1) * 4 : 0);

      // Guarantor Permanent Address
      checkPage();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Permanent Address:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      const gPermAddr = `${appData.guarantor?.permanent_address || ''}, ${appData.guarantor?.permanent_place || ''} - ${appData.guarantor?.permanent_pincode || ''}`;
      const gPermLines = doc.splitTextToSize(gPermAddr, contentWidth - 52);
      doc.text(gPermLines, margin + 50, y);
      doc.setDrawColor(180, 180, 180);
      doc.setLineDash([1, 1], 0);
      doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
      doc.setLineDash([], 0);
      y += lineH + (gPermLines.length > 1 ? (gPermLines.length - 1) * 4 : 0);

      y += 3;
    }

    // ═══════════════════════════════════
    // COLLATERAL DETAILS
    // ═══════════════════════════════════
    if (appData.collateral && (appData.collateral.properties?.length || appData.collateral.fds?.length || appData.collateral.lics?.length || appData.collateral.govtEmployees?.length)) {
      sectionTitle('COLLATERAL DETAILS');

      if (appData.collateral.properties?.length > 0) {
        appData.collateral.properties.forEach((p, i) => {
          subSectionHeader(`Property ${i + 1}`);
          field('Survey Number', p.survey_no);
          field('District', p.district_id);
          field('Village/Place', p.place);
          field('Area', `${p.area_value || ''} ${p.units || ''}`);
          field('Property Valuation', pdfCurrency(p.property_value));
          y += 1;
        });
      }

      if (appData.collateral.fds?.length > 0) {
        appData.collateral.fds.forEach((fd, i) => {
          subSectionHeader(`Fixed Deposit ${i + 1}`);
          field('Bank Name', fd.bank_name);
          field('Branch Name', fd.branch_name);
          field('FD Amount', pdfCurrency(fd.amount));
          field('Maturity Date', formatDate(fd.fd_maturity_date));
          y += 1;
        });
      }

      if (appData.collateral.lics?.length > 0) {
        appData.collateral.lics.forEach((l, i) => {
          subSectionHeader(`LIC Policy ${i + 1}`);
          field('Policy Name', l.policy_name);
          field('Policy Type', l.policy_type);
          field('Surrender Value', pdfCurrency(l.policy_surrender_value));
          field('Receipt Number', l.policy_receipt_no);
          y += 1;
        });
      }

      if (appData.collateral.govtEmployees?.length > 0) {
        appData.collateral.govtEmployees.forEach((g, i) => {
          subSectionHeader(`Govt. Employee ${i + 1}`);
          field('Department/Office', g.department_office_name);
          field('Designation', g.designation);
          field('Employee ID', g.employee_id_number);
          y += 1;
        });
      }

      y += 2;
    }

    // ═══════════════════════════════════
    // UPLOADED DOCUMENTS
    // ═══════════════════════════════════
    if (appData.allDocs?.length > 0) {
      sectionTitle('UPLOADED DOCUMENTS');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);

      appData.allDocs.forEach((doc2, idx) => {
        checkPage();
        doc.text(`${idx + 1}. ${doc2.document_name}`, margin + 2, y);
        y += lineH - 1;
      });
    }

    // ═══════════════════════════════════
    // FOOTER ON EACH PAGE
    // ═══════════════════════════════════
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(`Page ${i} of ${totalPages}`, pageW / 2, pageH - 10, { align: 'center' });
      doc.text(`${applicantName}  |  Application #${appId}`, pageW / 2, pageH - 6, { align: 'center' });

      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, pageH - 13, pageW - margin, pageH - 13);
    }

    doc.save(fileName);
  }
</script>

<svelte:head>
  <title>{isReviewMode ? 'Review & Submit' : 'View Application'} - Education Loan</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">

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
    on:goToDashboard={() => { goto(`/${locale}/dashboard`); }}
  />

  <div class="w-full px-4 sm:px-6 lg:px-10 py-6 {isReviewMode ? 'pb-36' : 'pb-10'}">

    <!-- ── Page Header ── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 class="text-xl font-bold text-gray-800">
          {isReviewMode ? 'Review & Submit Application' : t.dashboard.viewApplication}
        </h2>
        <p class="text-sm text-gray-500 mt-0.5">
          {t.dashboard.applicationId}: <span class="font-semibold text-purple-700">#{$applicationId}</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        {#if !isReviewMode}
          <button on:click={() => handleDownloadPDF()}
            disabled={!appData || isLoading}
            class="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold shadow transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            {t.applicationStart.downloadPdf}
          </button>
        {/if}
        <button on:click={() => goto(`/${locale}/dashboard`)}
          class="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          {t.applicationStart.backToDashboard}
        </button>
      </div>
    </div>

    {#if isLoading}
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center">
        <svg class="animate-spin h-9 w-9 text-purple-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p class="text-gray-500">Loading your application...</p>
      </div>

    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700">{error}</div>

    {:else if appData}

    <!-- ═══════════════════════════════════════════════════════
         MAIN APPLICATION FORM SHEET
         ═══════════════════════════════════════════════════════ -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      <!-- ── Application Header Banner ── -->
      <div class="bg-gradient-to-r from-purple-700 to-purple-900 px-6 sm:px-8 py-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-white text-lg font-bold tracking-wide">{t.step4.companyName}</h3>
            <p class="text-purple-200 text-sm mt-0.5">{t.dashboard.applicationId} :<span class="font-bold text-white">#{$applicationId}</span></p>
          </div>
          {#if isReviewMode}
            <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400 text-amber-900 rounded-full text-xs font-bold self-start sm:self-auto">
              <span class="w-2 h-2 rounded-full bg-amber-700 animate-pulse"></span>
              Pending Submission
            </span>
          {:else}
            <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-green-400 text-green-900 rounded-full text-xs font-bold self-start sm:self-auto">
              <span class="w-2 h-2 rounded-full bg-green-700 animate-pulse"></span>
              {t.dashboard.applicationSubmittedLabel} — {t.dashboard.UnderReview}
            </span>
          {/if}
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════
           PERSONAL INFORMATION CARD (Photo, Info, Signature)
           ══════════════════════════════════════════════════════ -->
      <div class="border-b-4 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <div class="px-6 sm:px-8 py-2 bg-purple-700">
          <h4 class="text-white font-bold text-xs uppercase tracking-widest">{t.tabs.personal}</h4>
        </div>

        <div class="px-6 sm:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">
          <!-- Photo -->
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            {#if appData.documents?.photo}
              <img src={appData.documents.photo} alt="Applicant Photo"
                class="w-32 h-36 object-cover border-4 border-purple-300 rounded-lg shadow-lg" />
            {:else}
              <div class="w-32 h-36 border-4 border-dashed border-purple-300 rounded-lg bg-purple-50 flex flex-col items-center justify-center gap-2">
                <svg class="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="text-xs text-purple-400 font-medium">No Photo</span>
              </div>
            {/if}
            <span class="text-xs text-purple-700 font-bold uppercase tracking-wide">{t.dashboard.applicantPhoto}</span>
          </div>

          <!-- Core Information -->
          <div class="flex-1 bg-white rounded-lg border-2 border-purple-200 p-5 shadow-sm">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t.applicationStart.nameLabel}</span>
                <span class="text-base font-bold text-gray-900 border-b-2 border-dotted border-gray-300 pb-1">{label(appData.personal?.name)}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t.applicationStart.dobLabel}</span>
                <span class="text-base font-bold text-gray-900 border-b-2 border-dotted border-gray-300 pb-1">{formatDate(appData.personal?.dob)}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t.applicationStart.aadharLabel}</span>
                <span class="text-base font-bold text-gray-900 border-b-2 border-dotted border-gray-300 pb-1">{label(appData.personal?.aadhar)}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t.personalDetails.mobileLabel}</span>
                <span class="text-base font-bold text-gray-900 border-b-2 border-dotted border-gray-300 pb-1">{label(appData.personal?.mobile)}</span>
              </div>
              <div class="flex flex-col gap-1 sm:col-span-2">
                <span class="text-xs font-semibold text-purple-700 uppercase tracking-wide">{t.personalDetails.emailLabel}</span>
                <span class="text-base font-bold text-gray-900 border-b-2 border-dotted border-gray-300 pb-1 break-all">{label(appData.personal?.email)}</span>
              </div>
            </div>
          </div>

          <!-- Signature -->
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            {#if appData.documents?.signature}
              <div class="bg-white rounded-lg border-4 border-purple-300 shadow-lg p-2">
                <img src={appData.documents.signature} alt="Signature"
                  class="h-24 w-44 object-contain" />
              </div>
            {:else}
              <div class="h-24 w-44 border-4 border-dashed border-purple-300 rounded-lg bg-purple-50 flex items-center justify-center">
                <span class="text-xs text-purple-400 font-medium">No Signature</span>
              </div>
            {/if}
            <span class="text-xs text-purple-700 font-bold uppercase tracking-wide">{t.uploadDocuments.ApplicantDocument.signature}</span>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════
           SECTION: IDENTITY CHECK
           ════════════════════════════ -->
      <div class="border-b border-gray-200">
        <div class="bg-purple-700 px-6 sm:px-8 py-2">
          <h4 class="text-white font-bold text-xs uppercase tracking-widest">{t.stepper.step1}</h4>
        </div>
        <div class="px-6 sm:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-0">
          {#each [
            { lbl: t.applicationStart.nameLabel,        val: label(appData.personal?.name) },
            { lbl: t.applicationStart.aadharLabel,      val: label(appData.personal?.aadhar) },
            { lbl: t.applicationStart.dobLabel,         val: formatDate(appData.personal?.dob) },
            { lbl: t.applicationStart.genderLabel,      val: label(appData.personal?.gender) },
            { lbl: t.applicationStart.religionCommunity, val: label(appData.personal?.religion) },
            { lbl: t.applicationStart.resident,         val: appData.personal?.resident === 1 ? 'Yes' : 'No' },
          ] as f}
            <div class="flex items-baseline gap-2 py-2 border-b border-dotted border-gray-200">
              <span class="text-xs text-gray-500 w-40 flex-shrink-0">{f.lbl}</span>
              <span class="text-sm font-semibold text-gray-900">{f.val}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- ════════════════════════════
           SECTION: PERSONAL DETAILS
           ════════════════════════════ -->
      <div class="border-b border-gray-200">
        <div class="bg-purple-700 px-6 sm:px-8 py-2">
          <h4 class="text-white font-bold text-xs uppercase tracking-widest">{t.stepper.step2}</h4>
        </div>
        <div class="px-6 sm:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-0">
          {#each [
            { lbl: t.personalDetails.mobileLabel,        val: label(appData.personal?.mobile) },
            { lbl: t.personalDetails.emailLabel,         val: label(appData.personal?.email) },
            { lbl: t.personalDetails.panLabel,           val: label(appData.personal?.pan) },
            { lbl: t.personalDetails.maritalStatusLabel, val: label(appData.personal?.marital_status) },
            { lbl: t.personalDetails.educationLabel,     val: label(appData.personal?.education_qualification) },
            { lbl: t.personalDetails.parentNameLabel,    val: label(appData.personal?.guardian_name) },
            { lbl: t.personalDetails.occupationLabel,    val: label(appData.personal?.occupation) },
            { lbl: t.personalDetails.annualIncomeLabel,  val: formatCurrency(appData.personal?.income) },
          ] as f}
            <div class="flex items-baseline gap-2 py-2 border-b border-dotted border-gray-200">
              <span class="text-xs text-gray-500 w-40 flex-shrink-0">{f.lbl}</span>
              <span class="text-sm font-semibold text-gray-900">{f.val}</span>
            </div>
          {/each}
        </div>
        <!-- Addresses -->
        <div class="px-6 sm:px-8 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="py-2">
            <span class="text-xs text-gray-500 block mb-1 font-semibold">{t.personalDetails.currentStreetLabel}</span>
            <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
              {label(appData.personal?.current_address)}, {label(appData.personal?.current_place)} — {label(appData.personal?.current_pincode)}
            </span>
          </div>
          <div class="py-2">
            <span class="text-xs text-gray-500 block mb-1 font-semibold">{t.personalDetails.permanentStreetLabel}</span>
            <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
              {label(appData.personal?.permanent_address)}, {label(appData.personal?.permanent_place)} — {label(appData.personal?.permanent_pincode)}
            </span>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════
           SECTION: ACADEMIC INFO
           ════════════════════════════ -->
      {#if appData.education}
        <div class="border-b border-gray-200">
          <div class="bg-purple-700 px-6 sm:px-8 py-2">
            <h4 class="text-white font-bold text-xs uppercase tracking-widest">{t.stepper.step3}</h4>
          </div>
          <div class="px-6 sm:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-0">
            {#each [
              { lbl: t.academicInfo.studentNameLabel,    val: label(appData.education.student_name) },
              { lbl: t.academicInfo.courseNameLabel,     val: label(appData.education.course_name) },
              { lbl: t.academicInfo.courseTypeLabel,     val: label(appData.education.course_type) },
              { lbl: t.academicInfo.courseDurationLabel, val: `${label(appData.education.course_duration)} Years` },
              { lbl: t.academicInfo.modeOfStudyLabel,    val: label(appData.education.mode_of_study) },
              { lbl: t.academicInfo.purposeOfLoanLabel,  val: label(appData.education.purpose_of_loan) },
              { lbl: t.academicInfo.universityNameLabel, val: label(appData.education.university) },
              { lbl: t.academicInfo.admissionStatusLabel,val: label(appData.education.admission_status) },
              { lbl: t.academicInfo.admissionYearLabel,  val: label(appData.education.admission_year) },
            ] as f}
              <div class="flex items-baseline gap-2 py-2 border-b border-dotted border-gray-200">
                <span class="text-xs text-gray-500 w-40 flex-shrink-0">{f.lbl}</span>
                <span class="text-sm font-semibold text-gray-900">{f.val}</span>
              </div>
            {/each}
          </div>

          <!-- Institution Name - Full Width -->
          <div class="px-6 sm:px-8 pb-2">
            <div class="py-2">
              <span class="text-xs text-gray-500 block mb-1 font-semibold">{t.academicInfo.instituteNameLabel}</span>
              <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
                {label(appData.education.institution_name)}
              </span>
            </div>
          </div>

          <!-- Fee Row -->
          <div class="px-6 sm:px-8 pb-1 grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-0">
            {#each [
              { lbl: t.academicInfo.totalCourseFeeLabel,  val: formatCurrency(appData.education.total_course_fee),      color: 'text-gray-900' },
              { lbl: t.academicInfo.feePaidLabel,         val: formatCurrency(appData.education.fee_paid),              color: 'text-blue-700' },
              { lbl: t.academicInfo.remainingFeeLabel,    val: formatCurrency(appData.education.remaining_fee),         color: 'text-red-600' },
              { lbl: t.academicInfo.loanRequiredLabel,    val: formatCurrency(appData.education.loan_required_amount),  color: 'text-purple-700' },
            ] as f}
              <div class="flex flex-col py-2 border-b border-dotted border-gray-200">
                <span class="text-xs text-gray-500">{f.lbl}</span>
                <span class="text-sm font-bold {f.color} mt-0.5">{f.val}</span>
              </div>
            {/each}
          </div>

          <!-- Bank Details Sub-section -->
          <div class="mx-6 sm:mx-8 my-3 rounded-lg border border-gray-200 overflow-hidden">
            <div class="bg-gray-100 px-4 py-1.5">
              <span class="text-xs font-bold text-gray-600 uppercase tracking-wide">{t.academicInfo.section5Title}</span>
            </div>
            <div class="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-0">
              {#each [
                { lbl: t.academicInfo.bankNameLabel,      val: label(appData.education.bank_name) },
                { lbl: t.academicInfo.branchNameLabel,    val: label(appData.education.branch_name) },
                { lbl: t.academicInfo.ifscCodeLabel,      val: label(appData.education.ifsc_code) },
                { lbl: t.academicInfo.accountNumberLabel, val: label(appData.education.account_number) },
              ] as f}
                <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                  <span class="text-xs text-gray-500">{f.lbl}</span>
                  <span class="text-sm font-semibold text-gray-900 mt-0.5">{f.val}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="pb-2"></div>
        </div>
      {/if}

      <!-- ════════════════════════════
           SECTION: GUARANTOR DETAILS
           ════════════════════════════ -->
      {#if appData.guarantor}
        <div class="border-b border-gray-200">
          <div class="bg-purple-700 px-6 sm:px-8 py-2">
            <h4 class="text-white font-bold text-xs uppercase tracking-widest">{t.stepper.step4}</h4>
          </div>
          <div class="px-6 sm:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-0">
            {#each [
              { lbl: t.guarantorDetails.guarantorFullNameLabel, val: label(appData.guarantor.name) },
              { lbl: t.guarantorDetails.guarantorMobileLabel,   val: label(appData.guarantor.mobile) },
              { lbl: t.guarantorDetails.guarantorAadharLabel,   val: label(appData.guarantor.aadhar) },
            ] as f}
              <div class="flex items-baseline gap-2 py-2 border-b border-dotted border-gray-200">
                <span class="text-xs text-gray-500 w-40 flex-shrink-0">{f.lbl}</span>
                <span class="text-sm font-semibold text-gray-900">{f.val}</span>
              </div>
            {/each}
          </div>
          <div class="px-6 sm:px-8 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="py-2">
              <span class="text-xs text-gray-500 block mb-1 font-semibold">{t.guarantorDetails.currentStreetAddressLabel}</span>
              <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
                {label(appData.guarantor?.current_address)}, {label(appData.guarantor?.current_place)} — {label(appData.guarantor?.current_pincode)}
              </span>
            </div>
            <div class="py-2">
              <span class="text-xs text-gray-500 block mb-1 font-semibold">{t.guarantorDetails.permanentStreetAddressLabel}</span>
              <span class="text-sm font-semibold text-gray-900 block border-b border-dotted border-gray-200 pb-2">
                {label(appData.guarantor?.permanent_address)}, {label(appData.guarantor?.permanent_place)} — {label(appData.guarantor?.permanent_pincode)}
              </span>
            </div>
          </div>
        </div>
      {/if}

      <!-- ════════════════════════════
           SECTION: COLLATERAL DETAILS
           ════════════════════════════ -->
      {#if appData.collateral && (appData.collateral.properties?.length || appData.collateral.fds?.length || appData.collateral.lics?.length || appData.collateral.govtEmployees?.length)}
        <div class="border-b border-gray-200">
          <div class="bg-purple-700 px-6 sm:px-8 py-2">
            <h4 class="text-white font-bold text-xs uppercase tracking-widest">{t.stepper.step5}</h4>
          </div>
          <div class="px-6 sm:px-8 py-4 space-y-4">

            {#if appData.collateral.properties?.length > 0}
              {#each appData.collateral.properties as prop, i}
                <div>
                  <p class="text-xs font-bold text-purple-700 uppercase mb-1">{t.collateralDetails.property} {i + 1}</p>
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-0">
                    {#each [
                      { lbl: 'Survey No',  val: label(prop.survey_no) },
                      { lbl: 'District',   val: label(prop.district_id) },
                      { lbl: 'Village',    val: label(prop.place) },
                      { lbl: 'Units',      val: label(prop.units) },
                      { lbl: 'Area',       val: label(prop.area_value) },
                      { lbl: 'Valuation',  val: formatCurrency(prop.property_value) },
                    ] as f}
                      <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                        <span class="text-xs text-gray-500">{f.lbl}</span>
                        <span class="text-sm font-semibold text-gray-900 mt-0.5">{f.val}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            {/if}

            {#if appData.collateral.fds?.length > 0}
              {#each appData.collateral.fds as fd, i}
                <div>
                  <p class="text-xs font-bold text-blue-700 uppercase mb-1">{t.CollateralDocuments.fdCollateral} {i + 1}</p>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-0">
                    {#each [
                      { lbl: 'Bank Name',     val: label(fd.bank_name) },
                      { lbl: 'Branch',        val: label(fd.branch_name) },
                      { lbl: 'FD Amount',     val: formatCurrency(fd.amount) },
                      { lbl: 'Maturity Date', val: formatDate(fd.fd_maturity_date) },
                    ] as f}
                      <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                        <span class="text-xs text-gray-500">{f.lbl}</span>
                        <span class="text-sm font-semibold text-gray-900 mt-0.5">{f.val}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            {/if}

            {#if appData.collateral.lics?.length > 0}
              {#each appData.collateral.lics as lic, i}
                <div>
                  <p class="text-xs font-bold text-green-700 uppercase mb-1">{t.CollateralDocuments.licCollateral} {i + 1}</p>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-0">
                    {#each [
                      { lbl: t.collateralDetails.policyName,          val: label(lic.policy_name) },
                      { lbl: t.collateralDetails.policyType,          val: label(lic.policy_type) },
                      { lbl: t.collateralDetails.policySurrenderValue, val: formatCurrency(lic.policy_surrender_value) },
                      { lbl: t.collateralDetails.policyReceiptNo,     val: label(lic.policy_receipt_no) },
                    ] as f}
                      <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                        <span class="text-xs text-gray-500">{f.lbl}</span>
                        <span class="text-sm font-semibold text-gray-900 mt-0.5">{f.val}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            {/if}

            {#if appData.collateral.govtEmployees?.length > 0}
              {#each appData.collateral.govtEmployees as govt, i}
                <div>
                  <p class="text-xs font-bold text-amber-700 uppercase mb-1">{t.collateralDetails.govtEmployeeGaurantor} {i + 1}</p>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-0">
                    {#each [
                      { lbl: t.collateralDetails.govtEmployeeModal.departmentName, val: label(govt.department_office_name) },
                      { lbl: t.collateralDetails.govtEmployeeModal.designation,    val: label(govt.designation) },
                      { lbl: t.collateralDetails.govtEmployeeModal.employeeID,     val: label(govt.employee_id_number) },
                    ] as f}
                      <div class="flex flex-col py-1.5 border-b border-dotted border-gray-200">
                        <span class="text-xs text-gray-500">{f.lbl}</span>
                        <span class="text-sm font-semibold text-gray-900 mt-0.5">{f.val}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            {/if}

          </div>
        </div>
      {/if}

      <!-- ════════════════════════════
           SECTION: UPLOADED DOCUMENTS
           ════════════════════════════ -->
      {#if appData.allDocs?.length > 0}
        {@const sectionNameMap = {
          1:'APPLICANT DOCUMENTS',2:'APPLICANT DOCUMENTS',3:'APPLICANT DOCUMENTS',
          4:'APPLICANT DOCUMENTS',5:'APPLICANT DOCUMENTS',6:'CO-APPLICANT DOCUMENTS',
          7:'COLLATERAL — Property',8:'COLLATERAL — Govt Employee',
          9:'COLLATERAL — LIC Policy',10:'COLLATERAL — Fixed Deposit',
          11:'STUDY ABROAD DOCUMENTS',12:'GUARANTOR DOCUMENTS',
        }}
        {@const sectionOrderMap={1:1,2:1,3:1,4:1,5:1,6:2,12:3,7:4,8:5,9:6,10:7,11:8}}
        {@const groupedSections=(()=>{
          const sections={};
          (appData.allDocs||[]).forEach(doc=>{
            const sid=doc.section_id;
            const sname=sectionNameMap[sid]||doc.section_name||'Other Documents';
            if(!sections[sname])sections[sname]={section_name:sname,order:sectionOrderMap[sid]||99,docs:[]};
            sections[sname].docs.push(doc);
          });
          return Object.values(sections).sort((a,b)=>a.order-b.order);
        })()}

        <div class="border-b border-gray-200">
          <div class="bg-purple-700 px-6 sm:px-8 py-2 flex items-center justify-between">
            <h4 class="text-white font-bold text-xs uppercase tracking-widest">{t.stepper.step6}</h4>
            <span class="text-purple-200 text-xs font-medium">{appData.allDocs.length} files</span>
          </div>
          <div class="px-6 sm:px-8 py-4 space-y-5">
            {#each groupedSections as section}
              <div>
                <div class="flex items-center gap-2 mb-2 pb-1 border-b-2 border-purple-200">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="text-xs font-bold text-purple-700 uppercase tracking-wide">{section.section_name}</p>
                  <span class="ml-auto text-xs text-gray-500">({section.docs.length})</span>
                </div>
                <div class="space-y-2">
                  {#each section.docs as doc}
                    <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors group">
                      <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-800 truncate">{doc.document_name}</span>
                      </div>
                      <a href={doc.file_name} target="_blank" rel="noopener noreferrer"
                        class="flex-shrink-0 ml-3 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 group-hover:shadow-md">
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
          </div>
        </div>
      {/if}

      <!-- ════════════════════════════
           REVIEW MODE: I AGREE + SUBMIT
           ════════════════════════════ -->
      {#if isReviewMode}
        <div class="px-6 sm:px-8 py-6 bg-gradient-to-br from-purple-50 to-white border-t-2 border-purple-200">
          <!-- I Agree Checkbox -->
          <label class="flex items-start gap-3 cursor-pointer group mb-5 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-colors">
            <div class="relative mt-0.5 flex-shrink-0">
              <input type="checkbox" bind:checked={agreeChecked} class="sr-only peer" />
              <div class="w-6 h-6 rounded-md border-2 {agreeChecked ? 'border-purple-600 bg-purple-600' : 'border-gray-400 bg-white'} transition-all flex items-center justify-center shadow-sm">
                {#if agreeChecked}
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                {/if}
              </div>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900 mb-1">{t.declaration}</p>
              <p class="text-sm text-gray-700 leading-relaxed">
                {t.iHereBy} <span class="font-semibold text-purple-700">{t.trueCorrectComplete}</span> {t.toMyBest} <span class="font-semibold text-red-600">{t.rejection}</span>.
              </p>
            </div>
          </label>

          {#if submitError}
            <div class="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-300 rounded-lg text-sm text-red-700">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {submitError}
            </div>
          {/if}

          <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              on:click={() => goto(`/${locale}/application/upload-documents`)}
              class="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 text-sm transition-all w-full sm:w-auto justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Documents
            </button>

            <button
              on:click={handleSubmitApplication}
              disabled={!agreeChecked || isSubmitting}
              class="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg hover:shadow-xl disabled:shadow-none transition-all text-sm w-full sm:w-auto justify-center">
              {#if isSubmitting}
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Submitting...
              {:else}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Submit Application
              {/if}
            </button>
          </div>
        </div>
      {/if}

    </div><!-- end main sheet -->

    {/if}
  </div>
</div>
