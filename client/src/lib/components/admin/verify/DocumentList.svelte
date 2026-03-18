<script>
export let docs = [];
  export let docVerification = {};
  export let sectionStatus = 'pending';
  export let sectionLabel = '';
    export let checkpointsByDoc = {};  // keyed by document_id from backend

  
    $: console.log('Checkpoint que resived:',checkpointsByDoc);

  $: console.log('Docs received:', docs);

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // checkpoint answers: { questionId: 'yes'|'no'|'' }
  let checkpointAnswers = {};

  // Get questions for a specific document_id
function getQuestionsForDoc(documentId) {
    const docId = String(documentId);
    const entry = checkpointsByDoc[docId];
    return entry ? entry.questions : [];
  }

  let expandedDocId = null;
  let expandedDocUrl = null;
  let expandedDocName = '';

  function openDoc(doc) {
    if (expandedDocId === doc.document_id) {
      expandedDocId = null;
      expandedDocUrl = null;
      expandedDocName = '';
    } else {
      expandedDocId = doc.document_id;
      expandedDocUrl = doc.file_name;
      expandedDocName = doc.document_name;
    }
  }

  function isImage(url) {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
  }

  function isPdf(url) {
    if (!url) return false;
    return /\.pdf(\?.*)?$/i.test(url);
  }

  function statusColor(status) {
    if (status === 'verified') return 'text-green-600 bg-green-50 border-green-200';
    if (status === 'rejected') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  }

  function statusLabel(status) {
    if (status === 'verified') return '✓ Verified';
    if (status === 'rejected') return '✕ Rejected';
    return '○ Pending';
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">

  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
    <div>
      <p class="text-base font-semibold text-gray-800">{sectionLabel}</p>
      <p class="text-sm text-gray-400 mt-0.5">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
    </div>
    <div class="flex gap-2">
      <button
        on:click={() => dispatch('verifySection')}
        class="px-3 py-1.5 text-sm font-semibold rounded border transition-colors
          {sectionStatus === 'verified'
            ? 'bg-green-600 text-white border-green-600'
            : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}"
      >✓ Verify All</button>
      <button
        on:click={() => dispatch('rejectSection')}
        class="px-3 py-1.5 text-sm font-semibold rounded border transition-colors
          {sectionStatus === 'rejected'
            ? 'bg-red-600 text-white border-red-600'
            : 'bg-white text-red-600 border-red-300 hover:bg-red-50'}"
      >✕ Reject All</button>
    </div>
  </div>

  <!-- Document Rows -->
  {#if docs.length === 0}
    <div class="py-12 text-center text-gray-400 text-base">No documents in this section</div>
  {:else}
    <div class="divide-y divide-gray-100">
      {#each docs as doc}
        {@const status = docVerification[doc.document_id] || 'pending'}
        <div>
          <!-- Doc Row -->
          <div class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            <!-- Doc icon -->
            <div class="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>

            <!-- Name -->
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-gray-800 truncate">{doc.document_name}</p>
              <p class="text-sm text-gray-400">{doc.section_name || ''}</p>
            </div>

            <!-- Status badge -->
            <span class="text-sm font-medium px-2 py-0.5 rounded border {statusColor(status)} flex-shrink-0">
              {statusLabel(status)}
            </span>

            <!-- Actions -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <!-- View toggle -->
              <button
                on:click={() => openDoc(doc)}
                class="px-2.5 py-1 text-sm font-medium rounded border transition-colors
                  {expandedDocId === doc.document_id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}"
              >
                {expandedDocId === doc.document_id ? 'Close' : 'View'}
              </button>

              {#if status !== 'verified'}
                <button
                  on:click={() => dispatch('verify', doc.document_id)}
                  class="px-2.5 py-1 text-sm font-medium rounded border bg-white text-green-700 border-green-300 hover:bg-green-50 transition-colors"
                >✓</button>
              {/if}

              {#if status !== 'rejected'}
                <button
                  on:click={() => dispatch('reject', doc.document_id)}
                  class="px-2.5 py-1 text-sm font-medium rounded border bg-white text-red-600 border-red-300 hover:bg-red-50 transition-colors"
                >✕</button>
              {/if}

              {#if status !== 'pending'}
                <button
                  on:click={() => dispatch('reset', doc.document_id)}
                  class="px-2.5 py-1 text-sm font-medium rounded border bg-white text-gray-500 border-gray-300 hover:bg-gray-50 transition-colors"
                >↺</button>
              {/if}
            </div>
          </div>

          <!-- Inline document viewer -->
          {#if expandedDocId === doc.document_id && expandedDocUrl}
            <div class="border-t border-blue-100 bg-blue-50 p-4">
              <p class="text-sm font-semibold text-gray-600 mb-3">{expandedDocName}</p>

              <!-- Document preview -->
              <div class="bg-white rounded border border-gray-200 overflow-hidden mb-3">
                {#if isImage(expandedDocUrl)}
                  <img
                    src={expandedDocUrl}
                    alt={expandedDocName}
                    class="w-full object-contain max-h-[500px]"
                  />
                {:else if isPdf(expandedDocUrl)}
                  <iframe
                    src={expandedDocUrl}
                    title={expandedDocName}
                    class="w-full h-[500px]"
                    frameborder="0"
                  ></iframe>
                {:else}
                  <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <p class="text-base">Preview not available</p>
                    <a href={expandedDocUrl} target="_blank" rel="noopener noreferrer"
                      class="mt-2 text-sm text-blue-600 hover:underline">Open in new tab →</a>
                  </div>
                {/if}
              </div>

             <!-- Checkpoint Questions for this document -->
              {#if getQuestionsForDoc(doc.document_id).length > 0}
                <div class="mb-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p class="text-sm font-bold text-yellow-800 mb-2">Verification Checklist</p>
                  <div class="space-y-2">
                  {#each getQuestionsForDoc(doc.document_id) as q}         
                       <div class="flex items-start gap-3 p-2 bg-white rounded border border-yellow-100">
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-800">{q.question}</p>
                          {#if q.instruction_eng}
                            <p class="text-xs text-gray-500 mt-0.5">{q.instruction_eng}</p>
                          {/if}
                          {#if q.mandatory_field === 'yes'}
                            <span class="text-xs text-red-500 font-semibold">* Mandatory</span>
                          {/if}
                        </div>
                        <div class="flex gap-1.5 flex-shrink-0">
                          <button
                            on:click={() => { checkpointAnswers[q.id] = 'yes'; checkpointAnswers = {...checkpointAnswers}; }}
                            class="px-2.5 py-1 text-xs font-semibold rounded border transition-colors
                              {checkpointAnswers[q.id] === 'yes' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}"
                          >Yes</button>
                          <button
                            on:click={() => { checkpointAnswers[q.id] = 'no'; checkpointAnswers = {...checkpointAnswers}; }}
                            class="px-2.5 py-1 text-xs font-semibold rounded border transition-colors
                              {checkpointAnswers[q.id] === 'no' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-300 hover:bg-red-50'}"
                          >No</button>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Accept / Reject below doc -->
              <div class="flex items-center gap-2">
                <button
                  on:click={() => { dispatch('verify', doc.document_id); expandedDocId = null; }}
                  class="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  Accept Document
                </button>
                <button
                  on:click={() => { dispatch('reject', doc.document_id); expandedDocId = null; }}
                  class="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Reject Document
                </button>
                <a href={expandedDocUrl} target="_blank" rel="noopener noreferrer"
                  class="px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors">
                  Open in new tab ↗
                </a>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>