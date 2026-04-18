<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import ApplicantDocumentsSection from '$lib/components/upload-documents/ApplicantDocumentsSection.svelte';
  import CoApplicantDocumentsSection from '$lib/components/upload-documents/CoApplicantDocumentsSection.svelte';
  import GuarantorDocumentsSection from '$lib/components/upload-documents/GuarantorDocumentsSection.svelte';
  import CollateralDocumentsSection from '$lib/components/upload-documents/CollateralDocumentsSection.svelte';
  import StudyAbroadDocumentsSection from '$lib/components/upload-documents/StudyAbroadDocumentsSection.svelte';

  import {
    getRejectedDocuments, reSubmitApplication, reUploadDocument,
    deleteReuploadDocument, getCollateralProperties, getFDCollaterals, getLICCollaterals,
    getGovtCollaterals, getGuarantorDetailsData, getEducationDetailsData, getUploadedDocuments,getLatestUploadedDocuments,
  } from '$lib/api/authApi';
  import { user, logout as logoutStore, applicationId, token } from '$lib/stores/userStore';
  import { get } from 'svelte/store';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];
  $: userData = $user ? { name: $user.name || '', phone: $user.mobile || '', username: $user.username || '', id: $user.id || null } : null;

  // State 
  let isLoading = true;
  let isResubmitting = false;
  let showProfileModal = false;
  let errorMsg = '';
  let successMsg = '';

  // Key: upload_docs.document_id
  let rejectedDocsMap = {};
  let totalFlagged = 0;
  let uploadedFlaggedIds = new Set();

  let uploadedDocs = {};
  let uploadErrors = {};
  let collateralItems = [];
  let guarantorData = null;
  let purposeOfLoan = '';

  // Section issue lists
  let applicantIssues = [];
  let studyAbroadIssues = [];
  let coApplicantIssues = [];
  let guarantorIssues = [];
  let collateralIssues = [];

  // docKey -> upload_docs.document_id 
  const docIdMap = {
    'aadharCard': 1, 'panCard': 2, 'photo': 3, 'signature': 4,
    'admissionLetter': 5, 'bonafide': 6, 'feeStructure': 7, 'markSheets': 8,
    'domicile': 10, 'minorityCert': 11, 'casteCert': 12,
    'incomeCert': 13, 'parentAadhar': 14, 'rationCard': 15,
    'passbook': 16, 'cancelledCheque': 16,
    'coAadhar': 17, 'coIncomeCert': 18, 'coRationCard': 19,
    'propertyOwnership': 20, 'extract712': 21, 'prCard': 22, 'valuationCert': 23, 'form24A': 24, 'propertyAadharCard': 45,
    'govtIdCard': 25, 'salaryCert': 26, 'officeCert': 27, 'retirementProof': 28, 'form24B': 29, 'govtAadharCard': 48,
    'licPhotoWithSign': 30, 'licPolicyOriginal': 31, 'premiumReceipts': 32, 'policyBond': 33, 'policyStatus': 34, 'licAadharCard': 47,
    'fdPhotoWithSign': 35, 'fdReceipt': 36, 'bankConfirmation': 37, 'fdStatement': 38, 'fdAadharCardXerox': 46,
    'passport_abroad': 39, 'visa_abroad': 40,
    'guarantor_aadharCard': 41, 'guarantor_guarantorAffidavit': 42, 'guarantor_incomeCertificate': 43, 'guarantor_addressProof': 44,
  };

  // Collateral type -> docKey -> document_id
 const collateralDocIdMap = {
  'property':      { 'aadharCard': 45, 'propertyOwnership': 20, 'extract712': 21, 'prCard': 22, 'valuationCert': 23, 'form24A': 24 },
  'fd':            { 'aadharCardXerox': 46, 'photoWithSign': 35, 'fdReceipt': 36, 'bankConfirmation': 37, 'fdStatement': 38 },
  'lic':           { 'aadharCard': 47, 'photoWithSign': 30, 'licPolicyOriginal': 31, 'premiumReceipts': 32, 'policyBond': 33, 'policyStatus': 34 },
  'govt-employee': { 'aadharCard': 48, 'govtIdCard': 25, 'salaryCert': 26, 'officeCert': 27, 'retirementProof': 28, 'form24B': 29 },
}

  //  Resolve any docKey/collateral key -> document_id string 
  function getDocumentId(docId) {
    if (docIdMap[docId]) return String(docIdMap[docId]);

    const m = docId.match(/^collateral_(property|fd|lic|govt-employee)_\d+_(.+)$/);
    if (m) return String(collateralDocIdMap[m[1]]?.[m[2]] || '');

    if (docId.startsWith('guarantor_')) {
      const map = { 'aadharCard': 41, 'guarantorAffidavit': 42, 'incomeCertificate': 43, 'addressProof': 44 };
      return String(map[docId.replace('guarantor_', '')] || '');
    }
    return docId;
  }

  //  Progress 
  $: uploadedCount = uploadedFlaggedIds.size;
  $: allUploaded = totalFlagged > 0 && uploadedCount >= totalFlagged;

  //  Section docId lists 
  const applicantDocIds = [
    'aadharCard','panCard','photo','signature',
    'admissionLetter','bonafide','feeStructure','markSheets',
    'domicile','minorityCert','casteCert',
    'incomeCert','parentAadhar','rationCard','passbook'
  ];
  const studyAbroadDocIds = ['passport_abroad','visa_abroad'];
  const coApplicantDocIds = ['coAadhar','coIncomeCert','coRationCard'];
  const guarantorDocIds = ['guarantor_aadharCard','guarantor_guarantorAffidavit','guarantor_incomeCertificate','guarantor_addressProof'];

  function getCollateralDocIds(items) {
    const ids = [];
    items.forEach((item, i) => {
      Object.keys(collateralDocIdMap[item.type] || {}).forEach(key => {
        const docKey = `collateral_${item.type}_${i}_${key}`;
        const docId = getDocumentId(docKey);
        if (rejectedDocsMap[docId]) ids.push(docKey);
      });
    });
    return ids;
  }

  // Get issues for a section (docIds array) 
  function getIssues(docIds) {
    const seen = new Set();
    const issues = [];
    docIds.forEach(docId => {
      const documentId = getDocumentId(docId);
      const flagged = rejectedDocsMap[documentId];
      if (flagged && !seen.has(documentId)) {
        seen.add(documentId);
        const instruction = flagged.failingQuestions?.find(q => q.instructionEng)?.instructionEng
          || 'Please re-upload this document';
        issues.push({ text: instruction, docName: flagged.checkpointName });
      }
    });
    return issues;
  }

  function computeIssues() {
    applicantIssues   = getIssues(applicantDocIds);
    studyAbroadIssues = getIssues(studyAbroadDocIds);
    coApplicantIssues = getIssues(coApplicantDocIds);
    guarantorIssues   = getIssues(guarantorDocIds);
    collateralIssues  = getIssues(getCollateralDocIds(collateralItems));
  }

  // Load data 
  onMount(async () => {
    if (!$user || !get(token)) { goto(`/${locale}/login`); return; }
    if (!$applicationId)       { goto(`/${locale}/dashboard`); return; }
    await loadRejectedDocs();
    await loadExistingData();
    isLoading = false;
  });

  // async function loadRejectedDocs() {
  //   const result = await getRejectedDocuments($user.id, $applicationId);
  //   if (result.error !== 0) { errorMsg = 'Failed to load flagged documents.'; return; }

  //   const knownIds = new Set(Object.values(docIdMap).map(String));
  //   (result.data.rejectedDocuments || []).forEach(doc => {
  //     // Backend now sends documentId (upload_docs.id), not checkpointId
  //     const id = String(doc.documentId);
  //     if (knownIds.has(id) && doc.failingQuestions?.length > 0) {
  //       rejectedDocsMap[id] = doc;
  //     }
  //   });
  //   rejectedDocsMap = { ...rejectedDocsMap };
  //   totalFlagged = Object.keys(rejectedDocsMap).length;
  // }

 async function loadRejectedDocs() {
    const result = await getRejectedDocuments($user.id, $applicationId);
    if (result.error !== 0) { errorMsg = 'Failed to load flagged documents.'; return; }

    (result.data.rejectedDocuments || []).forEach(doc => {
      const id = String(doc.documentId);
      rejectedDocsMap[id] = doc;
    });
    rejectedDocsMap = { ...rejectedDocsMap };
    totalFlagged = Object.keys(rejectedDocsMap).length; 
  }

  async function loadExistingData() {
    const idToKeys = {};
    Object.entries(docIdMap).forEach(([key, id]) => {
      const k = String(id);
      if (!idToKeys[k]) idToKeys[k] = [];
      idToKeys[k].push(key);
    });

    // Load uploaded docs
    const existing = await getUploadedDocuments($user.id, $applicationId);
    if (existing.error === 0) {
      existing.documents.forEach(doc => {
        const docIdStr = String(doc.document_id);

        // ── SKIP flagged docs entirely
        if (rejectedDocsMap[docIdStr]) return;

        const data = { 
          uploaded: true, 
          url: doc.file_name, 
          fileName: doc.org_filename || doc.document_name, 
          fileSize: doc.document_size 
        };
        uploadedDocs[docIdStr] = data;
        (idToKeys[docIdStr] || []).forEach(k => uploadedDocs[k] = data);
      });
      uploadedDocs = { ...uploadedDocs };
    }

    const reUploaded = await getLatestUploadedDocuments($user.id, $applicationId);
    if (reUploaded.error === 0) {
      reUploaded.documents.forEach(doc => {
        const docIdStr = String(doc.document_id);

        if (rejectedDocsMap[docIdStr]) return;

        const data = {
          uploaded: true,
          url: doc.file_name,
          fileName: doc.org_filename || doc.document_name,
          fileSize: doc.document_size
        };

        // Only load non-flagged re-uploaded docs -> show View button
        uploadedDocs[docIdStr] = data;
        (idToKeys[docIdStr] || []).forEach(k => uploadedDocs[k] = data);
      });
      uploadedDocs = { ...uploadedDocs };
    }
    // Load collaterals 
    const [prop, fd, lic, govt] = await Promise.all([
      getCollateralProperties($user.id, $applicationId),
      getFDCollaterals($user.id, $applicationId),
      getLICCollaterals($user.id, $applicationId),
      getGovtCollaterals($user.id, $applicationId)
    ]);
    collateralItems = [
      ...(prop.properties || []),
      ...(fd.fdCollaterals || []),
      ...(lic.licCollaterals || []),
      ...(govt.govtCollaterals || [])
    ];

    // Map both normal + re-uploaded docs to collateral prefixed keys
    const allDocs = [
      ...(existing.error === 0 ? existing.documents : []),
      ...(reUploaded.error === 0 ? reUploaded.documents : [])
    ];

    collateralItems.forEach((item, index) => {
      const typeMap = collateralDocIdMap[item.type] || {};
      allDocs.forEach(doc => {
        const docIdStr = String(doc.document_id);
        const docData = uploadedDocs[docIdStr];
        if (!docData) return;
        const key = Object.entries(typeMap).find(([, id]) => id === doc.document_id)?.[0];
        if (key) uploadedDocs[`collateral_${item.type}_${index}_${key}`] = docData;
      });
    });
    uploadedDocs = { ...uploadedDocs };

    // Recalculate totalFlagged after re-uploads are accounted for
    totalFlagged = Object.keys(rejectedDocsMap).length;

    // Load guarantor + education 
    const gr = await getGuarantorDetailsData($applicationId);
    if (gr.error === 0 && gr.data?.guarantorFullName) guarantorData = gr.data;

    const ed = await getEducationDetailsData($applicationId);
    if (ed.error === 0) purposeOfLoan = ed.data?.purposeOfLoan || ed.data?.purpose_of_loan || '';

    computeIssues();
  }

   // Upload
   async function handleUpload(docId, file) {
    delete uploadErrors[docId];
    uploadErrors = { ...uploadErrors };

    const documentId = getDocumentId(docId);
    if (!documentId) { uploadErrors[docId] = 'Document mapping not found'; uploadErrors = { ...uploadErrors }; return; }

    // Always use reUploadDocument on resubmit page
    const result = await reUploadDocument($user.id, $applicationId, docId, documentId, file);

    if (result.error !== 0) { uploadErrors[docId] = result.errorMsg || 'Upload failed'; uploadErrors = { ...uploadErrors }; return; }

    const data = { uploaded: true, url: result.filePath, fileName: file.name, fileSize: file.size };
    uploadedDocs[documentId] = data;
    uploadedDocs[docId] = data;
    uploadedDocs = { ...uploadedDocs };

    const isFlagged = !!rejectedDocsMap[documentId];
    if (isFlagged) {
      uploadedFlaggedIds = new Set([...uploadedFlaggedIds, documentId]);
     }
    }

  // View
  function handleView(docId) {
    const doc = uploadedDocs[docId] || uploadedDocs[getDocumentId(docId)];
    if (doc?.url) window.open(doc.url, '_blank');
  }

 // Delete
    async function handleDelete(docId) {
      if (!confirm('Delete this document?')) return;

      const documentId = getDocumentId(docId);

      const result = await deleteReuploadDocument($user.id, $applicationId, documentId);

      if (result.error !== 0) {
        errorMsg = result.errorMsg || 'Delete failed';
        return;
      }

      // Clear from local state
      delete uploadedDocs[documentId];
      delete uploadedDocs[docId];
      uploadedDocs = { ...uploadedDocs };

      uploadedFlaggedIds.delete(documentId);
      uploadedFlaggedIds = new Set(uploadedFlaggedIds);
    }

  //  Re-submit 
  async function handleResubmit() {
    if (!allUploaded || isResubmitting) return;
    isResubmitting = true;
    errorMsg = '';
    const result = await reSubmitApplication($user.id, $applicationId);
    if (result.error === 0) {
      successMsg = 'Application re-submitted successfully!';
      setTimeout(() => goto(`/${locale}/dashboard`), 2000);
    } else {
      errorMsg = result.errorMsg || 'Re-submission failed.';
    }
    isResubmitting = false;
  }
