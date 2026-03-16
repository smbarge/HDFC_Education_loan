<script>
  export let collateral = null;
  function lbl(val) { return val || '—'; }
  function formatCurrency(val) {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  }
  function formatDate(val) {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="bg-purple-700 px-4 py-2.5">
    <h3 class="text-white font-bold text-xs uppercase tracking-widest">🏠 Collateral / Study Abroad</h3>
  </div>
  <div class="p-4 space-y-4">
    {#if collateral}

      <!-- Properties -->
      {#if collateral.properties?.length}
        <div>
          <p class="text-xs font-bold text-purple-700 uppercase mb-2">Properties</p>
          {#each collateral.properties as prop, i}
            <div class="bg-purple-50 rounded-lg p-3 mb-2 border border-purple-100">
              <p class="text-xs font-bold text-purple-700 mb-2">Property {i + 1}</p>
              {#each [
                ['Survey No',  lbl(prop.survey_no)],
                ['District',   lbl(prop.district_id)],
                ['Place',      lbl(prop.place)],
                ['Units',      lbl(prop.units)],
                ['Area',       lbl(prop.area_value)],
                ['Valuation',  formatCurrency(prop.property_value)],
              ] as [l, v]}
                <div class="flex gap-2 py-0.5">
                  <span class="text-xs text-gray-500 w-24 flex-shrink-0">{l}</span>
                  <span class="text-xs font-semibold text-gray-800">{v}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}

      <!-- FDs -->
      {#if collateral.fds?.length}
        <div>
          <p class="text-xs font-bold text-blue-700 uppercase mb-2">Fixed Deposits</p>
          {#each collateral.fds as fd, i}
            <div class="bg-blue-50 rounded-lg p-3 mb-2 border border-blue-100">
              <p class="text-xs font-bold text-blue-700 mb-2">FD {i + 1}</p>
              {#each [
                ['Bank Name',     lbl(fd.bank_name)],
                ['Branch',        lbl(fd.branch_name)],
                ['FD Acc No',     lbl(fd.fd_acc_no)],
                ['Amount',        formatCurrency(fd.amount)],
                ['Start Date',    formatDate(fd.fd_start_date)],
                ['Maturity Date', formatDate(fd.fd_maturity_date)],
                ['Interest Rate', fd.interest_rate ? `${fd.interest_rate}%` : '—'],
              ] as [l, v]}
                <div class="flex gap-2 py-0.5">
                  <span class="text-xs text-gray-500 w-28 flex-shrink-0">{l}</span>
                  <span class="text-xs font-semibold text-gray-800">{v}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}

      <!-- LICs -->
      {#if collateral.lics?.length}
        <div>
          <p class="text-xs font-bold text-green-700 uppercase mb-2">LIC Policies</p>
          {#each collateral.lics as lic, i}
            <div class="bg-green-50 rounded-lg p-3 mb-2 border border-green-100">
              <p class="text-xs font-bold text-green-700 mb-2">LIC {i + 1}</p>
              {#each [
                ['Policy Name',     lbl(lic.policy_name)],
                ['Policy Type',     lbl(lic.policy_type)],
                ['Receipt No',      lbl(lic.policy_receipt_no)],
                ['Surrender Value', formatCurrency(lic.policy_surrender_value)],
                ['Start Date',      formatDate(lic.policy_start_date)],
                ['Maturity Date',   formatDate(lic.policy_maturity_date)],
              ] as [l, v]}
                <div class="flex gap-2 py-0.5">
                  <span class="text-xs text-gray-500 w-28 flex-shrink-0">{l}</span>
                  <span class="text-xs font-semibold text-gray-800">{v}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}

      <!-- Govt Employees -->
      {#if collateral.govtEmployees?.length}
        <div>
          <p class="text-xs font-bold text-amber-700 uppercase mb-2">Govt. Employee</p>
          {#each collateral.govtEmployees as govt, i}
            <div class="bg-amber-50 rounded-lg p-3 mb-2 border border-amber-100">
              <p class="text-xs font-bold text-amber-700 mb-2">Govt Employee {i + 1}</p>
              {#each [
                ['Department',   lbl(govt.department_office_name)],
                ['Designation',  lbl(govt.designation)],
                ['Employee ID',  lbl(govt.employee_id_number)],
                ['Retirement',   formatDate(govt.date_of_retirement)],
                ['Permanent',    govt.permanent_government_employee ? 'Yes' : 'No'],
              ] as [l, v]}
                <div class="flex gap-2 py-0.5">
                  <span class="text-xs text-gray-500 w-28 flex-shrink-0">{l}</span>
                  <span class="text-xs font-semibold text-gray-800">{v}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}

      {#if !collateral.properties?.length && !collateral.fds?.length && !collateral.lics?.length && !collateral.govtEmployees?.length}
        <p class="text-sm text-gray-400 text-center py-6">No collateral data available</p>
      {/if}

    {:else}
      <p class="text-sm text-gray-400 text-center py-6">No collateral data available</p>
    {/if}
  </div>
</div>