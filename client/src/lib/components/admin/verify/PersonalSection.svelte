<script>
  export let personal = null;
  function formatDate(val) {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function lbl(val) { return val || '—'; }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Personal & Identity</h3>
  </div>
  <div class="p-3">
    {#if personal}
      <table class="w-full text-sm">
        <tbody>
          {#each [
            ['Full Name',    lbl(personal.name)],
            ['Aadhar',       lbl(personal.aadhar)],
            ['Date of Birth',formatDate(personal.dob)],
            ['Gender',       lbl(personal.gender)],
            ['Religion',     lbl(personal.religion)],
            ['Mobile',       lbl(personal.mobile)],
            ['Email',        lbl(personal.email)],
            ['PAN',          lbl(personal.pan)],
            ['Resident',     personal.resident || '—'],
            ['Marital Status',lbl(personal.marital_status)],
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
          <p class="text-sm text-gray-700">{lbl(personal.current_address)}, {lbl(personal.current_place)} — {lbl(personal.current_pincode)}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Permanent Address</p>
          <p class="text-sm text-gray-700">{lbl(personal.permanent_address)}, {lbl(personal.permanent_place)} — {lbl(personal.permanent_pincode)}</p>
        </div>
      </div>
    {:else}
      <p class="text-sm text-gray-400 text-center py-8">No personal data</p>
    {/if}
  </div>
</div>