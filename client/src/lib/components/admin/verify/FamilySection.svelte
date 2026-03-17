<script>
  export let personal = null;
  function lbl(val) { return val || '—'; }
  function formatCurrency(val) {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Family & Income</h3>
  </div>
  <div class="p-3">
    {#if personal}
      <table class="w-full text-sm">
        <tbody>
          {#each [
            ['Guardian Name',    lbl(personal.guardian_name)],
            ['Occupation',       lbl(personal.occupation)],
            ['Annual Income',    formatCurrency(personal.income)],
            ['Marital Status',   lbl(personal.marital_status)],
            ['Education Qual',   lbl(personal.education_qualification)],
            ['Ration Card No',   lbl(personal.ration_card_number)],
            ['Riot Victim',      personal.riot_victim === 1 ? 'Yes' : 'No'],
            ['Natural Calamity', personal.natural_calamity_victim === 1 ? 'Yes' : 'No'],
            ['Disabled Person',  personal.disabled_person === 1 ? 'Yes' : 'No'],
          ] as [l, v]}
            <tr class="border-b border-gray-50 last:border-0">
              <td class="py-1.5 pr-3 text-gray-400 whitespace-nowrap w-36">{l}</td>
              <td class="py-1.5 text-gray-800 font-medium">{v}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="text-sm text-gray-400 text-center py-8">No family data</p>
    {/if}
  </div>
</div>