<script>
  // @ts-nocheck
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

 import { getViewApplicationData } from '$lib/api/authApi.js';
  import { submitDecision, getCheckpoints } from '$lib/api/adminapi.js';
  import { token } from '$lib/stores/userStore';

  let showRemarkModal = false;
  let pendingDecision = '';
  let decisionRemark = '';
  let isSubmitting = false;

  function handleFinalDecision(decision) {
    pendingDecision = decision;
    showRemarkModal = true;
    decisionRemark = '';
  }

  async function confirmDecision() {
    if (!pendingDecision) return;
    isSubmitting = true;
    const adminToken = getCookie('adminToken') || localStorage.getItem('adminToken') || '';
    try {
      const result = await submitDecision(adminToken, {
        application_id: appId,
        decision: pendingDecision,
        remark: decisionRemark
      });
      if (result.error === 0) {
        showRemarkModal = false;
        alert(`Application ${pendingDecision}ed successfully!`);
        goto(`/${locale}/admin/dashboard`);
      } else {
        alert('Error: ' + (result.errorMsg || 'Failed'));
      }
    } catch (e) {
      alert('Error submitting decision');
    } finally {
      isSubmitting = false;
    }
  }

  import DocumentList from '$lib/components/admin/verify/DocumentList.svelte';

  $: locale = $page.params.locale || 'en';

  let adminUser = null;
  let district = '';
  let t = {};

  let isLoading = true;
  let appData = null;
  let masters = {};
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
  let checkpointAnswers = {};

  // Bound from DocumentList — which doc is selected
  let expandedDocId = null;
  let expandedDocUrl = null;
  let expandedDocName = '';

  const tabs = [
    { key: 'personal',   label: 'Personal & Identity Documents'   },
    { key: 'academic',   label: 'Educational & Banking Documents' },
    { key: 'guarantor',  label: 'Guarantor Documents'             },
    { key: 'collateral', label: 'Collateral Documents'            },
    { key: 'abroad',     label: 'Study Abroad Documents'          },
    { key: 'summary',    label: 'Final Summary'                  },
  ];

  
  // EXACT document_id values from upload_docs table (confirmed from console log)
  const docIdToTab = {
    // A. Personal & Identity
    1:'personal',   // Applicant Aadhar Card
    2:'personal',   // PAN Card
    3:'personal',   // Passport Size Photograph
    4:'personal',   // Applicant Signature
    10:'personal',  // Domicile Certificate
    11:'personal',  // Minority Community Certificate
    12:'personal',  // Caste Certificate

    // A. Co-Applicant (under personal tab)
    13:'personal',  // Income Certificate (co-applicant)
    14:'personal',  // Parent/Guardian Aadhar Card
    15:'personal',  // Ration Card

    // B. Educational
    5:'academic',   // Admission Offer Letter
    6:'academic',   // Bonafide Certificate
    7:'academic',   // Fee Structure
    8:'academic',   // Previous Year Mark Sheet
    // 9:'academic',   // Entrance Exam Score Card
    16:'academic',  // Applicant Bank Passbook

    // C. Guarantor
    41:'guarantor', // Guarantor Aadhaar Card
    42:'guarantor', // Guarantor Affidavit
    43:'guarantor', // Income Certificate (guarantor)
    44:'guarantor', // Address Proof

    17:'guarantor', 
    18:'guarantor', 
    19:'guarantor',

    21:'collateral', // Property Ownership Proof
    22:'collateral', // 7/12, 6D, 8A Extract
    23:'collateral', // Property Registration Document
    24:'collateral', // Property Valuation Certificate
    25:'collateral', // Form-24 (A)

    // D. Collateral — Govt Employee
    26:'collateral', // Government Employee ID Card
    27:'collateral', // Salary Certificate
    28:'collateral', // Office Certificate
    29:'collateral', // Retirement Proof
    30:'collateral', // Form-24 (B)

    // D. Collateral — LIC photo
    35:'collateral', // Passport Size Colour Photograph (LIC/FD)

    36:'collateral', // Original Fixed Deposit Receipt
    37:'collateral', // Bank Confirmation Letter
    38:'collateral', // FD Account Statement
    46:'collateral', // FD collateral Aadhar card (separate from LIC photo)

    // E. Study Abroad
    39:'abroad',    // Complete Passport (All Pages)
    40:'abroad',    // Valid Visa
  };

  // document_id → sub-section purple header
  const docIdToSubSection = {
    // A. Personal & Identity
    1:'Personal & Identity Documents',
    2:'Personal & Identity Documents',
    3:'Personal & Identity Documents',
    4:'Personal & Identity Documents',
    10:'Personal & Identity Documents',
    11:'Personal & Identity Documents',
    12:'Personal & Identity Documents',

    // A. Co-Applicant
    13:'Co-Applicant (Parent / Guardian)',
    14:'Co-Applicant (Parent / Guardian)',
    15:'Co-Applicant (Parent / Guardian)',
    17:'Co-Applicant (Parent / Guardian)',
    18:'Co-Applicant (Parent / Guardian)',
    19:'Co-Applicant (Parent / Guardian)',

    // B. Educational
    5:'Educational Documents',
    6:'Educational Documents',
    7:'Educational Documents',
    8:'Educational Documents',
    // 9:'Educational Documents',

    // B. Bank
    16:'Bank Documents',

    // C. Guarantor
    41:'Guarantor Documents',
    42:'Guarantor Documents',
    43:'Guarantor Documents',
    44:'Guarantor Documents',

    // D. Property Collateral
    21:'Property Collateral',
    22:'Property Collateral',
    23:'Property Collateral',
    24:'Property Collateral',
    25:'Property Collateral',

    // D. Govt Employee Collateral
    26:'Govt Employee Collateral',
    27:'Govt Employee Collateral',
    28:'Govt Employee Collateral',
    29:'Govt Employee Collateral',
    30:'Govt Employee Collateral',

    // D. LIC Collateral — only doc_id 35
    35:'LIC Policy Collateral',

    // D. FD Collateral — doc_ids 36, 37, 38, 46
    36:'Fixed Deposit Collateral',
    37:'Fixed Deposit Collateral',
    38:'Fixed Deposit Collateral',
    46:'Fixed Deposit Collateral',

    // E. Study Abroad
    39:'Study Abroad Documents',
    40:'Study Abroad Documents',
  };

  const subSectionOrder = {
    personal:   ['Personal & Identity Documents', 'Co-Applicant (Parent / Guardian)'],
    academic:   ['Educational Documents', 'Bank Documents'],
    guarantor:  ['Guarantor Documents'],
    collateral: [ 'Property Collateral','Govt Employee Collateral','LIC Policy Collateral', 'Fixed Deposit Collateral'],
    abroad:     ['Study Abroad Documents'],
  };

  //documnet id match with the tab and tab  wise showing documents ..
  function getDocsForTab(tab) {
    if (!appData?.allDocs) return [];
    return appData.allDocs.filter(d => docIdToTab[d.document_id] === tab);
  }

  //Here form the goroup in the tab

  function getGroupedDocsForTab(tab) {
    const docs = getDocsForTab(tab);

    const groups = {};
    docs.forEach(doc => {
      const sub = docIdToSubSection[doc.document_id] || 'Documents';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(doc);
    });

  if (tab === 'collateral') {
      const photoDoc = docs.find(d => d.document_id === 35);
      if (photoDoc) {
        const hasProperty = docs.some(d => [21, 22, 23, 24, 25].includes(d.document_id));
        const hasGovt     = docs.some(d => [26, 27, 28, 29, 30].includes(d.document_id));
        const hasLIC = docs.some(d => [32, 33, 34].includes(d.document_id));
        const hasFD  = docs.some(d => [36, 37, 38, 46].includes(d.document_id));

        // Add photo to Property section if present and no LIC
        if (hasProperty && !hasLIC) {
          if (!groups['Property Collateral']) groups['Property Collateral'] = [];
          const already = groups['Property Collateral'].some(d => d.document_id === 35);
          if (!already) groups['Property Collateral'].unshift({ ...photoDoc });
          // Remove from LIC group since no LIC
          delete groups['LIC Policy Collateral'];
        }

        // Add photo to Govt Employee section if present and no LIC
        if (hasGovt && !hasLIC) {
          if (!groups['Govt Employee Collateral']) groups['Govt Employee Collateral'] = [];
          const already = groups['Govt Employee Collateral'].some(d => d.document_id === 35);
          if (!already) groups['Govt Employee Collateral'].unshift({ ...photoDoc });
          delete groups['LIC Policy Collateral'];
        }

        // Remove photo from LIC group if no actual LIC docs present
        if (!hasLIC && groups['LIC Policy Collateral']) {
          groups['LIC Policy Collateral'] = groups['LIC Policy Collateral']
            .filter(d => d.document_id !== 35);
          if (groups['LIC Policy Collateral'].length === 0)
            delete groups['LIC Policy Collateral'];
        }

        // Add photo to FD group if FD docs present but no LIC docs
        if (hasFD && !hasLIC) {
          if (!groups['Fixed Deposit Collateral']) groups['Fixed Deposit Collateral'] = [];
          const alreadyInFD = groups['Fixed Deposit Collateral'].some(d => d.document_id === 35);
          if (!alreadyInFD) groups['Fixed Deposit Collateral'].unshift({ ...photoDoc });
        }

        // If BOTH LIC and FD present, duplicate photo into FD too
        if (hasFD && hasLIC) {
          if (!groups['Fixed Deposit Collateral']) groups['Fixed Deposit Collateral'] = [];
          const alreadyInFD = groups['Fixed Deposit Collateral'].some(d => d.document_id === 35);
          if (!alreadyInFD) groups['Fixed Deposit Collateral'].unshift({ ...photoDoc });
        }
      }
    }

    const order = subSectionOrder[tab] || Object.keys(groups);
    return order
      .filter(name => groups[name] && groups[name].length > 0)
      .map(name => ({ name, docs: groups[name] }));
  }

  // $: currentDocs = getDocsForTab(activeTab);
  // $: activeTabs = appData ? tabs.filter(tab => getDocsForTab(tab.key).length > 0) : tabs;


  $: currentDocs = getDocsForTab(activeTab);

  // activeTabs: always include summary as last tab
  $: activeTabs = appData
    ? [...tabs.filter(tab => tab.key !== 'summary' && getDocsForTab(tab.key).length > 0),
       { key: 'summary', label: 'Final Summary' }]
    : tabs;

  // Check if all questions in current tab are answered
  $: currentTabAllAnswered = (() => {
    if (activeTab === 'summary') return true;
    const docs = getDocsForTab(activeTab);
    for (const doc of docs) {
      const questions = (checkpointsByDoc[String(doc.document_id)]?.questions) || [];
      for (const q of questions) {
        if (checkpointAnswers[q.id] !== 'yes' && checkpointAnswers[q.id] !== 'no') return false;
      }
    }
    return true;
  })();




  // Reset viewer when tab changes
  $: if (activeTab) {
    expandedDocId = null;
    expandedDocUrl = null;
    expandedDocName = '';
  }

  function isImage(url) {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
  }

  function isPdf(url) {
    if (!url) return false;
    return /\.pdf(\?.*)?$/i.test(url);
  }

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
    document.cookie = 'adminToken=; Path=/; Max-Age=0';
    document.cookie = 'adminDistrict=; Path=/; Max-Age=0';
    document.cookie = 'adminUsername=; Path=/; Max-Age=0';
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminDistrict');
    localStorage.removeItem('adminUsername');
    goto(`/${locale}/admin/login`);
  }

  $: totalDocs    = appData?.allDocs?.length || 0;
  $: verifiedDocs = Object.values(docVerification).filter(v => v === 'verified').length;
  $: rejectedDocs = Object.values(docVerification).filter(v => v === 'rejected').length;
  $: progressPct  = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

  function getCookie(name) {
    return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] || '';
  }

  onMount(async () => {
   const adminToken = getCookie('adminToken') || localStorage.getItem('adminToken');
    if (!adminToken) { goto(`/${locale}/admin/login`); return; }


   const adminUsername = getCookie('adminUsername') || localStorage.getItem('adminUsername') || 'Admin';
    district = getCookie('adminDistrict') || localStorage.getItem('adminDistrict') || '';
    adminUser = { username: adminUsername };

    appId         = $page.url.searchParams.get('appId');
    applicantName = $page.url.searchParams.get('name') || '';
    formNo        = $page.url.searchParams.get('formNo') || '';

    if (!appId) { error = 'No application ID provided.'; isLoading = false; return; }

   // localStorage.setItem('accessToken', adminToken);
const cpData = await getCheckpoints(adminToken);
    if (cpData.error === 0) {
      checkpointsByDoc = cpData.byDocument || {};
    }

    try {
      token.set(adminToken);
      const result = await getViewApplicationData(0, appId);
      if (result.error !== 0) {
        error = result.errorMsg || 'Failed to load application';
      } else {
        appData = result.data;
        try {
          const mastersRes = await fetch('/api/admin/masters', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });
          const mastersData = await mastersRes.json();
          if (mastersData.error === 0 || mastersData.districtMap) {
            masters = mastersData.masters || mastersData;
          }
        } catch(e) { console.error('Masters load error:', e); }
        console.log("app adta...",appData);
        
        (appData.allDocs || []).forEach(doc => {
          docVerification[doc.document_id] = 'pending';
        });

        //console.log("app adta1...",appData);
      }
    } catch (e) {
      error = 'Failed to load application data';
    } finally {
      isLoading = false;
    }
  });


