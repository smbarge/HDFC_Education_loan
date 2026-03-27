<script>
  import { goto } from '$app/navigation';
  export let locale;
  export let t;
  export let submissionInfo = null;
  export let applicationId;
  export let userData;

  const loanPurposeMap = {
    '1': 'Graduation',
    '2': 'Post Graduation',
    '3': 'Diploma',
    '4': 'Professional Course',
    '5': 'Technical Course',
    '6': 'Medical Course',
    '7': 'Study Abroad',
    '8': 'Other'
  };

  $: status = submissionInfo?.status || '';
$: step2Done     = ['under-review','approved','rejected','sanctioned','disbursed'].includes(status);
$: step3Approved = ['approved','sanctioned','disbursed'].includes(status);
$: step3Rejected = status === 'rejected';
</script>

<div class="w-full">
  <div class="mb-6 bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">

    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-5 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div>
          <h3 class="text-white font-bold text-xl">{t.dashboard.applicationSubmitted}</h3>
          <p class="text-green-100 text-sm mt-1">{t.dashboard.applicationReceived}</p>
        </div>
      </div>
      <button
        on:click={() => goto(`/${locale}/application/view-application`)}
        class="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        {t.dashboard.viewApplication}
      </button>
    </div>

    <!-- Status Badge -->
     <!-- Status Badge -->
<div class="px-6 py-3 {
  step3Approved ? 'bg-green-50' :
  step3Rejected ? 'bg-red-50' :
  step2Done     ? 'bg-blue-50' : 'bg-green-50'
} border-b border-green-100 flex items-center justify-center gap-2">
  <div class="w-2.5 h-2.5 rounded-full {
    step3Approved ? 'bg-green-500' :
    step3Rejected ? 'bg-red-500' :
    step2Done     ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-pulse'
  }"></div>
  <span class="text-sm font-semibold {
    step3Approved ? 'text-green-700' :
    step3Rejected ? 'text-red-700' :
    step2Done     ? 'text-blue-700' : 'text-green-700'
  }">
    Status: {submissionInfo?.statusLabel || 'Submitted'}
  </span>
</div>

    <!-- Info Cards -->
    <div class="p-6 grid grid-cols-2 gap-4">
      <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <p class="text-xs text-gray-500 font-medium">{t.dashboard.applicant}</p>
        </div>
        <p class="font-bold text-gray-800 text-sm">{submissionInfo?.applicantName || userData?.name || 'N/A'}</p>
      </div>

      <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-xs text-gray-500 font-medium">{t.dashboard.applicationId}</p>
        </div>
        <p class="font-bold text-blue-600 text-sm">#{submissionInfo?.applicationId || applicationId}</p>
      </div>

      <div class="bg-green-50 rounded-xl p-4 border border-green-100">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055"/>
            </svg>
          </div>
          <p class="text-xs text-gray-500 font-medium">{t.dashboard.educationPurpose}</p>
        </div>
        <p class="font-bold text-gray-800 text-sm">
          {submissionInfo ? (loanPurposeMap[String(submissionInfo.purposeOfLoan)] || 'N/A') : 'N/A'}
        </p>
      </div>

      <div class="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-xs text-gray-500 font-medium">{t.dashboard.loanAmount}</p>
        </div>
        <p class="font-bold text-gray-800 text-sm">
          {submissionInfo?.loanAmount ? '₹' + Number(submissionInfo.loanAmount).toLocaleString('en-IN') : 'N/A'}
        </p>
      </div>
    </div>

    <!-- Application Timeline -->
   <!-- Application Timeline -->
<div class="px-6 pb-6">
  <h4 class="text-sm font-bold text-gray-700 mb-4">{t.dashboard.applicationTrack}</h4>
  <div class="relative">
    <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

    <!-- Step 1 — Submitted (always green) -->
    <div class="relative flex items-start gap-4 mb-5">
      <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 z-10">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div class="pt-1">
        <p class="text-sm font-semibold text-green-700">{t.dashboard.applicationSubmitted}</p>
        <p class="text-xs text-gray-500">{t.dashboard.successfullySubmitted || 'Successfully Submitted'}</p>
      </div>
    </div>

    <!-- Step 2 — Under Review -->
    <div class="relative flex items-start gap-4 mb-5">
      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
        {step2Done ? 'bg-blue-500' : 'bg-gray-200'}">
        <svg class="w-4 h-4 {step2Done ? 'text-white' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <div class="pt-1">
        <p class="text-sm font-semibold {step2Done ? 'text-blue-700' : 'text-gray-400'}">
          {t.dashboard.UnderReview}
        </p>
        <p class="text-xs text-gray-500">{t.dashboard.reviewMessage}</p>
      </div>
    </div>

    <!-- Step 3 — Approved / Rejected / Pending -->
    <div class="relative flex items-start gap-4">
      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
        {step3Approved ? 'bg-green-500' : step3Rejected ? 'bg-red-500' : 'bg-gray-200'}">
        {#if step3Approved}
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        {:else if step3Rejected}
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        {:else}
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        {/if}
      </div>
      <div class="pt-1">
        <p class="text-sm font-semibold
          {step3Approved ? 'text-green-700' : step3Rejected ? 'text-red-700' : 'text-gray-400'}">
          {step3Approved ? (submissionInfo?.statusLabel || 'Approved') :
           step3Rejected ? 'Application Rejected' :
           t.dashboard.approvedRejected}
        </p>
        <p class="text-xs text-gray-500">
          {step3Approved ? 'Your application has been approved.' :
           step3Rejected ? 'Contact support for more information.' :
           t.dashboard.decisionPending}
        </p>
      </div>
    </div>

  </div>
</div>

  </div>
</div>