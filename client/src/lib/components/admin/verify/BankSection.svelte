<script>
  export let education = null;
  function lbl(val) { return val || '—'; }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="bg-purple-700 px-4 py-2.5">
    <h3 class="text-white font-bold text-xs uppercase tracking-widest">🏦 Bank Documents</h3>
  </div>
  <div class="p-4">
    {#if education}
      <div class="space-y-2">
        {#each [
          ['Bank Name',      lbl(education.bank_name)],
          ['Branch Name',    lbl(education.branch_name)],
          ['IFSC Code',      lbl(education.ifsc_code)],
          ['Account Number', lbl(education.account_number)],
          ['Bank Address',   lbl(education.bank_address)],
          ['GST Number',     lbl(education.gst_number)],
        ] as [l, v]}
          <div class="flex items-baseline gap-2 py-1.5 border-b border-dotted border-gray-100 last:border-0">
            <span class="text-xs text-gray-500 w-36 flex-shrink-0">{l}</span>
            <span class="text-xs font-semibold text-gray-800 font-mono break-all">{v}</span>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-sm text-gray-400 text-center py-6">No bank data available</p>
    {/if}
  </div>
</div>