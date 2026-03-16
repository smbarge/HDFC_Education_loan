<script>
  export let personal = null;
  function formatDate(val) {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function lbl(val) { return val || '—'; }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="bg-purple-700 px-4 py-2.5">
    <h3 class="text-white font-bold text-xs uppercase tracking-widest">👤 Personal & Identity</h3>
  </div>
  <div class="p-4">
    {#if personal}
      {#each [
        ['Full Name',    lbl(personal.name)],
        ['Aadhar',       lbl(personal.aadhar)],
        ['Date of Birth',formatDate(personal.dob)],
        ['Gender',       lbl(personal.gender)],
        ['Religion',     lbl(personal.religion)],
        ['Mobile',       lbl(personal.mobile)],
        ['Email',        lbl(personal.email)],
        ['PAN',          lbl(personal.pan)],
        ['Resident',     personal.resident],
        ['Marital Status',lbl(personal.marital_status)],
      ] as [l, v]}
        <div class="flex items-baseline gap-2 py-1.5 border-b border-dotted border-gray-100 last:border-0">
          <span class="text-xs text-gray-500 w-32 flex-shrink-0">{l}</span>
          <span class="text-xs font-semibold text-gray-800 break-all">{v || '—'}</span>
        </div>
      {/each}
      <!-- Addresses -->
      <div class="mt-2 pt-2 border-t border-gray-100">
        <p class="text-xs text-gray-500 mb-1 font-medium">Current Address</p>
        <p class="text-xs font-semibold text-gray-800">
          {lbl(personal.current_address)}, {lbl(personal.current_place)} — {lbl(personal.current_pincode)}
        </p>
      </div>
      <div class="mt-2 pt-2 border-t border-gray-100">
        <p class="text-xs text-gray-500 mb-1 font-medium">Permanent Address</p>
        <p class="text-xs font-semibold text-gray-800">
          {lbl(personal.permanent_address)}, {lbl(personal.permanent_place)} — {lbl(personal.permanent_pincode)}
        </p>
      </div>
    {:else}
      <p class="text-sm text-gray-400 text-center py-6">No personal data available</p>
    {/if}
  </div>
</div>