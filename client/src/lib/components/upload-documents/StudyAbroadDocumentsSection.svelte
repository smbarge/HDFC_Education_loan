<script>
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import DocumentUploadRow from './DocumentUploadRow.svelte';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  export let onUpload = () => {};
  export let onView = () => {};
  export let onDelete = () => {};
  export let uploadedDocs = {};
  export let uploadErrors = {};
   export let rejectedDocsMap = {};


  const docIdToMasterIdMap = {
    'passport_abroad': 39,
    'visa_abroad': 40,
  };

  function getDocIssues(docId) {
    const masterId = String(docIdToMasterIdMap[docId] || '');
    if (!masterId) return [];
    const flagged = rejectedDocsMap[masterId];
    if (!flagged?.failingQuestions?.length) return [];
    return flagged.failingQuestions.filter(q => q.instructionEng);
  }

  // Use translation keys instead of hardcoded text
  $: documents = [
    {
      id: 'passport_abroad',
      label: t.uploadDocuments?.StudyAbroadDocument?.passport || 'Complete Passport (All Pages)',
      required: true
    },
    {
      id: 'visa_abroad',
      label: t.uploadDocuments?.StudyAbroadDocument?.visa || 'Valid Visa',
      required: true
    }
  ];
</script>

<div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">

  <div class="bg-purple-500 text-white px-6 py-3">
    <h3 class="text-lg font-bold">
      {t.uploadDocuments?.StudyAbroadDocument?.sectionTitle || 'STUDY ABROAD DOCUMENTS'}
    </h3>
  </div>

  <div class="grid grid-cols-12 gap-4 bg-gray-100 px-6 py-3 border-b border-gray-200">
    <div class="col-span-12 md:col-span-6">
      <p class="text-sm font-bold text-gray-700">
        {t.uploadDocuments?.StudyAbroadDocument?.documentsName || 'DOCUMENTS NAME'}
      </p>
    </div>
    <div class="col-span-12 md:col-span-4 text-center">
      <p class="text-sm font-bold text-gray-700">
        {t.uploadDocuments?.StudyAbroadDocument?.uploadView || 'UPLOAD / VIEW'}
      </p>
    </div>
    <div class="col-span-12 md:col-span-2 text-center">
      <p class="text-sm font-bold text-gray-700">
        {t.uploadDocuments?.StudyAbroadDocument?.deleteButton || 'DELETE'}
      </p>
    </div>
  </div>

  <div class="px-6 py-2">
    {#each documents as doc}
      <DocumentUploadRow
        documentName={doc.label}
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