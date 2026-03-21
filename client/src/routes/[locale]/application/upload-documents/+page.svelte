<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import ApplicantDocumentsSection from '$lib/components/upload-documents/ApplicantDocumentsSection.svelte';
  import CoApplicantDocumentsSection from '$lib/components/upload-documents/CoApplicantDocumentsSection.svelte';
  import GuarantorDocumentsSection from '$lib/components/upload-documents/GuarantorDocumentsSection.svelte';
  import CollateralDocumentsSection from '$lib/components/upload-documents/CollateralDocumentsSection.svelte';
  import StudyAbroadDocumentsSection from '$lib/components/upload-documents/StudyAbroadDocumentsSection.svelte';
  import SubmissionSuccessModal from '$lib/components/upload-documents/SubmissionSuccessModal.svelte';
  import ApplicantInfoSummary from '$lib/components/upload-documents/ApplicantInfoSummary.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import { getEducationDetailsData,submitApplication } from '$lib/api/authApi';

  import { get } from 'svelte/store';
  import { user, logout as logoutStore, applicationId, token } from '$lib/stores/userStore';

//   import { 
//   getGuarantorDetailsData,
//   getCollateralProperties, 
//   getFDCollaterals, 
//   getLICCollaterals, 
//   getGovtCollaterals
// } from '$lib/api/authApi';

import { 
  getGuarantorDetailsData,
  getCollateralProperties, 
  getFDCollaterals, 
  getLICCollaterals, 
  getGovtCollaterals,
  uploadDocument,
  getUploadedDocuments,
  deleteDocument
} from '$lib/api/authApi';

  import documentUploadValidation, { 
    validateDocumentFile, 
    validateAllRequiredDocuments,
  } from '$lib/validation/application/uploaddocuments';




  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let currentStep = 6;
  let isSubmitting = false;
  let uploadedDocs = {};

  // For Validation
  let uploadErrors = {}; 
  let submitError = ''; 
  let missingDocuments = [];

  let purposeOfLoan = '';
  let loanAmount = '';
  let showSuccessModal = false;
    


  let showProfileModal = false;

  $: userData = $user ? {
  name: $user.name || "",
  phone: $user.mobile || "",
  username: $user.username || "",
  id: $user.id || null
} : null;
  
  // Get data from session storage
  let collateralItems = [];
  let guarantorData = null;

  //feach master call 
  let uploadDocsMetadata = [];

  const docIdToMasterIdMap = {
  // upload_for: 1 - Personal Identity
  'aadharCard': 1,
  'panCard': 2,
  'photo': 3,
  'signature': 4,
  // upload_for: 2 - Educational
  'admissionLetter': 5,
  'bonafide': 6,
  'feeStructure': 7,
  'markSheets': 8,
  //'entranceExam': 9,
  // upload_for: 3 - Residence
  'domicile': 10,
  'minorityCert': 11,
  'casteCert': 12,
  // upload_for: 4 - Family Income
  'incomeCert': 13,
  'parentAadhar': 14,
  'rationCard': 15,
  // upload_for: 5 - Bank
  'passbook': 16,
  'cancelledCheque': 16,
  // upload_for: 6 - Co-Applicant
  'coAadhar': 17,
  'coIncomeCert': 18,
  'coRationCard': 19,
  // upload_for: 7 - Property Collateral
  'propertyOwnership': 20,
  'extract712': 21,
  'prCard': 22,
  'valuationCert': 23,
  'form24A': 24,
  // upload_for: 8 - Govt Employee
  'govtIdCard': 25,
  'salaryCert': 26,
  'officeCert': 27,
  'retirementProof': 28,
  'form24B': 29,
  // upload_for: 9 - LIC
  'licPhotoWithSign': 30,
  'photoWithSign': 30,
  'licPolicyOriginal': 31,
  'premiumReceipts': 32,
  'policyBond': 33,
  'policyStatus': 34,
  // upload_for: 10 - FD
  'fdPhotoWithSign': 35,
  'aadharCardXerox': 36,
  'fdReceipt': 36,
  'bankConfirmation': 37,
  'fdStatement': 38,
  // Study Abroad
  'passport_abroad': 39,
  'visa_abroad': 40,
  // upload_for: 12 - Guarantor
  'guarantor_aadharCard': 41,
  'guarantor_guarantorAffidavit': 42,
  'guarantor_incomeCertificate': 43,
  'guarantor_addressProof': 44,

   'propertyAadharCard': 45,
  // FD collateral stripped keys (id: 46)
  'fdAadharCardXerox': 46,
  // LIC stripped keys (id: 47)
  'licAadharCard': 47,
  // Govt employee stripped keys (id: 48)
  'govtAadharCard': 48,
};

