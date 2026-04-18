<script>
  import { goto } from '$app/navigation';
  import { getRejectionDetails } from '$lib/api/authApi';
  import { user } from '$lib/stores/userStore';
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';

  export let locale;
  export let t;
  export let submissionInfo = null;
  export let applicationId;
  export let userData;

  let adminDisplayName = 'NA';

  onMount(async () => {
    if (status === 'rejected' && applicationId) {
      try {
        const userId = get(user)?.id;
        const result = await getRejectionDetails(userId, applicationId);
        if (result.error === 0 && result.data) {
          adminDisplayName = result.data.adminDisplayName || 'NA';
        }
      } catch (e) {
        console.error('Failed to load rejection details:', e);
      }
    }
  });

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

  let showStatusModal = false;
</script>

<div class="w-full px-4 md:px-6">

  <!-- PAGE HEADER (clean, not card-like) -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">

    <div>
      <h2 class="text-2xl font-bold text-gray-800">
        {t.dashboard.applicationSubmitted}
      </h2>
      <p class="text-gray-500 text-sm mt-1">
        {t.dashboard.applicationReceived}
      </p>
    </div>

    <div class="flex gap-2">
      <button
        on:click={() => goto(`/${locale}/application/view-application`)}
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
      >
        {t.dashboard.viewApplication}
      </button>

      <button
        on:click={() => showStatusModal = true}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        Application Status
      </button>
    </div>
  </div>

  <!-- STATUS STRIP -->
  <div class="mb-6 flex items-center gap-2">
    <div class="w-2.5 h-2.5 rounded-full
      {step3Approved ? 'bg-green-500' :
       step3Rejected ? 'bg-red-500' :
       step2Done ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}">
    </div>

    <p class="text-sm font-medium
      {step3Approved ? 'text-green-700' :
       step3Rejected ? 'text-red-700' :
       step2Done ? 'text-blue-700' : 'text-gray-600'}">
      {submissionInfo?.statusLabel || 'Submitted'}
    </p>
  </div>

  <!-- INFO GRID (MAIN CONTENT STYLE) -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

    <!-- Applicant -->
    <div class="bg-white p-5 rounded-xl border hover:shadow-md transition">
      <p class="text-xs text-gray-500 mb-1">{t.dashboard.applicant}</p>
      <p class="font-semibold text-gray-800">
        {submissionInfo?.applicantName || userData?.name || 'N/A'}
      </p>
    </div>

    <!-- Application ID -->
    <div class="bg-white p-5 rounded-xl border hover:shadow-md transition">
      <p class="text-xs text-gray-500 mb-1">{t.dashboard.applicationId}</p>
      <p class="font-semibold text-blue-600">
        #{submissionInfo?.applicationId || applicationId}
      </p>
    </div>

    <!-- Education -->
    <div class="bg-white p-5 rounded-xl border hover:shadow-md transition">
      <p class="text-xs text-gray-500 mb-1">{t.dashboard.educationPurpose}</p>
      <p class="font-semibold text-gray-800">
        {submissionInfo
          ? (loanPurposeMap[String(submissionInfo.purposeOfLoan)] || 'N/A')
          : 'N/A'}
      </p>
    </div>

    <!-- Amount -->
    <div class="bg-white p-5 rounded-xl border hover:shadow-md transition">
      <p class="text-xs text-gray-500 mb-1">{t.dashboard.loanAmount}</p>
      <p class="font-semibold text-gray-800">
        {submissionInfo?.loanAmount
          ? '₹' + Number(submissionInfo.loanAmount).toLocaleString('en-IN')
          : 'N/A'}
      </p>
    </div>

  </div>

</div>


