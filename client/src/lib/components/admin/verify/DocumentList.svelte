<script>
  export let docs = [];
  export let docVerification = {};
  export let sectionStatus = 'pending';
  export let sectionLabel = '';
  export let checkpointsByDoc = {};
  export let checkpointAnswers = {};

  export let expandedDocId = null;
  export let expandedDocUrl = null;
  export let expandedDocName = '';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function getQuestionsForDoc(documentId) {
    const docId = String(documentId);
    const entry = checkpointsByDoc[docId];
    return entry ? entry.questions : [];
  }

  // Reactive scores map — recomputes whenever checkpointAnswers or docs change
  $: scores = (() => {
    const map = {};
    (docs || []).forEach(doc => {
      const questions = getQuestionsForDoc(doc.document_id);
      if (questions.length === 0) { map[doc.document_id] = null; return; }
      const yes = questions.filter(q => checkpointAnswers[q.id] === 'yes').length;
      map[doc.document_id] = { yes, total: questions.length };
    });
    return map;
  })();

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
  </div>

  <!-- Document Rows -->
  {#if docs.length === 0}
    <div class="py-12 text-center text-gray-400 text-base">No documents in this section</div>
  {:else}
    <div class="divide-y divide-gray-100">
      {#each docs as doc}
        {@const status = docVerification[doc.document_id] || 'pending'}
        <div
          class="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer
            {expandedDocId === doc.document_id ? 'bg-blue-50' : 'hover:bg-gray-50'}"
          on:click={() => openDoc(doc)}
        >
          <!-- Doc icon -->
          <div class="w-8 h-8 rounded flex items-center justify-center flex-shrink-0
            {expandedDocId === doc.document_id ? 'bg-blue-100' : 'bg-gray-100'}">
            <svg class="w-4 h-4 {expandedDocId === doc.document_id ? 'text-blue-500' : 'text-gray-500'}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
{#if status === 'verified' || status === 'rejected'}
  {@const score = scores[doc.document_id]}
  <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0
    {status === 'verified'
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-red-600 bg-red-50 border-red-200'}">
    {status === 'verified' ? '✓' : '✕'}
    {score !== null ? `${score.yes}/${score.total}` : status === 'verified' ? 'Verified' : 'Rejected'}
  </span>
{:else}
  {@const score = scores[doc.document_id]}
  {#if score !== null}
    <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0
      {score.yes === score.total && score.total > 0
        ? 'text-green-600 bg-green-50 border-green-200'
        : score.yes === 0
          ? 'text-gray-500 bg-gray-50 border-gray-200'
          : 'text-amber-600 bg-amber-50 border-amber-200'}">
      {score.yes}/{score.total}
    </span>
  {:else}
    <span class="text-sm font-medium px-2 py-0.5 rounded border text-gray-500 bg-gray-50 border-gray-200 flex-shrink-0">
      ○ Pending
    </span>
  {/if}
{/if}
          <!-- View indicator -->
          <div class="flex-shrink-0">
            <svg class="w-4 h-4 transition-transform {expandedDocId === doc.document_id ? 'rotate-90 text-blue-500' : 'text-gray-400'}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>