onMount(async () => {
 const currentToken = get(token);

  if (!$user || !currentToken) {
    goto(`/${locale}/login`);
    return;
  }

  if (!$applicationId) {
    goto(`/${locale}/dashboard`);
    return;
  }

  // Check if guarantor exists
 const { getUserApplication } = await import('$lib/api/authApi');
  // const appCheck = await getUserApplication($user.id);
  // if (appCheck.error === 0 && appCheck.status === 'submitted') {
  //   goto(`/${locale}/dashboard`);
  //   return;
  // }

  const appCheck = await getUserApplication($user.id);
  if (appCheck.error === 0 && ['submitted','under-review','approved','rejected','sanctioned','disbursed'].includes(appCheck.status)) {
    goto(`/${locale}/application/view-application`);
    return;
  }
  
  // Build reverse map: masterId -> all docId keys
   const guarantorResult = await getGuarantorDetailsData($applicationId);
  if (guarantorResult.error === 0 && guarantorResult.data && guarantorResult.data.guarantorFullName) {
    guarantorData = guarantorResult.data;
  }

  const masterIdToAllDocIdsMap = {};
  Object.entries(docIdToMasterIdMap).forEach(([docKey, masterId]) => {
    const key = String(masterId);
    if (!masterIdToAllDocIdsMap[key]) masterIdToAllDocIdsMap[key] = [];
    masterIdToAllDocIdsMap[key].push(docKey);
  });

  // Fetch existing uploaded documents
  const existingDocs = await getUploadedDocuments($user.id, $applicationId);
  if (existingDocs.error === 0 && existingDocs.documents) {
    existingDocs.documents.forEach(doc => {
      const docData = {
        uploaded: true,
        url: doc.file_name,
        fileName: doc.org_filename || doc.document_name,
        fileSize: doc.document_size,
        uploadedAt: doc.upload_date
      };
      uploadedDocs[String(doc.document_id)] = docData;
      const allDocIds = masterIdToAllDocIdsMap[String(doc.document_id)] || [];
      allDocIds.forEach(docKey => {
        uploadedDocs[docKey] = docData;
      });
    });
    uploadedDocs = { ...uploadedDocs };
  }

  // Load collaterals
  collateralItems = [];

  const propertyData = await getCollateralProperties($user.id, $applicationId);
  if (propertyData.error === 0 && propertyData.properties?.length > 0) {
    collateralItems = [...collateralItems, ...propertyData.properties];
  }

  const fdData = await getFDCollaterals($user.id, $applicationId);
  if (fdData.error === 0 && fdData.fdCollaterals?.length > 0) {
    collateralItems = [...collateralItems, ...fdData.fdCollaterals];
  }

  const licData = await getLICCollaterals($user.id, $applicationId);
  if (licData.error === 0 && licData.licCollaterals?.length > 0) {
    collateralItems = [...collateralItems, ...licData.licCollaterals];
  }

  const govtData = await getGovtCollaterals($user.id, $applicationId);
  if (govtData.error === 0 && govtData.govtCollaterals?.length > 0) {
    collateralItems = [...collateralItems, ...govtData.govtCollaterals];
  }

  // Re-map existing docs to collateral prefixed keys
 const collateralTypeDocIdMap = {
    'property':      { 45: 'aadharCard', 20: 'propertyOwnership', 21: 'extract712', 22: 'prCard', 23: 'valuationCert', 24: 'form24A' },
    'fd':            { 46: 'aadharCardXerox', 35: 'photoWithSign', 36: 'fdReceipt', 37: 'bankConfirmation', 38: 'fdStatement' },
    'lic':           { 47: 'aadharCard', 30: 'photoWithSign', 31: 'licPolicyOriginal', 32: 'premiumReceipts', 33: 'policyBond', 34: 'policyStatus' },
    'govt-employee': { 48: 'aadharCard', 25: 'govtIdCard', 26: 'salaryCert', 27: 'officeCert', 28: 'retirementProof', 29: 'form24B' },
  };

  // Re-map existing docs to collateral prefixed keys
   if (existingDocs.error === 0 && existingDocs.documents) {
    collateralItems.forEach((item, index) => {
      const collateralType = item.type;
      const typeMap = collateralTypeDocIdMap[collateralType] || {};

      existingDocs.documents.forEach(doc => {
        const docData = uploadedDocs[String(doc.document_id)];
        if (!docData) return;

        const docIdKey = typeMap[doc.document_id] || typeMap[String(doc.document_id)];

        if (docIdKey) {
          const prefixedKey = `collateral_${collateralType}_${index}_${docIdKey}`;
          uploadedDocs[prefixedKey] = docData;
        }
      });
    });
    uploadedDocs = { ...uploadedDocs };
  }

  // Fetch education details
   const educationData = await getEducationDetailsData($applicationId);
  if (educationData.error === 0 && educationData.data) {
    purposeOfLoan = educationData.data.purposeOfLoan || educationData.data.purpose_of_loan || '';
    loanAmount = educationData.data.loanAmount || 
                 educationData.data.loan_amount || 
                 educationData.data.loan_required_amount || 
                 educationData.data.loanRequiredAmount || '';
  }

});



