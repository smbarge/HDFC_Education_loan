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
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-8 text-center">
    <p class="text-gray-500">{t.uploadDocuments?.GuarantorDocument?.noGuarantorFound}</p>
  </div>
{/if}