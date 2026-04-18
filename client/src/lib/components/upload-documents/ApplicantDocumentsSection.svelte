<script>
// @ts-nocheck
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import DocumentUploadRow from './DocumentUploadRow.svelte';
  
  export let onUpload = () => {};
  export let onView = () => {};
  export let onDelete = () => {};
  export let uploadedDocs = {};
  export let uploadErrors = {};
  export let rejectedDocsMap = {};

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  const docIdToMasterIdMap = {
    'aadharCard': 1, 'panCard': 2, 'photo': 3, 'signature': 4,
    'admissionLetter': 5, 'bonafide': 6, 'feeStructure': 7, 'markSheets': 8,
    'domicile': 10, 'minorityCert': 11, 'casteCert': 12,
    'incomeCert': 13, 'parentAadhar': 14, 'rationCard': 15,
    'passbook': 16, 'cancelledCheque': 16,
  };

  function getDocIssues(docId) {
    const masterId = String(docIdToMasterIdMap[docId] || '');
    if (!masterId) return [];                         
    const flagged = rejectedDocsMap[masterId];       
    if (!flagged?.failingQuestions?.length) return [];
    return flagged.failingQuestions.filter(q => q.instructionEng);
  }

  const documents = {
    personalIdentity: [
      { id: 'aadharCard', key: 'aadharCard', required: true },
      { id: 'panCard', key: 'panCard', required: false },
      { id: 'photo', key: 'photo', required: true },
      { id: 'signature', key: 'signature', required: true }
    ],
    educational: [
      { id: 'admissionLetter', key: 'admissionLetter', required: true },
      { id: 'bonafide', key: 'bonafide', required: true },
      { id: 'feeStructure', key: 'feeStructure', required: true },
      { id: 'markSheets', key: 'markSheets', required: true },
    ],
    residence: [
      { id: 'domicile', key: 'domicile', required: true },
      { id: 'minorityCert', key: 'minorityCert', required: true },
      { id: 'casteCert', key: 'casteCert', required: false }
    ],
    familyIncome: [
      { id: 'incomeCert', key: 'incomeCert', required: true },
      { id: 'parentAadhar', key: 'parentAadhar', required: false },
      { id: 'rationCard', key: 'rationCard', required: false }
    ],
    bank: [
      { id: 'passbook', key: 'passbook', required: true }
    ]
  };
</script>

