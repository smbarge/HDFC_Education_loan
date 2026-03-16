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

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="bg-purple-700 px-4 py-2.5">
    <h3 class="text-white font-bold text-xs uppercase tracking-widest">🤝 Co-Applicant & Guarantor</h3>
  </div>
  <div class="p-4">
    {#if guarantor}
      {#each [
        ['Full Name',    lbl(guarantor.name)],
        ['Date of Birth',formatDate(guarantor.dob)],
        ['Gender',       lbl(guarantor.gender)],
        ['Mobile',       lbl(guarantor.mobile)],
        ['Email',        lbl(guarantor.email)],
        ['Aadhar',       lbl(guarantor.aadhar)],
        ['PAN',          lbl(guarantor.pan)],
        ['Occupation',   lbl(guarantor.occupation)],
        ['Income',       formatCurrency(guarantor.income)],
        ['Marital Status',lbl(guarantor.marital_status)],
      ] as [l, v]}
        <div class="flex items-baseline gap-2 py-1.5 border-b border-dotted border-gray-100">
          <span class="text-xs text-gray-500 w-32 flex-shrink-0">{l}</span>
          <span class="text-xs font-semibold text-gray-800 break-all">{v || '—'}</span>
        </div>
      {/each}
      <!-- Addresses -->
      <div class="mt-2 pt-2 border-t border-gray-100">
        <p class="text-xs text-gray-500 mb-1 font-medium">Current Address</p>
        <p class="text-xs font-semibold text-gray-800">
          {lbl(guarantor.current_address)}, {lbl(guarantor.current_place)} — {lbl(guarantor.current_pincode)}
        </p>
      </div>
      <div class="mt-2 pt-2 border-t border-gray-100">
        <p class="text-xs text-gray-500 mb-1 font-medium">Permanent Address</p>
        <p class="text-xs font-semibold text-gray-800">
          {lbl(guarantor.permanent_address)}, {lbl(guarantor.permanent_place)} — {lbl(guarantor.permanent_pincode)}
        </p>
      </div>
    {:else}
      <p class="text-sm text-gray-400 text-center py-6">No guarantor data available</p>
    {/if}
  </div>
</div>