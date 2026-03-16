<script>
  // @ts-nocheck
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getViewApplicationData } from '$lib/api/authApi.js';

  import PersonalSection   from '$lib/components/admin/verify/PersonalSection.svelte';
  import AcademicSection   from '$lib/components/admin/verify/AcademicSection.svelte';
  import FamilySection     from '$lib/components/admin/verify/FamilySection.svelte';
  import BankSection       from '$lib/components/admin/verify/BankSection.svelte';
  import GuarantorSection  from '$lib/components/admin/verify/GuarantorSection.svelte';
  import CollateralSection from '$lib/components/admin/verify/CollateralSection.svelte';
  import DocumentList      from '$lib/components/admin/verify/DocumentList.svelte';

  $: locale = $page.params.locale || 'en';

  let isLoading = true;
  let appData = null;
  let error = null;
  let appId = null;
  let applicantName = '';
  let formNo = '';
  let activeTab = 'personal';

  let sectionStatus = {
    personal: 'pending', academic: 'pending', family: 'pending',
    bank: 'pending', guarantor: 'pending', collateral: 'pending',
  };

  let docVerification = {};

  const tabs = [
    { key: 'personal',   label: '1. Personal & Identity',        icon: '👤' },
    { key: 'academic',   label: '2. Academic & Educational',     icon: '🎓' },
    { key: 'family',     label: '3. Family & Income',            icon: '👨‍👩‍👧' },
    { key: 'bank',       label: '4. Bank Documents',             icon: '🏦' },
    { key: 'guarantor',  label: '5. Co-Applicant & Guarantor',   icon: '🤝' },
    { key: 'collateral', label: '6. Collateral / Study Abroad',  icon: '🏠' },
  ];

  // Map tabs to section_id from your m_upload_docs.upload_for
  const tabSectionIds = {
    personal:   [1, 2, 3, 4, 5],
    academic:   [11],
    family:     [6],
    bank:       [1, 2, 3, 4, 5],
    guarantor:  [12],
    collateral: [7, 8, 9, 10],
  };

  function getDocsForTab(tab) {
    if (!appData?.allDocs) return [];
    const ids = tabSectionIds[tab] || [];
    if (ids.length === 0) return appData.allDocs;
    return appData.allDocs.filter(d => ids.includes(d.section_id));
  }

  // Get all docs if tab-specific returns empty
  $: currentDocs = (() => {
    const specific = getDocsForTab(activeTab);
    return specific.length > 0 ? specific : (appData?.allDocs || []);
  })();

  function verifyDoc(docId) {
    docVerification[docId] = 'verified';
    docVerification = { ...docVerification };
  }
  function rejectDoc(docId) {
    docVerification[docId] = 'rejected';
    docVerification = { ...docVerification };
  }
  function resetDoc(docId) {
    docVerification[docId] = 'pending';
    docVerification = { ...docVerification };
  }
  function verifySection(tab) {
    sectionStatus[tab] = 'verified';
    sectionStatus = { ...sectionStatus };
    // also verify all docs in this section
    currentDocs.forEach(d => { docVerification[d.document_id] = 'verified'; });
    docVerification = { ...docVerification };
  }
  function rejectSection(tab) {
    sectionStatus[tab] = 'rejected';
    sectionStatus = { ...sectionStatus };
  }

  $: totalDocs = appData?.allDocs?.length || 0;
  $: verifiedDocs = Object.values(docVerification).filter(v => v === 'verified').length;
  $: rejectedDocs = Object.values(docVerification).filter(v => v === 'rejected').length;
  $: progressPct = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

  onMount(async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) { goto(`/${locale}/admin/login`); return; }

    appId         = $page.url.searchParams.get('appId');
    applicantName = $page.url.searchParams.get('name') || '';
    formNo        = $page.url.searchParams.get('formNo') || '';

    if (!appId) { error = 'No application ID provided.'; isLoading = false; return; }

    localStorage.setItem('accessToken', adminToken);

    try {
      const result = await getViewApplicationData(0, appId);
      if (result.error !== 0) {
        error = result.errorMsg || 'Failed to load application';
      } else {
        appData = result.data;
        (appData.allDocs || []).forEach(doc => {
          docVerification[doc.document_id] = 'pending';
        });
      }
    } catch (e) {
      error = 'Failed to load application data';
    } finally {
      isLoading = false;
    }
  });

  async function handleFinalApprove() {
    const adminToken = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'updateStatus', id: appId, status: 'Approved' })
      });
      const result = await res.json();
      if (result.error === 0) { alert('Application approved!'); window.close(); }
    } catch {}
  }
</script>

<svelte:head><title>Verify Application — Admin</title></svelte:head>

