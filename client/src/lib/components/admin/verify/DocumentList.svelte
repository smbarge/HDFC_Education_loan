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

  // True when every checkpoint for the expanded doc is answered
  $: allCheckpointsAnswered = (() => {
    if (!expandedDocId) return true;
    const questions = getQuestionsForDoc(expandedDocId);
    if (questions.length === 0) return true;
    return questions.every(q => checkpointAnswers[q.id] === 'yes' || checkpointAnswers[q.id] === 'no');
  })();

  function handleSave() {
    if (!allCheckpointsAnswered) return;
    dispatch('saveDoc', { docId: expandedDocId });
    expandedDocId = null;
    expandedDocUrl = null;
    expandedDocName = '';
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">

  <!-- Header
  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
    <div>
      <p class="text-base font-semibold text-gray-800">{sectionLabel}</p>
      <p class="text-sm text-gray-400 mt-0.5">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
    </div>
  </div> -->

  <!-- Document Rows -->
  {#if docs.length === 0}
    <div class="py-12 text-center text-gray-400 text-base">No documents in this section</div>
  {:else}
    <div class="divide-y divide-gray-100">
      {#each docs as doc}
        {@const status = docVerification[doc.document_id] || 'pending'}
        {@const score = scores[doc.document_id]}
        {@const questions = getQuestionsForDoc(doc.document_id)}
        {@const isExpanded = expandedDocId === doc.document_id}

        <!-- Row -->
        <div>
          <div
            class="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer
              {isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}"
            on:click={() => openDoc(doc)}
          >
            <!-- Doc icon -->
            <div class="w-8 h-8 rounded flex items-center justify-center flex-shrink-0
              {isExpanded ? 'bg-blue-100' : 'bg-gray-100'}">
              <svg class="w-4 h-4 {isExpanded ? 'text-blue-500' : 'text-gray-500'}"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>

            <!-- Name + section -->
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-gray-800 truncate">{doc.document_name}</p>
              <p class="text-sm text-gray-400">{doc.section_name || ''}</p>
            </div>

            <!-- Status badge -->
            {#if status === 'verified'}
              <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0 text-green-600 bg-green-50 border-green-200">
                ✓ {score !== null ? `${score.yes}/${score.total}` : 'Verified'}
              </span>
            {:else if status === 'rejected'}
              <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0 text-red-600 bg-red-50 border-red-200">
                ✕ {score !== null ? `${score.yes}/${score.total}` : 'Rejected'}
              </span>
            {:else if score !== null}
              <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0
                {score.yes === score.total && score.total > 0
                  ? 'text-green-600 bg-green-50 border-green-200'
                  : score.yes === 0
                    ? 'text-gray-500 bg-gray-50 border-gray-200'
                    : 'text-amber-600 bg-amber-50 border-amber-200'}">
                {score.yes}/{score.total}
              </span>
            {:else}
              <span class="text-sm font-medium px-2 py-0.5 rounded border flex-shrink-0 text-gray-500 bg-gray-50 border-gray-200">
                ○ Pending
              </span>
            {/if}

            <!-- Expand/Collapse toggle -->
            <div class="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center
              {isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {#if isExpanded}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/>
                {:else}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16M4 12h16"/>
                {/if}
              </svg>
            </div>
          </div>

          <!-- Checkpoint questions — shown inline below the row when expanded -->
          {#if isExpanded && questions.length > 0}
            <div class="px-4 pb-3 bg-blue-50 border-t border-blue-100">
              <p class="text-xs font-bold text-yellow-700 uppercase tracking-wide pt-3 pb-2">Verification Checklist</p>
              <div class="space-y-2">
                {#each questions as q}
                  <div class="flex items-start gap-3 bg-white rounded border border-yellow-100 px-3 py-2">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-800">{q.question}</p>
                      {#if q.instruction_eng}
                        <p class="text-xs text-gray-500 mt-0.5">{q.instruction_eng}</p>
                      {/if}
                      {#if q.mandatory_field === 'yes'}
                        <span class="text-xs text-red-500 font-semibold">* Mandatory</span>
                      {/if}
                    </div>
                    <div class="flex gap-1.5 flex-shrink-0 mt-0.5">
                      <button
                        on:click|stopPropagation={() => { checkpointAnswers[q.id] = 'yes'; checkpointAnswers = { ...checkpointAnswers }; }}
                        class="px-2.5 py-1 text-xs font-semibold rounded border transition-colors
                          {checkpointAnswers[q.id] === 'yes'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}"
                      >Yes</button>
                      <button
                        on:click|stopPropagation={() => { checkpointAnswers[q.id] = 'no'; checkpointAnswers = { ...checkpointAnswers }; }}
                        class="px-2.5 py-1 text-xs font-semibold rounded border transition-colors
                          {checkpointAnswers[q.id] === 'no'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-red-600 border-red-300 hover:bg-red-50'}"
                      >No</button>
                    </div>
                  </div>
                {/each}
              </div>

              <!-- Save & Continue -->
              <div class="mt-3 pt-3 border-t border-blue-200">
                {#if !allCheckpointsAnswered}
                  <p class="text-xs text-amber-600 font-medium mb-2 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                    Answer all questions to continue.
                  </p>
                {/if}
                <button
                  on:click|stopPropagation={handleSave}
                  disabled={!allCheckpointsAnswered}
                  class="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded transition-colors
                    {allCheckpointsAnswered
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'}"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  Save &amp; Continue
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>