async function handleUpload(docId, file) {
  delete uploadErrors[docId];
  uploadErrors = { ...uploadErrors };

  const validation = validateDocumentFile(file, docId);
  if (!validation.valid) {
    uploadErrors[docId] = validation.error;
    uploadErrors = { ...uploadErrors };
    return;
  }

  // Resolve documentId based on full docId first, then stripped
  let documentId = docIdToMasterIdMap[docId];

  if (!documentId) {
    // Extract collateral type and base key
    const collateralMatch = docId.match(/^collateral_(property|fd|lic|govt-employee)_\d+_(.+)$/);
    if (collateralMatch) {
      const collateralType = collateralMatch[1];
      const baseKey = collateralMatch[2]; // e.g. 'aadharCard', 'photoWithSign'
      // Map by type-specific key
      const typeKeyMap = {
        'property': { 'aadharCard': 45, 'propertyOwnership': 20, 'extract712': 21, 'prCard': 22, 'valuationCert': 23, 'form24A': 24 },
        'fd':       { 'aadharCard': 46, 'aadharCardXerox': 46, 'photoWithSign': 35, 'fdReceipt': 36, 'bankConfirmation': 37, 'fdStatement': 38 },
        'lic':      { 'aadharCard': 47, 'photoWithSign': 30, 'licPolicyOriginal': 31, 'premiumReceipts': 32, 'policyBond': 33, 'policyStatus': 34 },
        'govt-employee': { 'aadharCard': 48, 'govtIdCard': 25, 'salaryCert': 26, 'officeCert': 27, 'retirementProof': 28, 'form24B': 29 },
      };
      documentId = typeKeyMap[collateralType]?.[baseKey];
    } else if (docId.startsWith('guarantor_')) {
      const baseKey = docId.replace('guarantor_', '');
      const guarantorKeyMap = { 'aadharCard': 41, 'guarantorAffidavit': 42, 'incomeCertificate': 43, 'addressProof': 44 };
      documentId = guarantorKeyMap[baseKey];
    } else {
      documentId = docIdToMasterIdMap[docId];
    }
  }

  if (!documentId) {
    uploadErrors[docId] = 'Document mapping not found';
    uploadErrors = { ...uploadErrors };
    return;
  }

  const result = await uploadDocument($user.id, $applicationId, docId, documentId, file);

  if (result.error !== 0) {
    uploadErrors[docId] = result.errorMsg || 'Upload failed';
    uploadErrors = { ...uploadErrors };
    return;
  }

  const docData = {
    uploaded: true,
    url: result.filePath,
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toISOString()
  };
  uploadedDocs[String(documentId)] = docData;
  uploadedDocs[docId] = docData;  // also store by original docId for component lookup
  uploadedDocs = { ...uploadedDocs };

}