<div class="min-h-screen bg-gray-100">

  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/MaulanaAzad.jpg" alt="MAMFDC Logo" class="h-10 w-auto object-contain"/>
        <div>
          <h1 class="text-sm font-semibold text-gray-900">Document Verification</h1>
          <p class="text-xs text-gray-500">
            {#if applicantName}<span class="font-medium text-purple-700">{applicantName}</span> · {/if}
            Form: <span class="font-medium">{formNo || appId}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- Progress -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
          <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-purple-600 rounded-full transition-all duration-300" style="width: {progressPct}%"></div>
          </div>
          <span class="text-xs font-semibold text-purple-700">{verifiedDocs}/{totalDocs} docs</span>
        </div>
        <button on:click={() => window.close()}
          class="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Close
        </button>
      </div>
    </div>
  </header>

  {#if isLoading}
    <div class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-3">
        <svg class="animate-spin h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p class="text-gray-500 text-sm">Loading application data...</p>
      </div>
    </div>

  {:else if error}
    <div class="max-w-xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700">{error}</div>

  {:else if appData}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-5">

      <!-- Applicant Summary -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-4">
              {#if appData.documents?.photo}
                <img src={appData.documents.photo} alt="Photo"
                  class="w-14 h-16 object-cover border-2 border-purple-300 rounded-lg flex-shrink-0"/>
              {:else}
                <div class="w-14 h-16 border-2 border-dashed border-purple-300 rounded-lg bg-purple-800 flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              {/if}
              <div>
                <h2 class="text-white text-lg font-bold">{appData.personal?.name || '—'}</h2>
                <div class="flex flex-wrap gap-3 mt-1">
                  <span class="text-purple-200 text-xs">📱 {appData.personal?.mobile || '—'}</span>
                  <span class="text-purple-200 text-xs">🏛️ <span class="text-white font-semibold">{formNo || appId}</span></span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="bg-purple-800 rounded-lg px-3 py-2 text-center min-w-[60px]">
                <p class="text-purple-300 text-[10px]">Total</p>
                <p class="text-white font-bold text-lg">{totalDocs}</p>
              </div>
              <div class="bg-green-700 rounded-lg px-3 py-2 text-center min-w-[60px]">
                <p class="text-green-200 text-[10px]">Verified</p>
                <p class="text-white font-bold text-lg">{verifiedDocs}</p>
              </div>
              <div class="bg-red-700 rounded-lg px-3 py-2 text-center min-w-[60px]">
                <p class="text-red-200 text-[10px]">Rejected</p>
                <p class="text-white font-bold text-lg">{rejectedDocs}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Tabs -->
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 overflow-x-auto">
          <div class="flex items-center gap-1.5 min-w-max">
            {#each tabs as tab, idx}
              <button
                on:click={() => activeTab = tab.key}
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                  {activeTab === tab.key ? 'bg-purple-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-300'}"
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {#if sectionStatus[tab.key] === 'verified'}
                  <span class="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                {:else if sectionStatus[tab.key] === 'rejected'}
                  <span class="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] font-bold">✕</span>
                {:else}
                  <span class="w-3 h-3 rounded-full border-2 border-gray-300"></span>
                {/if}
              </button>
              {#if idx < tabs.length - 1}
                <svg class="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <!-- Two Column: Info + Documents -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">

        <!-- Left: Section Info Component -->
        <div class="lg:col-span-2">
          {#if activeTab === 'personal'}
            <PersonalSection personal={appData.personal} />
          {:else if activeTab === 'academic'}
            <AcademicSection education={appData.education} />
          {:else if activeTab === 'family'}
            <FamilySection personal={appData.personal} />
          {:else if activeTab === 'bank'}
            <BankSection education={appData.education} />
          {:else if activeTab === 'guarantor'}
            <GuarantorSection guarantor={appData.guarantor} />
          {:else if activeTab === 'collateral'}
            <CollateralSection collateral={appData.collateral} />
          {/if}
        </div>

        <!-- Right: Document List Component -->
        <div class="lg:col-span-3">
          <DocumentList
            docs={currentDocs}
            {docVerification}
            sectionStatus={sectionStatus[activeTab]}
            sectionLabel={tabs.find(t => t.key === activeTab)?.label || ''}
            on:verify={(e) => verifyDoc(e.detail)}
            on:reject={(e) => rejectDoc(e.detail)}
            on:reset={(e) => resetDoc(e.detail)}
            on:verifySection={() => verifySection(activeTab)}
            on:rejectSection={() => rejectSection(activeTab)}
          />
        </div>
      </div>

      <!-- Final Decision Bar -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-bold text-gray-800">Final Verification Decision</h3>
            <p class="text-xs text-gray-500 mt-0.5">
              {verifiedDocs}/{totalDocs} documents verified ·
              {Object.values(sectionStatus).filter(s => s === 'verified').length}/{tabs.length} sections cleared
            </p>
            <!-- Overall progress bar -->
            <div class="flex items-center gap-2 mt-2">
              <div class="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-purple-600 rounded-full transition-all duration-300" style="width: {progressPct}%"></div>
              </div>
              <span class="text-xs font-semibold text-purple-700">{progressPct}%</span>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              class="flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 font-semibold rounded-lg text-sm transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Reject Application
            </button>
            <button
              on:click={handleFinalApprove}
              class="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm shadow transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              Approve Application
            </button>
          </div>
        </div>
      </div>

    </div>
  {/if}
</div>