<!--  APPLICATION STATUS MODAL  (separate, self-contained)        -->
{#if showStatusModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 "
    on:click|self={() => showStatusModal = false}
  >
   <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col md:h-auto h-[90vh]">

  <!-- Header -->
  <div class="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4 flex items-center justify-between">
    <div>
      <h3 class="text-white font-bold text-lg">Application Status</h3>
      <p class="text-blue-100 text-xs">Track your loan application</p>
    </div>

    <button
      on:click={() => showStatusModal = false}
      class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
    >
      ✕
    </button>
  </div>

  <!-- BODY -->
  <div class="md:grid md:grid-cols-3 md:gap-6 p-6 flex-1 overflow-y-auto md:overflow-visible">

    <!-- LEFT SIDE (INFO CARDS) -->
    <div class="grid grid-cols-2 gap-4 md:col-span-1">

      <div class="bg-purple-50 p-4 rounded-xl border">
        <p class="text-xs text-gray-500">{t.dashboard.applicant}</p>
        <p class="font-bold text-sm">{submissionInfo?.applicantName || userData?.name || 'N/A'}</p>
      </div>

      <div class="bg-blue-50 p-4 rounded-xl border">
        <p class="text-xs text-gray-500">{t.dashboard.applicationId}</p>
        <p class="font-bold text-blue-600 text-sm">#{submissionInfo?.applicationId || applicationId}</p>
      </div>

      <div class="bg-green-50 p-4 rounded-xl border">
        <p class="text-xs text-gray-500">{t.dashboard.educationPurpose}</p>
        <p class="font-bold text-sm">
          {submissionInfo ? (loanPurposeMap[String(submissionInfo.purposeOfLoan)] || 'N/A') : 'N/A'}
        </p>
      </div>

      <div class="bg-yellow-50 p-4 rounded-xl border">
        <p class="text-xs text-gray-500">{t.dashboard.loanAmount}</p>
        <p class="font-bold text-sm">
          {submissionInfo?.loanAmount ? '₹' + Number(submissionInfo.loanAmount).toLocaleString('en-IN') : 'N/A'}
        </p>
      </div>

    </div>

    <!-- CENTER (TIMELINE) -->
    <div class="md:col-span-1">
      <h4 class="font-bold text-gray-700 mb-4">{t.dashboard.applicationTrack}</h4>

      <div class="space-y-6">

        <!-- Step 1 -->
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
          <div>
            <p class="font-semibold text-green-700 text-sm">Submitted</p>
            <p class="text-xs text-gray-500">Successfully submitted</p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center
            {step2Done ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}">
            🔍
          </div>
          <div>
            <p class="font-semibold text-sm {step2Done ? 'text-blue-700' : 'text-gray-400'}">
              Under Review
            </p>
            <p class="text-xs text-gray-500">{t.dashboard.reviewMessage}</p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center
            {step3Approved ? 'bg-green-500 text-white' :
             step3Rejected ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}">
            {step3Approved ? '✓' : step3Rejected ? '✕' : '•'}
          </div>

          <div>
            <p class="font-semibold text-sm
              {step3Approved ? 'text-green-700' :
               step3Rejected ? 'text-red-700' : 'text-gray-400'}">
              {step3Approved ? 'Approved' :
               step3Rejected ? 'Rejected' : 'Pending'}
            </p>

            <p class="text-xs text-gray-500">
              {step3Approved ? 'Application approved' :
               step3Rejected ? `Reviewed by ${adminDisplayName}` : 'Waiting decision'}

            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- RIGHT SIDE (REJECT / ACTION PANEL) -->
    <div class="md:col-span-1 flex flex-col justify-between">
        {#if step3Rejected}
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">

            <!-- Title -->
            <div>
              <p class="font-bold text-red-700 text-sm">Application Rejected</p>
              <p class="text-xs text-red-500 mt-0.5">Your application requires corrections</p>
            </div>

            <!-- Reviewed by -->
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5"/>
              </svg>
              Reviewed by {adminDisplayName} Office
            </div>

            <!-- Divider -->
            <div class="border-t border-red-200"></div>

            <!-- Instruction text -->
            <p class="text-xs text-gray-600 leading-relaxed">
              The documents listed below were flagged during verification. Re-upload each document, then click "Re-Submit Application".
            </p>

            <!-- Re-Submit button -->
            <button
              on:click={() => {
                showStatusModal = false;
                 goto(`/${locale}/application/resubmit`);
              }}
              class="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors"
            >
              Re-Submit Application
            </button>

          </div>
      {:else}
        <div class="bg-green-50 border rounded-xl p-4">
          <p class="font-semibold text-green-700 text-sm">
            {step3Approved ? 'Approved 🎉' : 'In Progress'}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {step3Approved ? 'Funds will be processed soon' : 'Please wait for review'}
          </p>
        </div>
      {/if}

    </div>

  </div>

  <!-- Footer -->
  <div class="px-6 py-3 border-t">
    <button
      on:click={() => showStatusModal = false}
      class="w-full py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm"
    >
      Close
    </button>
  </div>

</div>
  </div>
{/if}