<div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
  <div class="bg-purple-500 text-white px-6 py-3">
    <h3 class="text-lg font-bold">{t.uploadDocuments?.ApplicantDocument.title}</h3>
  </div>

  <div class="grid grid-cols-12 gap-4 bg-gray-100 px-6 py-3 border-b border-gray-200">
    <div class="col-span-12 md:col-span-6">
      <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.ApplicantDocument.documentName}</p>
    </div>
    <div class="col-span-12 md:col-span-4 text-center">
      <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.ApplicantDocument.uploadView}</p>
    </div>
    <div class="col-span-12 md:col-span-2 text-center">
      <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.ApplicantDocument.delete}</p>
    </div>
  </div>

  <div class="px-6">

    <!-- A. Personal and Identity Documents -->
    <div class="mt-4">
      <h4 class="text-sm font-bold text-purple-700 mb-2">{t.uploadDocuments?.ApplicantDocument.sectionA}</h4>
      {#each documents.personalIdentity as doc}
        <DocumentUploadRow
          documentName={t.uploadDocuments.ApplicantDocument[doc.key]}
          required={doc.required}
          uploaded={uploadedDocs[doc.id]?.uploaded || false}
          fileUrl={uploadedDocs[doc.id]?.url || ''}
          onUpload={(file) => onUpload(doc.id, file)}
          onView={() => onView(doc.id)}
          onDelete={() => onDelete(doc.id)}
          error={uploadErrors[doc.id] || ''}
          docId={doc.id}
        />
        {#if getDocIssues(doc.id).length > 0}
          {#each getDocIssues(doc.id) as q}
            <div class="mb-2 ml-2 mr-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-2 flex items-start gap-2">
              <svg class="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <p class="text-xs text-red-700"><strong>Issue:</strong> {q.instructionEng}</p>
            </div>
          {/each}
        {/if}
      {/each}
    </div>

    <!-- B. Educational Documents -->
    <div class="mt-6">
      <h4 class="text-sm font-bold text-purple-700 mb-2">{t.uploadDocuments?.ApplicantDocument.sectionB}</h4>
      {#each documents.educational as doc}
        <DocumentUploadRow
          documentName={t.uploadDocuments.ApplicantDocument[doc.key]}
          required={doc.required}
          uploaded={uploadedDocs[doc.id]?.uploaded || false}
          fileUrl={uploadedDocs[doc.id]?.url || ''}
          onUpload={(file) => onUpload(doc.id, file)}
          onView={() => onView(doc.id)}
          onDelete={() => onDelete(doc.id)}
          error={uploadErrors[doc.id] || ''}
          docId={doc.id}
        />
        {#if getDocIssues(doc.id).length > 0}
          {#each getDocIssues(doc.id) as q}
            <div class="mb-2 ml-2 mr-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-2 flex items-start gap-2">
              <svg class="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <p class="text-xs text-red-700"><strong>Issue:</strong> {q.instructionEng}</p>
            </div>
          {/each}
        {/if}
      {/each}
    </div>

    <!-- C. Residence & Community Documents -->
    <div class="mt-6">
      <h4 class="text-sm font-bold text-purple-700 mb-2">{t.uploadDocuments?.ApplicantDocument.sectionC}</h4>
      {#each documents.residence as doc}
        <DocumentUploadRow
          documentName={t.uploadDocuments.ApplicantDocument[doc.key]}
          required={doc.required}
          uploaded={uploadedDocs[doc.id]?.uploaded || false}
          fileUrl={uploadedDocs[doc.id]?.url || ''}
          onUpload={(file) => onUpload(doc.id, file)}
          onView={() => onView(doc.id)}
          onDelete={() => onDelete(doc.id)}
          error={uploadErrors[doc.id] || ''}
          docId={doc.id}
        />
        {#if getDocIssues(doc.id).length > 0}
          {#each getDocIssues(doc.id) as q}
            <div class="mb-2 ml-2 mr-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-2 flex items-start gap-2">
              <svg class="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <p class="text-xs text-red-700"><strong>Issue:</strong> {q.instructionEng}</p>
            </div>
          {/each}
        {/if}
      {/each}
    </div>

    <!-- D. Family & Income Documents -->
    <div class="mt-6">
      <h4 class="text-sm font-bold text-purple-700 mb-2">{t.uploadDocuments?.ApplicantDocument.sectionD}</h4>
      {#each documents.familyIncome as doc}
        <DocumentUploadRow
          documentName={t.uploadDocuments.ApplicantDocument[doc.key]}
          required={doc.required}
          uploaded={uploadedDocs[doc.id]?.uploaded || false}
          fileUrl={uploadedDocs[doc.id]?.url || ''}
          onUpload={(file) => onUpload(doc.id, file)}
          onView={() => onView(doc.id)}
          onDelete={() => onDelete(doc.id)}
          error={uploadErrors[doc.id] || ''}
          docId={doc.id}
        />
        {#if getDocIssues(doc.id).length > 0}
          {#each getDocIssues(doc.id) as q}
            <div class="mb-2 ml-2 mr-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-2 flex items-start gap-2">
              <svg class="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <p class="text-xs text-red-700"><strong>Issue:</strong> {q.instructionEng}</p>
            </div>
          {/each}
        {/if}
      {/each}
    </div>

    <!-- E. Bank Documents -->
    <div class="mt-6 mb-4">
      <h4 class="text-sm font-bold text-purple-700 mb-2">{t.uploadDocuments?.ApplicantDocument.sectionE}</h4>
      {#each documents.bank as doc}
        <DocumentUploadRow
          documentName={t.uploadDocuments.ApplicantDocument[doc.key]}
          required={doc.required}
          uploaded={uploadedDocs[doc.id]?.uploaded || false}
          fileUrl={uploadedDocs[doc.id]?.url || ''}
          onUpload={(file) => onUpload(doc.id, file)}
          onView={() => onView(doc.id)}
          onDelete={() => onDelete(doc.id)}
          error={uploadErrors[doc.id] || ''}
          docId={doc.id}
        />
        {#if getDocIssues(doc.id).length > 0}
          {#each getDocIssues(doc.id) as q}
            <div class="mb-2 ml-2 mr-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg px-4 py-2 flex items-start gap-2">
              <svg class="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <p class="text-xs text-red-700"><strong>Issue:</strong> {q.instructionEng}</p>
            </div>
          {/each}
        {/if}
      {/each}
    </div>

  </div>
</div>