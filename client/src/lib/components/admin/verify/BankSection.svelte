<script>
  export let education = null;
  function lbl(val) { return val || '—'; }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Bank Documents</h3>
  </div>
  <div class="p-3">
    {#if education}
      <table class="w-full text-sm">
        <tbody>
          {#each [
            ['Bank Name',      lbl(education.bank_name)],
            ['Branch Name',    lbl(education.branch_name)],
            ['IFSC Code',      lbl(education.ifsc_code)],
            ['Account Number', lbl(education.account_number)],
            ['Bank Address',   lbl(education.bank_address)],
            ['GST Number',     lbl(education.gst_number)],
          ] as [l, v]}
            <tr class="border-b border-gray-50 last:border-0">
              <td class="py-1.5 pr-3 text-gray-400 whitespace-nowrap w-36">{l}</td>
              <td class="py-1.5 text-gray-800 font-medium font-mono break-all">{v}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="text-sm text-gray-400 text-center py-8">No bank data</p>
    {/if}
  </div>
</div>