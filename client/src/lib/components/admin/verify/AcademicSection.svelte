<script>
  export let education = null;
  function lbl(val) { return val || '—'; }
  function formatCurrency(val) {
    if (!val) return '—';
    return '₹' + Number(val).toLocaleString('en-IN');
  }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="bg-purple-700 px-4 py-2.5">
    <h3 class="text-white font-bold text-xs uppercase tracking-widest">🎓 Academic & Educational</h3>
  </div>
  <div class="p-4">
    {#if education}
      {#each [
        ['Student Name',   lbl(education.student_name)],
        ['Course Name',    lbl(education.course_name)],
        ['Course Type',    lbl(education.course_type)],
        ['Duration',       `${lbl(education.course_duration)} Years`],
        ['Mode of Study',  lbl(education.mode_of_study)],
        ['Purpose',        lbl(education.purpose_of_loan)],
        ['University',     lbl(education.university)],
        ['Admission Status',lbl(education.admission_status)],
        ['Admission Year', lbl(education.admission_year)],
      ] as [l, v]}
        <div class="flex items-baseline gap-2 py-1.5 border-b border-dotted border-gray-100">
          <span class="text-xs text-gray-500 w-36 flex-shrink-0">{l}</span>
          <span class="text-xs font-semibold text-gray-800 break-words">{v || '—'}</span>
        </div>
      {/each}

      <!-- Institution full width -->
      <div class="mt-2 pt-2 border-t border-gray-100">
        <p class="text-xs text-gray-500 mb-1 font-medium">Institution Name</p>
        <p class="text-xs font-semibold text-gray-800">{lbl(education.institution_name)}</p>
      </div>

      <!-- Fee breakdown -->
      <div class="mt-3 grid grid-cols-2 gap-2">
        {#each [
          ['Total Fee',   formatCurrency(education.total_course_fee),     'text-gray-900'],
          ['Fee Paid',    formatCurrency(education.fee_paid),             'text-blue-700'],
          ['Remaining',   formatCurrency(education.remaining_fee),        'text-red-600'],
          ['Loan Amount', formatCurrency(education.loan_required_amount), 'text-purple-700'],
        ] as [l, v, color]}
          <div class="bg-gray-50 rounded-lg p-2">
            <p class="text-[10px] text-gray-500">{l}</p>
            <p class="text-xs font-bold {color} mt-0.5">{v}</p>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-sm text-gray-400 text-center py-6">No academic data available</p>
    {/if}
  </div>
</div>