</script>

<svelte:head><title>Verify Application — Admin</title></svelte:head>

<div class="min-h-screen bg-gray-50">

  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
    <div class="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between gap-2">
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

      <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
        <div class="hidden sm:flex items-center gap-0.5 sm:gap-1">
          {#each [['en','English'],['hi','हिंदी'],['mr','मराठी']] as [code, label]}
            <button
              on:click={() => goto(`/${code}/admin/dashboard`)}
              class="px-2 sm:px-2.5 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md text-xs font-medium transition-colors
                {locale === code ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
            >{label}</button>
          {/each}
        </div>

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
        <div class="hidden sm:block w-px self-stretch bg-gray-200 flex-shrink-0 ml-[5%]"></div>

        <!-- Step flow navigation -->
        <div class="flex items-start flex-1 overflow-x-auto py-2 ml-[10%]">
      {#each activeTabs as tab, i}
            {#if i > 0}
              <div class="flex-1 h-1 min-w-[16px] rounded-full self-center mb-5
                {sectionStatus[activeTabs[i-1].key] === 'verified' ? 'bg-blue-500' : 'bg-gray-200'}">
              </div>
            {/if}

            <button
              on:click={() => activeTab = tab.key}
              class="flex flex-col items-center flex-shrink-0 group focus:outline-none"
              style="min-width: 56px;"
            >
              <div class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all shadow-sm
                {activeTab === tab.key
                  ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200'
                  : tab.key === 'summary'
                    ? 'bg-purple-600 border-purple-600 text-white'
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
               {:else if tab.key === 'summary'}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                {:else}
                  <span class="text-sm font-bold">{i + 1}</span>
                {/if}
              </div>
              <span class="mt-2 text-xs sm:text-sm font-medium text-center leading-tight whitespace-nowrap
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

      <!-- Final Summary Tab -->
      {#if activeTab === 'summary'}
        <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 class="text-lg font-bold text-gray-800">Verification Summary</h2>

          <!-- Section status list -->
          <div class="space-y-3">
            {#each activeTabs.filter(t => t.key !== 'summary') as tab}
              {@const tabDocs = getDocsForTab(tab.key)}
              {@const allAnswered = tabDocs.every(doc => {
                const qs = checkpointsByDoc[String(doc.document_id)]?.questions || [];
                return qs.every(q => checkpointAnswers[q.id] === 'yes' || checkpointAnswers[q.id] === 'no');
              })}
              {@const yesCount = tabDocs.reduce((acc, doc) => {
                const qs = checkpointsByDoc[String(doc.document_id)]?.questions || [];
                return acc + qs.filter(q => checkpointAnswers[q.id] === 'yes').length;
              }, 0)}
              {@const totalQ = tabDocs.reduce((acc, doc) => {
                return acc + (checkpointsByDoc[String(doc.document_id)]?.questions?.length || 0);
              }, 0)}
              <div class="flex items-center gap-3 px-4 py-3 rounded-lg border
                {allAnswered ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}">
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  {allAnswered ? 'bg-green-500' : 'bg-amber-400'}">
                  {#if allAnswered}
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/>
                    </svg>
                  {/if}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-800">{tab.label}</p>
                  <p class="text-xs text-gray-500">{tabDocs.length} docs · {yesCount}/{totalQ} questions answered</p>
                </div>
                <button
                  on:click={() => activeTab = tab.key}
                  class="text-xs text-blue-600 hover:underline font-medium"
                >Review</button>
              </div>
            {/each}
          </div>

          <!-- Final Decision buttons -->
          <div class="pt-4 border-t border-gray-200">
            <p class="text-sm font-semibold text-gray-700 mb-3">Submit Final Decision</p>
            <div class="flex gap-3 flex-wrap">
              <button on:click={() => handleFinalDecision('return')}
                class="px-5 py-2.5 text-sm font-semibold text-amber-600 border border-amber-300 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                ↩ Return to Applicant
              </button>
              <button on:click={() => handleFinalDecision('reject')}
                class="px-5 py-2.5 text-sm font-semibold text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                ✕ Reject Application
              </button>
              <button on:click={() => handleFinalDecision('forward')}
                class="px-5 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                ✓ Forward Application
              </button>
            </div>
          </div>
        </div>

      {:else}
      <!-- Two column layout: equal 50/50 split -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Left: Document list grouped by sub-section -->
        <div class="lg:col-span-1 space-y-3">
          {#each getGroupedDocsForTab(activeTab) as group}
            <div class="overflow-hidden rounded-lg border border-gray-200">
              <div class="bg-purple-800 px-4 py-2.5 flex items-center justify-between">
                <p class="text-white text-xs font-bold uppercase tracking-wider">{group.name}</p>
                <span class="text-purple-300 text-xs">{group.docs.length} doc{group.docs.length !== 1 ? 's' : ''}</span>
              </div>
              <DocumentList
                docs={group.docs}
                {appData}
                {masters}   
                {docVerification}
                {checkpointsByDoc}
                bind:checkpointAnswers
                applicationId={appId}
                adminToken={getCookie('adminToken') || localStorage.getItem('adminToken') || ''}
                sectionStatus={sectionStatus[activeTab]}
                sectionLabel={group.name}
                bind:expandedDocId
                bind:expandedDocUrl
                bind:expandedDocName
                on:verifySection={() => verifySection(activeTab)}
                on:rejectSection={() => rejectSection(activeTab)}
                on:saveDoc={(e) => verifyDoc(e.detail.docId)}
              />
            </div>
          {/each}
          {#if getDocsForTab(activeTab).length === 0}
            <div class="bg-white rounded-lg border border-dashed border-gray-200 p-12 text-center text-gray-400">
              <p class="text-sm font-medium">No documents uploaded in this section</p>
            </div>
          {/if}
        </div>

        <!-- Right: Document viewer -->
        <div class="lg:col-span-1 lg:sticky lg:top-[80px] lg:self-start lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto">
          {#if expandedDocId && expandedDocUrl}
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">

              <!-- Viewer header -->
              <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-base font-semibold text-gray-800 truncate">{expandedDocName}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={expandedDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  >
                    Open in new tab ↗
                  </a>
                  <button
                    on:click={() => { expandedDocId = null; expandedDocUrl = null; expandedDocName = ''; }}
                    class="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Document preview -->
              <div class="bg-gray-50 border-b border-gray-100">
                {#if isImage(expandedDocUrl)}
                  <img
                    src={expandedDocUrl}
                    alt={expandedDocName}
                    class="w-full object-contain max-h-[480px]"
                  />
                {:else if isPdf(expandedDocUrl)}
                  <iframe
                    src={expandedDocUrl}
                    title={expandedDocName}
                    class="w-full h-[480px]"
                    frameborder="0"
                  ></iframe>
                {:else}
                  <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <p class="text-base">Preview not available</p>
                    <a href={expandedDocUrl} target="_blank" rel="noopener noreferrer"
                      class="mt-2 text-sm text-blue-600 hover:underline">Open in new tab →</a>
                  </div>
                {/if}
              </div>

            </div>

          {:else}
            <!-- Placeholder -->
            <div class="bg-white rounded-lg border border-gray-200 border-dashed flex flex-col items-center justify-center py-32 text-gray-300">
              <svg class="w-14 h-14 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <p class="text-base font-medium">Select a document to preview</p>
              <p class="text-sm mt-1">Click any row on the left</p>
            </div>
          {/if}
        </div>
    </div>
      {/if}

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

       <div class="flex gap-3 flex-wrap justify-end">
          <button
            on:click={() => {
              const currentIndex = activeTabs.findIndex(t => t.key === activeTab);
              if (currentIndex > 0) activeTab = activeTabs[currentIndex - 1].key;
            }}
            disabled={activeTab === activeTabs[0]?.key}
            class="px-5 py-2 text-base font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >← Previous</button>

          {#if activeTab !== 'summary'}
            <button
              on:click={() => {
                const currentIndex = activeTabs.findIndex(t => t.key === activeTab);
                if (currentIndex < activeTabs.length - 1) activeTab = activeTabs[currentIndex + 1].key;
              }}
              disabled={!currentTabAllAnswered}
              title={!currentTabAllAnswered ? 'Answer all questions to proceed' : ''}
              class="px-6 py-2 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >Next →</button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

{#if showRemarkModal}
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h3 class="text-base font-bold text-gray-800 mb-1 capitalize">
        {pendingDecision === 'forward' ? '✓ Forward' : pendingDecision === 'reject' ? '✕ Reject' : '↩ Return'} Application
      </h3>
      <p class="text-sm text-gray-500 mb-4">Form: <span class="font-semibold">{formNo || appId}</span></p>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Remark {pendingDecision === 'reject' ? '(required)' : '(optional)'}
      </label>
      <textarea
        bind:value={decisionRemark}
        rows="3"
        placeholder="Enter your remark..."
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
      ></textarea>
      <div class="flex gap-3 mt-4 justify-end">
        <button
          on:click={() => { showRemarkModal = false; pendingDecision = ''; }}
          class="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >Cancel</button>
        <button
          on:click={confirmDecision}
          disabled={isSubmitting || (pendingDecision === 'reject' && !decisionRemark.trim())}
          class="px-5 py-2 text-sm font-bold text-white rounded transition-colors disabled:opacity-50
            {pendingDecision === 'forward' ? 'bg-green-600 hover:bg-green-700' :
             pendingDecision === 'reject'  ? 'bg-red-600 hover:bg-red-700' :
                                            'bg-amber-500 hover:bg-amber-600'}"
        >{isSubmitting ? 'Submitting...' : `Confirm ${pendingDecision}`}</button>
      </div>
    </div>
  </div>
{/if}