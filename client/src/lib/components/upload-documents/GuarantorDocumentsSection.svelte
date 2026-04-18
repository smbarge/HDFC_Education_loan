<script>
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import DocumentUploadRow from './DocumentUploadRow.svelte';
  
  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  export let guarantorData = null; 
  export let onUpload = () => {};
  export let onView = () => {};
  export let onDelete = () => {};
  export let uploadedDocs = {};
  export let uploadErrors = {};
    export let rejectedDocsMap = {};  // ← ADD

  const docIdToMasterIdMap = {
     'guarantor_aadharCard': 41,
    'guarantor_guarantorAffidavit': 42,
    'guarantor_incomeCertificate': 43,
    'guarantor_addressProof': 44,
  };

  // ← ADD
  function getDocIssues(docId) {
    const masterId = String(docIdToMasterIdMap[docId] || '');
    if (!masterId) return [];
    const flagged = rejectedDocsMap[masterId];
    if (!flagged?.failingQuestions?.length) return [];
    return flagged.failingQuestions.filter(q => q.instructionEng);
  }


  const guarantorDocuments = [
    { id: 'aadharCard', key: 'aadharCard', required: true },
    { id: 'guarantorAffidavit', key: 'guarantorAffidavit', required: true },
    { id: 'incomeCertificate', key: 'incomeCertificate', required: false },
    { id: 'addressProof', key: 'addressProof', required: true }
  ];
</script>

{#if guarantorData}
  <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
    <!-- Header -->
    <div class="bg-purple-500 text-white px-6 py-3">
      <h3 class="text-lg font-bold">{t.uploadDocuments?.GuarantorDocument?.sectionTitle}</h3>
      <p class="text-sm opacity-90 mt-1">{t.uploadDocuments?.GuarantorDocument?.guarantorInformation}</p>
      <p class="text-xs opacity-75 mt-1">
        {t.uploadDocuments?.GuarantorDocument?.name}: {guarantorData.guarantorFullName} | 
        {t.uploadDocuments?.GuarantorDocument?.mobile}: {guarantorData.guarantorMobile}
      </p>
    </div>

    <!-- Table Header -->
    <div class="grid grid-cols-12 gap-4 bg-gray-100 px-6 py-3 border-b border-gray-200">
      <div class="col-span-12 md:col-span-6">
        <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.GuarantorDocument?.documentsName}</p>
      </div>
      <div class="col-span-12 md:col-span-4 text-center">
        <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.GuarantorDocument?.uploadView}</p>
      </div>
      <div class="col-span-12 md:col-span-2 text-center">
        <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.GuarantorDocument?.delete}</p>
      </div>
    </div>

    <!-- Documents -->
    <div class="px-6 py-2">
      {#each guarantorDocuments as doc}
        <div>
          <DocumentUploadRow
            documentName={t.uploadDocuments?.GuarantorDocument?.[doc.key]}
            required={doc.required}
            uploaded={uploadedDocs[`guarantor_${doc.id}`]?.uploaded || false}
            fileUrl={uploadedDocs[`guarantor_${doc.id}`]?.url || ''}
            onUpload={(file) => onUpload(`guarantor_${doc.id}`, file)}
            onView={() => onView(`guarantor_${doc.id}`)}
            onDelete={() => onDelete(`guarantor_${doc.id}`)}
            error={uploadErrors[doc.id] || ''}
            docId={doc.id}
          />
           {#if getDocIssues(`guarantor_${doc.id}`).length > 0}
          {#each getDocIssues(`guarantor_${doc.id}`) as q}
            <div class="mb-2 ml-2 mr-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-2 flex items-start gap-2">
              <svg class="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <p class="text-xs text-red-700"><strong>Issue:</strong> {q.instructionEng}</p>
            </div>
          {/each}
        {/if}
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-8 text-center">
    <p class="text-gray-500">{t.uploadDocuments?.GuarantorDocument?.noGuarantorFound}</p>
  </div>
{/if}