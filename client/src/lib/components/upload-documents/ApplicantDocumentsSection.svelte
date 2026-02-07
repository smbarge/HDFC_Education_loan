<script>
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import DocumentUploadRow from './DocumentUploadRow.svelte';
  
  export let onUpload = () => {};
  export let onView = () => {};
  export let onDelete = () => {};
  export let uploadedDocs = {};
  export let uploadErrors = {};

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

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
      { id: 'entranceExam', key: 'entranceExam', required: false }
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
      { id: 'passbook', key: 'passbook', required: true },
      { id: 'cancelledCheque', key: 'cancelledCheque', required: true }
    ]
  };

</script>

<div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
  <!-- Header -->
  <div class="bg-purple-500 text-white px-6 py-3">
    <h3 class="text-lg font-bold">{t.uploadDocuments?.ApplicantDocument.title}</h3>
  </div>

  <!-- Table Header -->
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

  <!-- Documents -->
  <div class="px-6">
    <!-- Personal and Identity Documents -->
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
      {/each}
    </div>

    <!-- Educational Documents -->
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
      {/each}
    </div>

    <!-- Residence & Community Documents -->
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
      {/each}
    </div>

    <!-- Family & Income Documents -->
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
      {/each}
    </div>

    <!-- Bank Documents -->
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
      {/each}
    </div>
  </div>
</div>