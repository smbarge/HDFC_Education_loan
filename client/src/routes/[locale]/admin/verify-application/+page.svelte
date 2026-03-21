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
  import Header from '$lib/components/landingpage/Header.svelte';

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
  let checkpointsByDoc = {};


  const tabs = [
    { key: 'personal',   label: 'Personal'   },
    { key: 'academic',   label: 'Academic'   },
    { key: 'family',     label: 'Family'     },
    { key: 'bank',       label: 'Bank'       },
    { key: 'guarantor',  label: 'Guarantor'  },
    { key: 'collateral', label: 'Collateral' },
  ];

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
    currentDocs.forEach(d => { docVerification[d.document_id] = 'verified'; });
    docVerification = { ...docVerification };
  }

  function rejectSection(tab) {
    sectionStatus[tab] = 'rejected';
    sectionStatus = { ...sectionStatus };
  }

  $: totalDocs     = appData?.allDocs?.length || 0;
  $: verifiedDocs  = Object.values(docVerification).filter(v => v === 'verified').length;
  $: rejectedDocs  = Object.values(docVerification).filter(v => v === 'rejected').length;
  $: progressPct   = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

  onMount(async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) { goto(`/${locale}/admin/login`); return; }

    appId         = $page.url.searchParams.get('appId');
    applicantName = $page.url.searchParams.get('name') || '';
    formNo        = $page.url.searchParams.get('formNo') || '';

    if (!appId) { error = 'No application ID provided.'; isLoading = false; return; }

     localStorage.setItem('accessToken', adminToken);

    // Fetch checkpoints from backend
    try {
      const cpRes = await fetch('/api/admin/checkpoints', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
     const cpData = await cpRes.json();
      if (cpData.error === 0) {
        checkpointsByDoc = cpData.byDocument || {};
      }
    } catch (e) {
      console.error('Could not load checkpoints:', e);
    }

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

<div class="min-h-screen bg-gray-50">

  <Header/>

  {#if isLoading}
    <div class="flex items-center justify-center py-32 text-gray-400 text-base">
      Loading application…
    </div>

  {:else if error}
    <div class="max-w-xl mx-auto mt-10 bg-red-50 border border-red-200 rounded p-6 text-center text-red-600 text-base">{error}</div>

  {:else if appData}
    <div class="w-full px-4 py-4 space-y-4">

     <!-- Applicant bar -->
  <div class="bg-white rounded-lg border border-gray-200 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-6">

  <!-- Left: Applicant info -->
  <div class="flex items-center gap-3 flex-shrink-0">
    {#if appData.documents?.photo}
      <img src={appData.documents.photo} alt="Photo" class="w-10 h-12 object-cover rounded border border-gray-200 flex-shrink-0"/>
    {:else}
      <div class="w-10 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
    {/if}
    <div class="min-w-0">
      <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Document Verification</p>
      <p class="text-base font-bold text-gray-900">{appData.personal?.name || '—'}</p>
      <p class="text-sm text-gray-400">{appData.personal?.mobile || ''} · Form: <span class="text-gray-600 font-medium">{formNo || appId}</span></p>
    </div>
  </div>

  <!-- Divider -->
  <div class="hidden sm:block w-px self-stretch bg-gray-200 flex-shrink-0 ml-[5%]" ></div>

  <!-- Right: Step flow navigation -->
  <div class="flex items-center flex-1 overflow-x-auto py-2 ml-[25%]">
    {#each tabs as tab, i}
      <button
        on:click={() => activeTab = tab.key}
        class="flex flex-col items-center flex-shrink-0 group focus:outline-none px-2"
        style="min-width: 110px;"
      >
        <div class="flex items-center w-full">
          <!-- Left connector -->
          {#if i > 0}
            <div class="flex-1 h-1 min-w-[16px] rounded-full {sectionStatus[tabs[i-1].key] === 'verified' ? 'bg-blue-500' : 'bg-gray-200'}"></div>
          {:else}
            <div class="flex-1"></div>
          {/if}

          <!-- Circle -->
          <div class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all shadow-sm
            {activeTab === tab.key
              ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200'
              : sectionStatus[tab.key] === 'verified'
                ? 'bg-blue-500 border-blue-500 text-white'
                : sectionStatus[tab.key] === 'rejected'
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400 group-hover:border-blue-400'}"
          >
            {#if sectionStatus[tab.key] === 'verified'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            {:else if sectionStatus[tab.key] === 'rejected'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            {:else}
              <span class="text-sm font-bold">{i + 1}</span>
            {/if}
          </div>

          <!-- Right connector -->
          {#if i < tabs.length - 1}
            <div class="flex-1 h-1 min-w-[16px] rounded-full {sectionStatus[tab.key] === 'verified' ? 'bg-blue-500' : 'bg-gray-200'}"></div>
          {:else}
            <div class="flex-1"></div>
          {/if}
        </div>

        <!-- Label -->
        <span class="mt-2 text-xs sm:text-sm font-medium text-center leading-tight
          {activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}">
          {tab.label}
        </span>
      </button>
    {/each}
  </div>

</div>

      <!-- Two column layout: info left, docs right -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">

        <!-- Left: Section Info -->
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

        <!-- Right: Document List with inline viewer -->
        <div class="lg:col-span-3">
          <DocumentList
            docs={currentDocs}
            {docVerification}
            {checkpointsByDoc}
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
      
      <!-- Final decision bar -->
      <div class="bg-white rounded-lg border border-gray-200 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p class="text-base font-semibold text-gray-800">Final Decision</p>
          <p class="text-sm text-gray-400 mt-0.5">
            {verifiedDocs}/{totalDocs} docs verified ·
            {Object.values(sectionStatus).filter(s => s === 'verified').length}/{tabs.length} sections cleared
          </p>
          <div class="flex items-center gap-2 mt-2">
            <div class="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full transition-all" style="width: {progressPct}%"></div>
            </div>
            <span class="text-sm font-semibold text-gray-600">{progressPct}%</span>
          </div>
        </div>

        <div class="flex gap-3">


  <button
    on:click={() => {
      const currentIndex = tabs.findIndex(t => t.key === activeTab);
      if (currentIndex > 0) activeTab = tabs[currentIndex - 1].key;
    }}
    disabled={activeTab === tabs[0].key}
    class="px-5 py-2 text-base font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  >
    ← Previous
  </button>
  <button
    on:click={() => {
      const currentIndex = tabs.findIndex(t => t.key === activeTab);
      if (currentIndex < tabs.length - 1) activeTab = tabs[currentIndex + 1].key;
    }}
    disabled={activeTab === tabs[tabs.length - 1].key}
    class="px-6 py-2 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  >
    Next →
  </button>
</div>
      </div>

    </div>
  {/if}
</div>