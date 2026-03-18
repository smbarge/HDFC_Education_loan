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

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Collateral / Study Abroad</h3>
  </div>
  <div class="p-3 space-y-4">
    {#if collateral}

      {#if collateral.properties?.length}
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Properties</p>
          {#each collateral.properties as prop, i}
            <div class="border border-gray-100 rounded p-2.5 mb-2 bg-gray-50">
              <p class="text-xs font-semibold text-gray-500 mb-1.5">Property {i + 1}</p>
              <table class="w-full text-sm">
                <tbody>
                  {#each [
                    ['Survey No', lbl(prop.survey_no)],
                    ['District',  lbl(prop.district_id)],
                    ['Place',     lbl(prop.place)],
                    ['Units',     lbl(prop.units)],
                    ['Area',      lbl(prop.area_value)],
                    ['Valuation', formatCurrency(prop.property_value)],
                  ] as [l, v]}
                    <tr class="border-b border-gray-100 last:border-0">
                      <td class="py-1 pr-3 text-gray-400 w-24">{l}</td>
                      <td class="py-1 text-gray-800 font-medium">{v}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/each}
        </div>
      {/if}

      {#if collateral.fds?.length}
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Fixed Deposits</p>
          {#each collateral.fds as fd, i}
            <div class="border border-gray-100 rounded p-2.5 mb-2 bg-gray-50">
              <p class="text-xs font-semibold text-gray-500 mb-1.5">FD {i + 1}</p>
              <table class="w-full text-sm">
                <tbody>
                  {#each [
                    ['Bank Name',     lbl(fd.bank_name)],
                    ['Branch',        lbl(fd.branch_name)],
                    ['FD Acc No',     lbl(fd.fd_acc_no)],
                    ['Amount',        formatCurrency(fd.amount)],
                    ['Start Date',    formatDate(fd.fd_start_date)],
                    ['Maturity Date', formatDate(fd.fd_maturity_date)],
                    ['Interest Rate', fd.interest_rate ? `${fd.interest_rate}%` : '—'],
                  ] as [l, v]}
                    <tr class="border-b border-gray-100 last:border-0">
                      <td class="py-1 pr-3 text-gray-400 w-28">{l}</td>
                      <td class="py-1 text-gray-800 font-medium">{v}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/each}
        </div>
      {/if}

      {#if collateral.lics?.length}
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-1.5">LIC Policies</p>
          {#each collateral.lics as lic, i}
            <div class="border border-gray-100 rounded p-2.5 mb-2 bg-gray-50">
              <p class="text-xs font-semibold text-gray-500 mb-1.5">LIC {i + 1}</p>
              <table class="w-full text-sm">
                <tbody>
                  {#each [
                    ['Policy Name',     lbl(lic.policy_name)],
                    ['Policy Type',     lbl(lic.policy_type)],
                    ['Receipt No',      lbl(lic.policy_receipt_no)],
                    ['Surrender Value', formatCurrency(lic.policy_surrender_value)],
                    ['Start Date',      formatDate(lic.policy_start_date)],
                    ['Maturity Date',   formatDate(lic.policy_maturity_date)],
                  ] as [l, v]}
                    <tr class="border-b border-gray-100 last:border-0">
                      <td class="py-1 pr-3 text-gray-400 w-28">{l}</td>
                      <td class="py-1 text-gray-800 font-medium">{v}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/each}
        </div>
      {/if}

      {#if collateral.govtEmployees?.length}
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Govt. Employee</p>
          {#each collateral.govtEmployees as govt, i}
            <div class="border border-gray-100 rounded p-2.5 mb-2 bg-gray-50">
              <p class="text-xs font-semibold text-gray-500 mb-1.5">Govt Employee {i + 1}</p>
              <table class="w-full text-sm">
                <tbody>
                  {#each [
                    ['Department',  lbl(govt.department_office_name)],
                    ['Designation', lbl(govt.designation)],
                    ['Employee ID', lbl(govt.employee_id_number)],
                    ['Retirement',  formatDate(govt.date_of_retirement)],
                    ['Permanent',   govt.permanent_government_employee ? 'Yes' : 'No'],
                  ] as [l, v]}
                    <tr class="border-b border-gray-100 last:border-0">
                      <td class="py-1 pr-3 text-gray-400 w-28">{l}</td>
                      <td class="py-1 text-gray-800 font-medium">{v}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/each}
        </div>
      {/if}

      {#if !collateral.properties?.length && !collateral.fds?.length && !collateral.lics?.length && !collateral.govtEmployees?.length}
        <p class="text-sm text-gray-400 text-center py-8">No collateral data</p>
      {/if}

    {:else}
      <p class="text-sm text-gray-400 text-center py-8">No collateral data</p>
    {/if}
  </div>
</div>