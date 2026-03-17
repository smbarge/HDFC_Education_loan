<script>
  export let education = null;
  function lbl(val) { return val || '—'; }
  function formatCurrency(val) {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Academic & Educational</h3>
  </div>
  <div class="p-3">
    {#if education}
      <table class="w-full text-sm">
        <tbody>
          {#each [
            ['Student Name',    lbl(education.student_name)],
            ['Course Name',     lbl(education.course_name)],
            ['Course Type',     lbl(education.course_type)],
            ['Duration',        `${lbl(education.course_duration)} Years`],
            ['Mode of Study',   lbl(education.mode_of_study)],
            ['Purpose',         lbl(education.purpose_of_loan)],
            ['University',      lbl(education.university)],
            ['Admission Status',lbl(education.admission_status)],
            ['Admission Year',  lbl(education.admission_year)],
          ] as [l, v]}
            <tr class="border-b border-gray-50 last:border-0">
              <td class="py-1.5 pr-3 text-gray-400 whitespace-nowrap w-36">{l}</td>
              <td class="py-1.5 text-gray-800 font-medium break-words">{v}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div class="mt-3 pt-3 border-t border-gray-100">
        <p class="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Institution Name</p>
        <p class="text-sm text-gray-700 font-medium">{lbl(education.institution_name)}</p>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        {#each [
          ['Total Fee',   formatCurrency(education.total_course_fee),     'text-gray-800'],
          ['Fee Paid',    formatCurrency(education.fee_paid),             'text-blue-700'],
          ['Remaining',   formatCurrency(education.remaining_fee),        'text-red-600'],
          ['Loan Amount', formatCurrency(education.loan_required_amount), 'text-green-700'],
        ] as [l, v, color]}
          <div class="bg-gray-50 rounded border border-gray-100 p-2">
            <p class="text-xs text-gray-400">{l}</p>
            <p class="text-sm font-bold {color} mt-0.5">{v}</p>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-sm text-gray-400 text-center py-8">No academic data</p>
    {/if}
  </div>
</div>