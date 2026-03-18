<script>
  export let guarantor = null;
  function lbl(val) { return val || '—'; }
  function formatDate(val) {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function formatCurrency(val) {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Co-Applicant & Guarantor</h3>
  </div>
  <div class="p-3">
    {#if guarantor}
      <table class="w-full text-sm">
        <tbody>
          {#each [
            ['Full Name',     lbl(guarantor.name)],
            ['Date of Birth', formatDate(guarantor.dob)],
            ['Gender',        lbl(guarantor.gender)],
            ['Mobile',        lbl(guarantor.mobile)],
            ['Email',         lbl(guarantor.email)],
            ['Aadhar',        lbl(guarantor.aadhar)],
            ['PAN',           lbl(guarantor.pan)],
            ['Occupation',    lbl(guarantor.occupation)],
            ['Income',        formatCurrency(guarantor.income)],
            ['Marital Status',lbl(guarantor.marital_status)],
          ] as [l, v]}
            <tr class="border-b border-gray-50 last:border-0">
              <td class="py-1.5 pr-3 text-gray-400 whitespace-nowrap w-32">{l}</td>
              <td class="py-1.5 text-gray-800 font-medium break-all">{v}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div class="mt-3 pt-3 border-t border-gray-100 space-y-2">
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Current Address</p>
          <p class="text-sm text-gray-700">{lbl(guarantor.current_address)}, {lbl(guarantor.current_place)} — {lbl(guarantor.current_pincode)}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Permanent Address</p>
          <p class="text-sm text-gray-700">{lbl(guarantor.permanent_address)}, {lbl(guarantor.permanent_place)} — {lbl(guarantor.permanent_pincode)}</p>
        </div>
      </div>
    {:else}
      <p class="text-sm text-gray-400 text-center py-8">No guarantor data</p>
    {/if}
  </div>
</div>