function resolveDocumentId(docId) {
  if (docIdToMasterIdMap[docId]) return String(docIdToMasterIdMap[docId]);

  const collateralMatch = docId.match(/^collateral_(property|fd|lic|govt-employee)_\d+_(.+)$/);
  if (collateralMatch) {
    const collateralType = collateralMatch[1];
    const baseKey = collateralMatch[2];
    const typeKeyMap = {
      'property':      { 'aadharCard': 45, 'propertyOwnership': 20, 'extract712': 21, 'prCard': 22, 'valuationCert': 23, 'form24A': 24 },
      'fd':            { 'aadharCard': 46, 'aadharCardXerox': 46, 'photoWithSign': 35, 'fdReceipt': 36, 'bankConfirmation': 37, 'fdStatement': 38 },
      'lic':           { 'aadharCard': 47, 'photoWithSign': 30, 'licPolicyOriginal': 31, 'premiumReceipts': 32, 'policyBond': 33, 'policyStatus': 34 },
      'govt-employee': { 'aadharCard': 48, 'govtIdCard': 25, 'salaryCert': 26, 'officeCert': 27, 'retirementProof': 28, 'form24B': 29 },
    };
    return String(typeKeyMap[collateralType]?.[baseKey] || '');
  }

  if (docId.startsWith('guarantor_')) {
    const baseKey = docId.replace('guarantor_', '');
    const guarantorKeyMap = { 'aadharCard': 41, 'guarantorAffidavit': 42, 'incomeCertificate': 43, 'addressProof': 44 };
    return String(guarantorKeyMap[baseKey] || '');
  }

  return docId;
}

function handleView(docId) {
  const documentId = resolveDocumentId(docId);
  const doc = uploadedDocs[docId] || uploadedDocs[documentId];
  if (doc?.url) {
    window.open(doc.url, '_blank');
  }
}


async function handleDelete(docId) {
  const confirmMessage = t.uploadDocuments?.validationMessages?.deleteConfirm || 
    'Are you sure you want to delete this document?';
  
  const documentId = resolveDocumentId(docId);

  if (confirm(confirmMessage)) {
    const result = await deleteDocument($user.id, $applicationId, documentId);
    if (result.error !== 0) {
      submitError = result.errorMsg || 'Delete failed';
      return;
    }
    delete uploadedDocs[documentId];
    delete uploadedDocs[docId];  // also clear original docId key
    uploadedDocs = { ...uploadedDocs };
  }
}

  function handleBack() {
    goto(`/${locale}/dashboard`);
  }

  function handleCancel() {
    goto(`/${locale}/application/Collateral-details`);
  }

async function handleSubmit() {
  // Clear previous errors
  submitError = '';
  missingDocuments = [];
  
  const validation = validateAllRequiredDocuments(uploadedDocs, collateralItems, purposeOfLoan);
  
  if (!validation.valid) {
    const missingMsg = t.uploadDocuments?.validationMessages?.missingDocuments || 'missing document(s)';
    const pleaseUploadMsg = t.uploadDocuments?.validationMessages?.allDocumentsRequired || 'Please upload all required documents!';
    
    submitError = `${pleaseUploadMsg} ${validation.totalMissing} ${missingMsg}.`;
    missingDocuments = validation.missing;
    
    setTimeout(() => {
      const errorElement = document.getElementById('submit-error');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    return;
  }
 
    goto(`/${locale}/application/view-application?mode=review`);
    
 
}
// function handleGoToDashboard() {
//   applicationId.set(null);
//   goto(`/${locale}/dashboard`);
// }

function handleGoToDashboard() {

   const today = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', month: 'short', year: 'numeric' 
  });
  // Save submission info to sessionStorage before navigating
  sessionStorage.setItem('submissionSuccess', JSON.stringify({
    applicantName: userData?.name || '',
    applicationId: $applicationId,
    purposeOfLoan: purposeOfLoan,
    loanAmount: loanAmount,
    submittedDate: today
  }));
  //applicationId.set(null);
  goto(`/${locale}/dashboard`);
}

