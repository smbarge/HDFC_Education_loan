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


  const documents = [
    { id: 'coAadhar', key: 'aadharCard', required: true },
    { id: 'coIncomeCert', key: 'incomeCertificate', required: true },
    { id: 'coRationCard', key: 'rationCard', required: false }
  ];
</script>

<div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">

  <div class="bg-purple-500 text-white px-6 py-3">
    <h3 class="text-lg font-bold">{t.uploadDocuments?.CoApplicantDocument?.sectionTitle}</h3>
  </div>

  
  <div class="grid grid-cols-12 gap-4 bg-gray-100 px-6 py-3 border-b border-gray-200">
    <div class="col-span-12 md:col-span-6">
      <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.CoApplicantDocument?.documentsName}</p>
    </div>
    <div class="col-span-12 md:col-span-4 text-center">
      <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.CoApplicantDocument?.uploadView}</p>
    </div>
    <div class="col-span-12 md:col-span-2 text-center">
      <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.CoApplicantDocument?.delete}</p>
    </div>
  </div>

  <div class="px-6 py-2">
    {#each documents as doc}
      <DocumentUploadRow
        documentName={t.uploadDocuments?.CoApplicantDocument?.[doc.key]}
        required={doc.required}
        uploaded={uploadedDocs[doc.id]?.uploaded || false}
        fileUrl={uploadedDocs[doc.id]?.url || ''}
        onUpload={(file) => onUpload(doc.id, file)}
        onView={() => onView(doc.id)}
        onDelete={() => onDelete(doc.id)}
        error={uploadErrors[doc.id] || ''}
        docId={doc.id}
      />
    {/each}
  </div>
</div>