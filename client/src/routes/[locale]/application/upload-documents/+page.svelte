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
  import ApplicantInfoSummary from '$lib/components/upload-documents/ApplicantInfoSummary.svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  
  import documentUploadValidation, { 
    validateDocumentFile, 
    validateAllRequiredDocuments 
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
    
  let userData = {
    name: '',
    phone: '',
    username: ''
  };

  let showProfileModal = false;
  
  // Get data from session storage
  let collateralItems = [];
  let guarantorData = null;

  onMount(() => {
    if (typeof window !== 'undefined') {
      const authUser = sessionStorage.getItem('authUser');

      if (!authUser) {
        goto(`/${locale}/login`);
      } else {
        const user = JSON.parse(authUser);
        userData = {
          name: user.name || "Guest User",
          phone: user.mobile || "",
          username: user.username || ""
        };
      }

      // Retrieve collateral items from session storage
      const savedCollaterals = sessionStorage.getItem('collateralItems');
      if (savedCollaterals) {
        try {
          collateralItems = JSON.parse(savedCollaterals);
          console.log('Loaded collateral items:', collateralItems);
        } catch (error) {
          console.error('Error parsing collateral items:', error);
          collateralItems = [];
        }
      }

      // Retrieve guarantor data from session storage
      const savedGuarantor = sessionStorage.getItem('guarantorData');
      if (savedGuarantor) {
        try {
          guarantorData = JSON.parse(savedGuarantor);
          console.log('Loaded guarantor data:', guarantorData);
        } catch (error) {
          console.error('Error parsing guarantor data:', error);
          guarantorData = null;
        }
      }
    }
  });

  function handleUpload(docId, file) {
    console.log('Uploading document:', docId, file);
    
    // Clear previous error for this document
    delete uploadErrors[docId];
    uploadErrors = { ...uploadErrors };
    
    // Validate file based on document type (includes size and type validation)
    const validation = validateDocumentFile(file, docId);
    if (!validation.valid) {
      uploadErrors[docId] = validation.error;
      uploadErrors = { ...uploadErrors };
      return;
    }
    
    uploadedDocs[docId] = {
      uploaded: true,
      url: URL.createObjectURL(file),
      file: file,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    };
    uploadedDocs = { ...uploadedDocs };
    
    // Save to session storage
    sessionStorage.setItem('uploadedDocs', JSON.stringify(
      Object.entries(uploadedDocs).reduce((acc, [key, value]) => {
        acc[key] = {
          uploaded: value.uploaded,
          fileName: value.fileName,
          fileSize: value.fileSize,
          uploadedAt: value.uploadedAt
        };
        return acc;
      }, {})
    ));
  }

  function handleView(docId) {
    if (uploadedDocs[docId]?.url) {
      window.open(uploadedDocs[docId].url, '_blank');
    }
  }

  function handleDelete(docId) {
    const confirmMessage = t.uploadDocuments?.validationMessages?.deleteConfirm || 
      'Are you sure you want to delete this document? / तुम्हाला खात्री आहे की तुम्ही हे दस्तऐवज हटवू इच्छिता?';
    
    if (confirm(confirmMessage)) {
      if (uploadedDocs[docId]?.url) {
        URL.revokeObjectURL(uploadedDocs[docId].url);
      }
      delete uploadedDocs[docId];
      uploadedDocs = { ...uploadedDocs };
      
      // Update session storage
      sessionStorage.setItem('uploadedDocs', JSON.stringify(
        Object.entries(uploadedDocs).reduce((acc, [key, value]) => {
          acc[key] = {
            uploaded: value.uploaded,
            fileName: value.fileName,
            fileSize: value.fileSize,
            uploadedAt: value.uploadedAt
          };
          return acc;
        }, {})
      ));
    }
  }

  function handleBack() {
    goto(`/${locale}/dashboard`);
  }

  async function handleSubmit() {
    // Clear previous errors
    submitError = '';
    missingDocuments = [];
    
    // OPTION 1: Use the simple validation function (Current approach - RECOMMENDED)
    const validation = validateAllRequiredDocuments(uploadedDocs, collateralItems);
    
    if (!validation.valid) {
      const missingMsg = t.uploadDocuments?.validationMessages?.missingDocuments || 'missing document(s)';
      const pleaseUploadMsg = t.uploadDocuments?.validationMessages?.allDocumentsRequired || 'Please upload all required documents!';
      
      submitError = `${pleaseUploadMsg} ${validation.totalMissing} ${missingMsg}.`;
      missingDocuments = validation.missing;
      
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.getElementById('submit-error');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return;
    }

    /* 
    // OPTION 2: Use Vest validation suite (Advanced - OPTIONAL)
    const vestResult = documentUploadValidation(
      { uploadedDocs }, 
      t, 
      collateralItems
    );
    
    if (vestResult.hasErrors()) {
      const errors = vestResult.getErrors();
      console.log('Vest validation errors:', errors);
      
      // Process errors
      Object.keys(errors).forEach(docId => {
        uploadErrors[docId] = errors[docId][0]; // Get first error message
      });
      uploadErrors = { ...uploadErrors };
      
      submitError = `${t.uploadDocuments?.validationMessages?.allDocumentsRequired} ${Object.keys(errors).length} ${t.uploadDocuments?.validationMessages?.missingDocuments}.`;
      return;
    }
    */
    
    isSubmitting = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      goto(`/${locale}/dashboard`);
    } catch (error) {
      console.error('Error:', error);
      submitError = 'Failed to submit documents. Please try again. / दस्तऐवज सबमिट करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.';
    } finally {
      isSubmitting = false;
    }
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
      sessionStorage.removeItem('authUser');
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
          on:click={handleBack}
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