</script>

<svelte:head>
  <title>Upload Documents - Education Loan Application</title>
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
      on:logout={() => {
      logoutStore();
      goto(`/${locale}/login`);
    }}
  />

  <ApplicationStepper {currentStep} {locale} />

  <div class="w-full px-2 sm:px-4 md:px-6 lg:px-8 pb-12 overflow-x-hidden">
    <div class="max-w-[1400px] mx-auto">
      
      <!-- Page Title -->
     <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {t.uploadDocuments?.pageTitle}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {t.uploadDocuments?.pageSubtitle}
          </p>
        </div>

        <button
          on:click={handleBack}
          class="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex-shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="hidden sm:inline">{t.applicationStart?.backToHome || 'Back to Home'}</span>
        </button>
      </div>

      <!-- Applicant Info Header -->
      <!-- <ApplicantInfoSummary {userData} /> -->

      <!-- Applicant Documents -->
      <ApplicantDocumentsSection
        onUpload={handleUpload}
        onView={handleView}
        onDelete={handleDelete}
        {uploadedDocs}
        uploadErrors={uploadErrors}
      />


    {#if String(purposeOfLoan) === '7'}
      <StudyAbroadDocumentsSection
        onUpload={handleUpload}
        onView={handleView}
        onDelete={handleDelete}
        {uploadedDocs}
        uploadErrors={uploadErrors}
      />
    {/if}

      <!-- Co-Applicant Documents -->
      <CoApplicantDocumentsSection
        onUpload={handleUpload}
        onView={handleView}
        onDelete={handleDelete}
        {uploadedDocs}
        uploadErrors={uploadErrors}
      />

      <!-- Guarantor Documents -->
      <GuarantorDocumentsSection
        {guarantorData}
        onUpload={handleUpload}
        onView={handleView}
        onDelete={handleDelete}
        {uploadedDocs}
        uploadErrors={uploadErrors}
      />

      <!-- Collateral Documents -->
      <CollateralDocumentsSection
        {collateralItems}
        onUpload={handleUpload}
        onView={handleView}
        onDelete={handleDelete}
        {uploadedDocs}
        uploadErrors={uploadErrors}
      />

      <!-- Error Display -->
      {#if submitError}
        <div id="submit-error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="flex-1">
              <h4 class="text-sm font-bold text-red-800 mb-2">{submitError}</h4>
              
           {#if missingDocuments.length > 0}
              <div class="text-xs text-red-700">
                <p class="font-semibold mb-1">Missing Required Documents:</p>
                <ul class="list-disc list-inside space-y-1">
                  {#each missingDocuments as missing}
                    <li>{missing.section}{missing.displayName ? ` (${missing.displayName})` : ''} - {missing.docId}</li>
                  {/each}
                </ul>
              </div>
            {/if}
            </div>
            
            <button
              on:click={() => {
                submitError = '';
                missingDocuments = [];
              }}
              class="text-red-600 hover:text-red-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-3 mt-8">
        <button
          on:click={handleCancel}
          class="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          <span>{t.uploadDocuments?.backButton}</span>
        </button>

        <button
          on:click={handleSubmit}
          disabled={isSubmitting}
          class="inline-flex items-center justify-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-md text-sm"
        >
          {#if isSubmitting}
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t.uploadDocuments?.processingButton}</span>
          {:else}
            <span>{t.uploadDocuments?.submitButton}</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          {/if}
        </button>
      </div>

    </div>
  </div>
</div>

<!-- Success Modal Component -->
<!-- <SubmissionSuccessModal 
  bind:show={showSuccessModal}
  applicationId={$applicationId}
  on:goToDashboard={handleGoToDashboard}
/> -->


<SubmissionSuccessModal 
  bind:show={showSuccessModal}
  applicationId={$applicationId}
  applicantName={userData?.name || ''}
  purposeOfLoan={purposeOfLoan}
  loanAmount={loanAmount}
  on:goToDashboard={handleGoToDashboard}
/>

