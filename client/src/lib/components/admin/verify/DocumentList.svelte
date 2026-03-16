<script>
  export let docs = [];
  export let docVerification = {};
  export let sectionStatus = 'pending';
  export let sectionLabel = '';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function statusBadge(status) {
    if (status === 'verified') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
    <div>
      <h3 class="text-sm font-bold text-gray-800">{sectionLabel} — Documents</h3>
      <p class="text-xs text-gray-500 mt-0.5">
        {docs.length} document{docs.length !== 1 ? 's' : ''} in this section
      </p>
    </div>
    <div class="flex gap-2">
      <button
        on:click={() => dispatch('verifySection')}
        class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
          {sectionStatus === 'verified' ? 'bg-green-600 text-white' : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'}"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
        </svg>
        {sectionStatus === 'verified' ? 'Verified' : 'Verify All'}
      </button>
      <button
        on:click={() => dispatch('rejectSection')}
        class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
          {sectionStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-200'}"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        {sectionStatus === 'rejected' ? 'Rejected' : 'Reject All'}
      </button>
    </div>
  </div>

  <!-- Doc List -->
  {#if docs.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-500">No documents uploaded</p>
      <p class="text-xs text-gray-400 mt-1">No documents found for this section</p>
    </div>
  {:else}
    <div class="divide-y divide-gray-100">
      {#each docs as doc, idx}
        {@const status = docVerification[doc.document_id] || 'pending'}
        <div class="p-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-start gap-3">

            <!-- Icon -->
            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
              {status === 'verified' ? 'bg-green-100' : status === 'rejected' ? 'bg-red-100' : 'bg-purple-100'}">
              <svg class="w-4 h-4 {status === 'verified' ? 'text-green-600' : status === 'rejected' ? 'text-red-600' : 'text-purple-600'}"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>

            <!-- Info + Actions -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p class="text-sm font-semibold text-gray-800">{idx + 1}. {doc.document_name}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{doc.section_name || 'Document'}</p>
                </div>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 {statusBadge(status)}">
                  {status === 'verified' ? '✓ Verified' : status === 'rejected' ? '✕ Rejected' : '○ Pending'}
                </span>
              </div>

              <!-- Buttons -->
              <div class="flex items-center flex-wrap gap-2">
                <a href={doc.file_name} target="_blank" rel="noopener noreferrer"
                  class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  View Doc
                </a>

                {#if status !== 'verified'}
                  <button on:click={() => dispatch('verify', doc.document_id)}
                    class="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 text-xs font-semibold rounded-lg transition-colors">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    Verify
                  </button>
                {/if}

                {#if status !== 'rejected'}
                  <button on:click={() => dispatch('reject', doc.document_id)}
                    class="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 text-xs font-semibold rounded-lg transition-colors">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Reject
                  </button>
                {/if}

                {#if status !== 'pending'}
                  <button on:click={() => dispatch('reset', doc.document_id)}
                    class="px-2 py-1.5 text-gray-500 hover:text-gray-700 text-xs rounded-lg hover:bg-gray-100 transition-colors">
                    Reset
                  </button>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>