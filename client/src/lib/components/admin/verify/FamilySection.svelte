<script>
  export let personal = null;
  function lbl(val) { return val || '—'; }
  function formatCurrency(val) {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="bg-purple-700 px-4 py-2.5">
    <h3 class="text-white font-bold text-xs uppercase tracking-widest">👨‍👩‍👧 Family & Income</h3>
  </div>
  <div class="p-4">
    {#if personal}
      {#each [
        ['Guardian Name',  lbl(personal.guardian_name)],
        ['Occupation',     lbl(personal.occupation)],
        ['Annual Income',  formatCurrency(personal.income)],
        ['Marital Status', lbl(personal.marital_status)],
        ['Education Qual', lbl(personal.education_qualification)],
        ['Ration Card No', lbl(personal.ration_card_number)],
        ['Riot Victim',    personal.riot_victim === 1 ? 'Yes' : 'No'],
        ['Natural Calamity',personal.natural_calamity_victim === 1 ? 'Yes' : 'No'],
        ['Disabled Person',personal.disabled_person === 1 ? 'Yes' : 'No'],
      ] as [l, v]}
        <div class="flex items-baseline gap-2 py-1.5 border-b border-dotted border-gray-100 last:border-0">
          <span class="text-xs text-gray-500 w-36 flex-shrink-0">{l}</span>
          <span class="text-xs font-semibold text-gray-800">{v || '—'}</span>
        </div>
      {/each}
    {:else}
      <p class="text-sm text-gray-400 text-center py-6">No family data available</p>
    {/if}
  </div>
</div>