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

  let adminUser = null;
let district = '';
let t = {};


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

  function handleLogout() {
  localStorage.removeItem('adminToken');
  goto(`/${locale}/admin/login`);
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

  onMount(async () => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) { goto(`/${locale}/admin/login`); return; }

  // Add this:
  adminUser = { username: localStorage.getItem('adminUsername') || 'Admin' };
  district = localStorage.getItem('adminDistrict') || '';

  // ... rest of your existing onMount code
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

   <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
    <div class="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between gap-2">
      <!-- Logo + Title -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        <div class="flex-shrink-0">
          <img src="/MaulanaAzad.jpg" alt="MAMFDC Logo" class="h-8 sm:h-10 md:h-12 lg:h-[70px] w-auto object-contain"/>
        </div>
        <div class="leading-tight min-w-0 flex-1">
          <h1 class="text-xs sm:text-sm md:text-base lg:text-xl font-semibold text-gray-900 truncate">
            {t?.header?.title || 'MAMFDC'}
          </h1>
          <p class="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 truncate">
            {t?.header?.subtitle || 'A Govt. of Maharashtra Undertaking'}
          </p>
        </div>
      </div>

      <!-- Right: language + user + logout -->
      <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
        <!-- Language switcher -->
        <div class="hidden sm:flex items-center gap-0.5 sm:gap-1">
          {#each [['en','English'],['hi','हिंदी'],['mr','मराठी']] as [code, label]}
            <button
              on:click={() => goto(`/${code}/admin/dashboard`)}
              class="px-2 sm:px-2.5 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md text-xs font-medium transition-colors
                {locale === code ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
            >{label}</button>
          {/each}
        </div>

        <!-- Admin badge + district -->
        {#if adminUser}
          <div class="hidden md:flex items-center gap-2 px-2 lg:px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
            <div class="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {adminUser.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-xs lg:text-sm font-medium text-purple-700 truncate">{adminUser.username}</span>
              {#if district}
                <span class="text-[10px] lg:text-xs text-purple-500 font-medium truncate">📍 {district} District</span>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Logout -->
        <button
          on:click={handleLogout}
          class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
        >
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>  

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
  <div class="flex items-center flex-1 overflow-x-auto py-2 ml-[20%]">
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
    <!-- Back to Dashboard -->
  <button
    on:click={() => goto(`/${locale}/admin/dashboard`)}
    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors flex-shrink-0 whitespace-nowrap"
  >
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
    </svg>
    Back to Dashboard
  </button>
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