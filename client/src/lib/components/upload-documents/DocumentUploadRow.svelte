<script>
  export let documentName = '';
  export let documentNameMr = '';
  export let required = false;
  export let onUpload = () => {};
  export let onView = () => {};
  export let onDelete = () => {};
  export let uploaded = false;
  export let fileUrl = '';
  export let error = '';
  export let docId = ''; 

   import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { validateFileSize, validateFileType } from '$lib/validation/application/uploaddocuments';
  import { getDocumentTypeRequirement } from '$lib/validation/application/uploaddocuments';

$: acceptedTypes = (() => {
  const typeReq = getDocumentTypeRequirement(docId);
  if (typeReq.requiresImage) {
    return '.jpg,.jpeg,.png';
  } else if (typeReq.requiresPDF) {
    return '.pdf';
  } else {
    return '.pdf,.jpg,.jpeg,.png';
  }
})();

  let fileInput;

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

 function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    onUpload(file);
  }
}

  function triggerFileInput() {
    fileInput.click();
  }
</script>

<div class="border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors">
  <div class="grid grid-cols-12 gap-4 items-center">
    <div class="col-span-12 md:col-span-6">
      <p class="text-sm font-medium text-gray-800">
        {documentName}
        {#if required}
          <span class="text-red-500">*</span>
        {/if}
      </p>
      <p class="text-xs text-gray-600 mt-0.5">{documentNameMr}</p>

      {#if acceptedTypes === '.jpg,.jpeg,.png'}
        <p class="text-xs text-blue-600 mt-1">
          <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Image only (JPG, PNG) / फक्त प्रतिमा (JPG, PNG)
        </p>
      {/if}
    </div>

    <!-- Upload/View Actions -->
    <div class="col-span-12 md:col-span-4 flex items-center justify-center gap-2">
      <input
        type="file"
        bind:this={fileInput}
        on:change={handleFileSelect}
        accept={acceptedTypes}
        class="hidden"
      />
      
      {#if !uploaded}
        <button
          on:click={triggerFileInput}
          class="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          title="Upload"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          {t.uploadDocuments?.ApplicantDocument.upload}
        </button>
      {:else}
        <button
          on:click={onView}
          class="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
          title="View"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          {t.uploadDocuments?.ApplicantDocument.view}
        </button>
      {/if}
    </div>

    <!-- Delete Action -->
    <div class="col-span-12 md:col-span-2 flex items-center justify-center">
      {#if uploaded}
        <button
          on:click={onDelete}
          class="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
          title="Delete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          {t.uploadDocuments?.ApplicantDocument.deleteDoc}
        </button>
      {:else}
        <span class="text-gray-400 text-xs">—</span>
      {/if}
    </div>
  </div>

  <!-- ADD THIS ERROR MESSAGE DISPLAY -->
  {#if error}
    <div class="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
      <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>{error}</span>
    </div>
  {/if}
</div>