</script>

<svelte:head>
  <title>Re-Upload Documents - Education Loan Application</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100">

  <DashboardHeader
    {t}
    {locale}
    {userData}
    on:openProfile={() => showProfileModal = true}
  />

  <ProfileModal
    {userData}
    {locale}
    bind:showProfileModal
    on:close={() => showProfileModal = false}
    on:logout={() => { logoutStore(); goto(`/${locale}/login`); }}
  />

  <ApplicationStepper currentStep={6} {locale} />

  <div class="w-full px-2 sm:px-4 md:px-6 lg:px-8 pb-12 overflow-x-hidden">
    <div class="max-w-[1400px] mx-auto">

      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Re-Upload Documents
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Please re-upload the flagged documents and re-submit your application.
          </p>
        </div>
        <button
          on:click={() => goto(`/${locale}/dashboard`)}
          class="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300
            rounded-lg hover:bg-gray-50 transition-colors text-sm flex-shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="hidden sm:inline">Back to Home</span>
        </button>
      </div>

      {#if isLoading}
        <div class="flex items-center justify-center py-32">
          <svg class="animate-spin h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>

      {:else if errorMsg && Object.keys(rejectedDocsMap).length === 0}
        <div class="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">
          {errorMsg}
        </div>

      <!-- {:else if Object.keys(rejectedDocsMap).length === 0}
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 text-sm text-yellow-700">
          No flagged documents found. Please contact support.
        </div> -->

      {:else}

        <!-- Progress bar -->
       <div class="mb-6 bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <div class="flex justify-between mb-2">
            <p class="text-sm font-semibold text-gray-700">Re-Upload Progress</p>
            <p class="text-sm text-gray-500">{uploadedCount} / {totalFlagged} re-uploaded</p>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full transition-all" style="width: {totalFlagged > 0 ? (uploadedCount/totalFlagged)*100 : 0}%"></div>
          </div>
        </div>

        <!--APPLICANT-->
        {#if applicantIssues.length > 0}
        <ApplicantDocumentsSection
            onUpload={handleUpload}
            onView={handleView}
            onDelete={handleDelete}
            {uploadedDocs}
            {uploadErrors}
            {rejectedDocsMap}
          />
          <!-- <div class="mb-2 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
            <p class="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              Issues Found — Applicant Documents:
            </p>
            <ul class="space-y-1.5">
              {#each applicantIssues as issue}
                <li class="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                  <svg class="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span><strong>{issue.docName}:</strong> {issue.text}</span>
                </li>
              {/each}
            </ul>
          </div> -->
          
        {/if}

        <!--STUDY ABROAD-->
        {#if String(purposeOfLoan) === '7' && studyAbroadIssues.length > 0}
          <!-- <div class="mb-2 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
            <p class="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              Issues Found — Study Abroad Documents:
            </p>
            <ul class="space-y-1.5">
              {#each studyAbroadIssues as issue}
                <li class="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                  <svg class="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span><strong>{issue.docName}:</strong> {issue.text}</span>
                </li>
              {/each}
            </ul>
          </div> -->
          <StudyAbroadDocumentsSection
            onUpload={handleUpload}
            onView={handleView}
            onDelete={handleDelete}
            {uploadedDocs}
            {uploadErrors}
          />
        {/if}

        <!-- CO-APPLICANT -->
        {#if coApplicantIssues.length > 0}
          <!-- <div class="mb-2 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
            <p class="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              Issues Found — Co-Applicant Documents:
            </p>
            <ul class="space-y-1.5">
              {#each coApplicantIssues as issue}
                <li class="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                  <svg class="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span><strong>{issue.docName}:</strong> {issue.text}</span>
                </li>
              {/each}
            </ul>
          </div> -->
          <CoApplicantDocumentsSection
          onUpload={handleUpload}
          onView={handleView}
          onDelete={handleDelete}
          {uploadedDocs}
          {uploadErrors}
          {rejectedDocsMap}
        />
        {/if}

        <!--  GUARANTOR  ══ -->
        {#if guarantorIssues.length > 0}
          <!-- <div class="mb-2 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
            <p class="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              Issues Found — Guarantor Documents:
            </p>
            <ul class="space-y-1.5">
              {#each guarantorIssues as issue}
                <li class="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                  <svg class="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span><strong>{issue.docName}:</strong> {issue.text}</span>
                </li>
              {/each}
            </ul>
          </div> -->
          <GuarantorDocumentsSection
          {guarantorData}
          onUpload={handleUpload}
          onView={handleView}
          onDelete={handleDelete}
          {uploadedDocs}
          {uploadErrors}
          {rejectedDocsMap}
        />
        {/if}

        <!-- COLLATERAL -->
        {#if collateralIssues.length > 0}
          <!-- <div class="mb-2 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
            <p class="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              Issues Found — Collateral Documents:
            </p>
            <ul class="space-y-1.5">
              {#each collateralIssues as issue}
                <li class="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                  <svg class="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span><strong>{issue.docName}:</strong> {issue.text}</span>
                </li>
              {/each}
            </ul>
          </div> -->
          <CollateralDocumentsSection
            {collateralItems}
            onUpload={handleUpload}
            onView={handleView}
            onDelete={handleDelete}
            {uploadedDocs}
            {uploadErrors}
            {rejectedDocsMap}
          />
        {/if}

        {#if errorMsg}
          <div id="submit-error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="flex-1">
                <p class="text-sm text-red-800">{errorMsg}</p>
              </div>
              <button on:click={() => errorMsg = ''} class="text-red-600 hover:text-red-800">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        {/if}

        {#if successMsg}
          <div class="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
            <p class="text-sm font-semibold text-green-800">{successMsg}</p>
          </div>
        {/if}

        <div class="flex flex-col sm:flex-row justify-center gap-3 mt-8">
          <button
            on:click={() => goto(`/${locale}/dashboard`)}
            class="inline-flex items-center justify-center gap-2 px-6 py-2.5 border
              border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50
              transition-colors text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
            </svg>
            Back to Dashboard
          </button>

       <button on:click={handleResubmit} disabled={!allUploaded || isResubmitting}
            class="px-8 py-3 font-bold rounded-lg text-sm {allUploaded && !isResubmitting ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'bg-gray-400 text-white cursor-not-allowed'}">
            {isResubmitting ? 'Submitting...' : 'Re-Submit Application'}
          </button>
        </div>

      {/if}

    </div>
  </div>
</div>