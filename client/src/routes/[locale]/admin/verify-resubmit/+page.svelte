<script>
  // @ts-nocheck
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  import { getViewApplicationData } from '$lib/api/authApi.js';
  import { token } from '$lib/stores/userStore';
  import {
    submitDecision,
    getCheckpoints,
    validateAdminToken,
    clearAdminSession,
    refreshAdminToken,
    getRejectReasons,
  } from '$lib/api/adminapi.js';
  import DocumentList from '$lib/components/admin/verify/DocumentList.svelte';

  // ─── Toast 
  let toastMessage = '';
  let toastType    = '';
  let showToast    = false;

  function showNotification(message, type = 'success') {
    toastMessage = message;
    toastType    = type;
    showToast    = true;
    setTimeout(() => { showToast = false; }, 1800);
  }

  // ─── Decision modal 
  let showRemarkModal   = false;
  let pendingDecision   = '';
  let decisionRemark    = '';
  let isSubmitting      = false;
  let rejectReasons     = [];
  let rejectReasonsLoading = false;
  let selectedReasonCode   = '';


    let expandedDocOldUrl = null;    
    let expandedDocOldName = '';
    let showOldDoc = false;

  async function handleFinalDecision(decision) {
    pendingDecision   = decision;
    showRemarkModal   = true;
    decisionRemark    = '';
    selectedReasonCode = '';

    if (decision === 'reject' && rejectReasons.length === 0) {
      rejectReasonsLoading = true;
      try {
        const res = await getRejectReasons();
        if (res.error === 0) rejectReasons = res.reasons || [];
      } catch (e) { console.error('Failed to load reject reasons:', e); }
      finally { rejectReasonsLoading = false; }
    }
  }

  async function confirmDecision() {
    if (!pendingDecision) return;
    isSubmitting = true;
    try {
      // Use the resubmit-specific API endpoint
      const adminToken = getToken();
      const res = await fetch('/api/admin/verify-resubmit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'finalDecision',
          application_id: appId,
          decision: pendingDecision,
          remark: decisionRemark,
          reason_codes: pendingDecision === 'reject' && selectedReasonCode
            ? [selectedReasonCode] : [],
        }),
      });
      const result = await res.json();

      if (result.error === 0) {
        showRemarkModal = false;
        showNotification(
          pendingDecision === 'forward'
            ? '✓ Application forwarded successfully!'
            : '✕ Application rejected successfully!',
          'success'
        );
        setTimeout(() => goto(`/${locale}/admin/dashboard`), 1800);
      } else {
        showNotification('Error: ' + (result.errorMsg || 'Failed'), 'error');
      }
    } catch (e) {
      showNotification('Error: ' + (e.message || 'Something went wrong'), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  // ─── Page state 
  $: locale = $page.params.locale || 'en';

  let adminUser  = null;
  let district   = '';
  let t          = {};
  let isLoading  = true;
  let appData    = null;
  let masters    = {};
  let error      = null;
  let appId      = null;
  let applicantName = '';
  let formNo     = '';
  let activeTab  = 'personal';

  let sectionStatus = {
    personal: 'pending', academic: 'pending', family: 'pending',
    bank: 'pending', guarantor: 'pending', collateral: 'pending',
  };

  let docVerification    = {};
  let checkpointsByDoc   = {};
  let checkpointAnswers  = {};

  // Populated from /api/admin/verify-resubmit GET
  let rejectedUploadDocIds = new Set(); 

  // Bound from DocumentList
  let expandedDocId  = null;
  let expandedDocUrl = null;
  let expandedDocName = '';

  let newDocMap = {};  
  let oldDocMap = {};   

  // Tab definitions
  const tabs = [
    { key: 'personal',   label: 'Personal & Identity Documents'   },
    { key: 'academic',   label: 'Educational & Banking Documents' },
    { key: 'guarantor',  label: 'Guarantor Documents'             },
    { key: 'collateral', label: 'Collateral Documents'            },
    { key: 'abroad',     label: 'Study Abroad Documents'          },
    { key: 'summary',    label: 'Final Summary'                   },
  ];

  //  document_id 
  const docIdToTab = {
    1:'personal', 2:'personal', 3:'personal', 4:'personal',
    10:'personal', 11:'personal', 12:'personal',
    13:'personal', 14:'personal', 15:'personal',
    5:'academic', 6:'academic', 7:'academic', 8:'academic', 16:'academic',
    41:'guarantor', 42:'guarantor', 43:'guarantor', 44:'guarantor',
    17:'guarantor', 18:'guarantor', 19:'guarantor',
    20:'collateral', 21:'collateral', 22:'collateral', 23:'collateral', 24:'collateral', 45:'collateral',
    25:'collateral', 26:'collateral', 27:'collateral', 28:'collateral', 29:'collateral', 48:'collateral',
    30:'collateral', 31:'collateral', 32:'collateral', 33:'collateral', 34:'collateral', 47:'collateral',
    35:'collateral', 36:'collateral', 37:'collateral', 38:'collateral', 46:'collateral',
    39:'abroad', 40:'abroad',
  };

  // ─── document_id sub-section label 
  const docIdToSubSection = {
    1:'Personal & Identity Documents', 2:'Personal & Identity Documents',
    3:'Personal & Identity Documents', 4:'Personal & Identity Documents',
    10:'Personal & Identity Documents', 11:'Personal & Identity Documents', 12:'Personal & Identity Documents',
    13:'Co-Applicant (Parent / Guardian)', 14:'Co-Applicant (Parent / Guardian)',
    15:'Co-Applicant (Parent / Guardian)', 17:'Co-Applicant (Parent / Guardian)',
    18:'Co-Applicant (Parent / Guardian)', 19:'Co-Applicant (Parent / Guardian)',
    5:'Educational Documents', 6:'Educational Documents', 7:'Educational Documents', 8:'Educational Documents',
    16:'Bank Documents',
    41:'Guarantor Documents', 42:'Guarantor Documents', 43:'Guarantor Documents', 44:'Guarantor Documents',
    20:'Property Collateral (मालमत्ता तारण)', 21:'Property Collateral (मालमत्ता तारण)',
    22:'Property Collateral (मालमत्ता तारण)', 23:'Property Collateral (मालमत्ता तारण)',
    24:'Property Collateral (मालमत्ता तारण)', 45:'Property Collateral (मालमत्ता तारण)',
    25:'Government Employee Collateral (शासकीय कर्मचारी तारण)',
    26:'Government Employee Collateral (शासकीय कर्मचारी तारण)',
    27:'Government Employee Collateral (शासकीय कर्मचारी तारण)',
    28:'Government Employee Collateral (शासकीय कर्मचारी तारण)',
    29:'Government Employee Collateral (शासकीय कर्मचारी तारण)',
    48:'Government Employee Collateral (शासकीय कर्मचारी तारण)',
    30:'LIC Policy Collateral (LIC पॉलिसी तारण)', 31:'LIC Policy Collateral (LIC पॉलिसी तारण)',
    32:'LIC Policy Collateral (LIC पॉलिसी तारण)', 33:'LIC Policy Collateral (LIC पॉलिसी तारण)',
    34:'LIC Policy Collateral (LIC पॉलिसी तारण)', 47:'LIC Policy Collateral (LIC पॉलिसी तारण)',
    35:'Fixed Deposit (FD) Collateral (ठेव तारण - FD)', 36:'Fixed Deposit (FD) Collateral (ठेव तारण - FD)',
    37:'Fixed Deposit (FD) Collateral (ठेव तारण - FD)', 38:'Fixed Deposit (FD) Collateral (ठेव तारण - FD)',
    46:'Fixed Deposit (FD) Collateral (ठेव तारण - FD)',
    39:'Study Abroad Documents', 40:'Study Abroad Documents',
  };

  const subSectionOrder = {
    personal:   ['Personal & Identity Documents', 'Co-Applicant (Parent / Guardian)'],
    academic:   ['Educational Documents', 'Bank Documents'],
    guarantor:  ['Guarantor Documents'],
    collateral: [
      'Property Collateral (मालमत्ता तारण)',
      'Government Employee Collateral (शासकीय कर्मचारी तारण)',
      'LIC Policy Collateral (LIC पॉलिसी तारण)',
      'Fixed Deposit (FD) Collateral (ठेव तारण - FD)',
    ],
    abroad: ['Study Abroad Documents'],
  };

  // ─── uploadDocIdToCheckpointId 
  const uploadDocIdToCheckpointId = {
    1:1, 2:2, 3:3, 4:4, 10:5, 11:6, 12:7,
    14:8, 17:8, 13:9, 18:9, 15:10, 19:10,
    5:11, 6:12, 7:13, 8:14, 9:15, 16:16,
    41:17, 42:18, 43:19, 44:20,
    20:21, 21:22, 22:23, 23:24, 24:25, 45:41,
    25:26, 26:27, 27:28, 28:29, 29:30, 48:42,
    30:31, 31:32, 32:33, 33:34, 34:35, 47:43,
    35:45, 36:36, 37:37, 38:38, 46:44,
    39:39, 40:40,
  };

  function isDocVisible(doc) {
    return rejectedUploadDocIds.has(Number(doc.document_id));
  }

  function getDocsForTab(tab) {
    if (!appData?.allDocs) return [];
    return appData.allDocs.filter(d =>
      docIdToTab[d.document_id] === tab && isDocVisible(d)
    );
  }

  function getGroupedDocsForTab(tab, data = appData) {
    const docs = getDocsForTab(tab);

    if (tab !== 'collateral') {
      const groups = {};
      docs.forEach(doc => {
        const sub = docIdToSubSection[doc.document_id] || 'Documents';
        if (!groups[sub]) groups[sub] = [];
        groups[sub].push(doc);
      });
      const order = subSectionOrder[tab] || Object.keys(groups);
      return order
        .filter(name => groups[name]?.length > 0)
        .map(name => ({ name, docs: groups[name] }));
    }

    // Collateral tab
    const backendHasProperty = (data?.collateral?.properties?.length || 0) > 0;
    const backendHasGovt     = (data?.collateral?.govtEmployees?.length || 0) > 0;
    const backendHasLIC      = (data?.collateral?.lics?.length || 0) > 0;
    const backendHasFD       = (data?.collateral?.fds?.length || 0) > 0;

    const sections = [
      { key: 'property', label: 'Property Collateral (मालमत्ता तारण)',                          docIds: [20,21,22,23,24,45], hasData: backendHasProperty },
      { key: 'govt',     label: 'Government Employee Collateral (शासकीय कर्मचारी तारण)',         docIds: [25,26,27,28,29,48], hasData: backendHasGovt     },
      { key: 'lic',      label: 'LIC Policy Collateral (LIC पॉलिसी तारण)',                       docIds: [31,32,33,34,47],    hasData: backendHasLIC      },
      { key: 'fd',       label: 'Fixed Deposit (FD) Collateral (ठेव तारण - FD)',                 docIds: [36,37,38,46],       hasData: backendHasFD       },
    ];

    return sections
      .filter(s => s.hasData)
      .map(s => {
        const sectionDocs = docs.filter(d => s.docIds.includes(d.document_id));
        if (s.key === 'lic') {
          const licPhoto = docs.find(d => d.document_id === 30);
          if (licPhoto) sectionDocs.unshift({ ...licPhoto });
        }
        if (s.key === 'fd') {
          const fdPhoto = docs.find(d => d.document_id === 35);
          if (fdPhoto) sectionDocs.unshift({ ...fdPhoto });
        }
        return { name: s.label, docs: sectionDocs };
      })
      .filter(g => g.docs.length > 0);
  }

  // Reactive derived state 
  $: currentDocs = getDocsForTab(activeTab);

  $: activeTabs = tabs;

  $: currentTabAllAnswered = (() => {
    if (activeTab === 'summary') return true;
    const docs = getDocsForTab(activeTab);
    for (const doc of docs) {
      const questions = checkpointsByDoc[String(doc.document_id)]?.questions || [];
      for (const q of questions) {
        if (checkpointAnswers[q.id] !== 'yes' && checkpointAnswers[q.id] !== 'no') return false;
      }
    }
    return true;
  })();

  $: allTabsCompleted = (() => {
    const docTabs = activeTabs.filter(t => t.key !== 'summary');
    for (const tab of docTabs) {
      const docs = getDocsForTab(tab.key);
      for (const doc of docs) {
        const questions = checkpointsByDoc[String(doc.document_id)]?.questions || [];
        for (const q of questions) {
          if (checkpointAnswers[q.id] !== 'yes' && checkpointAnswers[q.id] !== 'no') return false;
        }
      }
    }
    return true;
  })();

  $: totalDocs    = Object.keys(rejectedUploadDocIds).length || rejectedUploadDocIds.size || 0;
  $: verifiedDocs = Object.values(docVerification).filter(v => v === 'verified').length;
  $: rejectedDocs = Object.values(docVerification).filter(v => v === 'rejected').length;
  $: progressPct  = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

  // Reset viewer when tab changes
  $: if (activeTab) {
    expandedDocId  = null;
    expandedDocUrl = null;
    expandedDocName = '';
    showOldDoc = false; 
  }

  // Helpers Function
  function isImage(url) {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
  }
  function isPdf(url) {
    if (!url) return false;
    return /\.pdf(\?.*)?$/i.test(url);
  }

  function getCookie(name) {
    return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] || '';
  }
  function getToken() {
    return getCookie('adminTokenJS') || localStorage.getItem('adminToken') || '';
  }

  function verifyDoc(docId) {
    const questions = checkpointsByDoc[String(docId)]?.questions || [];
    const allAnswered = questions.length === 0 || questions.every(q =>
      checkpointAnswers[q.id] === 'yes' || checkpointAnswers[q.id] === 'no'
    );
    docVerification[docId] = allAnswered ? 'verified' : 'pending';
    docVerification = { ...docVerification };
  }

  function rejectDoc(docId) {
    docVerification[docId] = 'rejected';
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
    clearAdminSession();
    goto(`/${locale}/admin/login`);
  }

  // Save answers via resubmit API 
  async function saveResubmitAnswers(answers) {
    const adminToken = getToken();
    try {
      const res = await fetch('/api/admin/verify-resubmit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'saveAnswers',
          application_id: appId,
          answers,
        }),
      });
      return await res.json();
    } catch (e) {
      return { error: -1, errorMsg: e.message };
    }
  }

  // onMount 
  onMount(async () => {
    let adminToken = getToken();

    if (!adminToken) { goto(`/${locale}/admin/login`); return; }

    if (!validateAdminToken(adminToken)) {
      const refreshed = await refreshAdminToken();
      if (!refreshed) {
        clearAdminSession();
        goto(`/${locale}/admin/login`);
        return;
      }
      adminToken = getToken();
    }

    const adminUsername = getCookie('adminUsername') || localStorage.getItem('adminUsername') || 'Admin';
    district  = getCookie('adminDistrict') || localStorage.getItem('adminDistrict') || '';
    adminUser = { username: adminUsername };

    appId         = $page.url.searchParams.get('appId');
    applicantName = $page.url.searchParams.get('name') || '';
    formNo        = $page.url.searchParams.get('formNo') || '';

    if (!appId) { error = 'No application ID provided.'; isLoading = false; return; }

    try {

      // 1: Load checkpoints
      const cpData = await getCheckpoints();
      if (cpData.error === 0) {
        checkpointsByDoc = cpData.byDocument || {};
      }

      // 2: Load application data
      token.set(adminToken);
      const result = await getViewApplicationData(0, appId);
      if (result.error !== 0) {
        error = result.errorMsg || 'Failed to load application';
        isLoading = false;
        return;
      }
      appData = result.data;

      // 3: Load masters
      try {
        const mastersRes = await fetch('/api/admin/masters', {
          headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        const mastersData = await mastersRes.json();
        if (mastersData.error === 0 || mastersData.districtMap) {
          masters = mastersData.masters || mastersData;
        }
      } catch (e) { console.error('Masters load error:', e); }

      // 4: Load resubmit-specific data 
      try {
        const resubmitRes = await fetch(
          `/api/admin/verify-resubmit?application_id=${appId}`,
          { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        const resubmitData = await resubmitRes.json();

        if (resubmitData.error === 0) {

          // Convert answers { question_id: 1|2 }
          const converted = {};
          Object.entries(resubmitData.answers || {}).forEach(([k, v]) => {
            converted[k] = (v === 1 || v === '1') ? 'yes' : (v === 2 || v === '2') ? 'no' : v;
          });
          checkpointAnswers = { ...converted };
          
          newDocMap = resubmitData.newDocMap || {};
          oldDocMap = resubmitData.oldDocMap || {};

          const rejectedSet = new Set();

          (appData.allDocs || []).forEach(doc => {
            const uploadDocId = Number(doc.document_id);
            const questions   = checkpointsByDoc[String(uploadDocId)]?.questions || [];

            const hasNoAnswer = questions.some(q => converted[q.id] === 'no');
            if (hasNoAnswer) {
              rejectedSet.add(uploadDocId);
            }
          });

          (resubmitData.rejectedDocIds || []).forEach(apiDocId => {
            Object.entries(uploadDocIdToCheckpointId).forEach(([uploadId, cpId]) => {
              const cpKey = String(cpId);
              if (checkpointsByDoc[String(uploadId)]?.questions?.some(q =>
                q.document_id && Number(q.document_id) === apiDocId
              )) {
                rejectedSet.add(Number(uploadId));
              }
            });
          });

          rejectedUploadDocIds = rejectedSet;

          // Update docVerification
          (appData.allDocs || []).forEach(doc => {
            if (!rejectedSet.has(Number(doc.document_id))) return; // not shown
            const questions = checkpointsByDoc[String(doc.document_id)]?.questions || [];
            if (questions.length === 0) {
              docVerification[doc.document_id] = 'pending';
              return;
            }
            const allAnswered = questions.every(q =>
              converted[q.id] === 'yes' || converted[q.id] === 'no'
            );
            docVerification[doc.document_id] = allAnswered ? 'verified' : 'pending';
          });
          docVerification = { ...docVerification };
        }
        
      } catch (e) {
        console.error('Load resubmit data error:', e);
      }

    } catch (e) {
      error = 'Failed to load application data';
      console.error(e);
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head><title>Verify Resubmission — Admin</title></svelte:head>

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
            {t?.header?.title || 'Maulana Azad Minorities Financial Development Corporation Limited'}
          </h1>
          <p class="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 truncate">
            {t?.header?.subtitle || 'A Govt. of Maharashtra Undertaking'}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
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

  <!-- Loading  -->
  {#if isLoading}
    <div class="flex items-center justify-center py-32 text-gray-400 text-base">
      Loading application…
    </div>

  {:else if error}
    <div class="max-w-xl mx-auto mt-10 bg-red-50 border border-red-200 rounded p-6 text-center text-red-600 text-base">
      {error}
    </div>

  {:else if appData}

    <div class="w-full px-4 py-4 space-y-4">

      <!-- Resubmission banner -->
      <div class="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
        <svg class="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <div>
          <p class="text-sm font-semibold text-orangeS-700">Resubmission Review</p>
          <p class="text-xs text-orange-600">
            Only documents with previously rejected questions are shown.
            All questions for each document are displayed so you can re-evaluate the full document.
          </p>
        </div>
      </div>

      <!-- Applicant info + back button -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-shrink-0">
          {#if appData.documents?.photo}
            <img src={appData.documents.photo} alt="Photo"
              class="w-10 h-12 object-cover rounded border border-gray-200 flex-shrink-0"/>
          {:else}
            <div class="w-10 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          {/if}
          <div class="min-w-0">
            <p class="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-0.5">
              Resubmission Verification
            </p>
            <p class="text-base font-bold text-gray-900">{appData.personal?.name || '—'}</p>
            <p class="text-sm text-gray-400">
              {appData.personal?.mobile || ''} · Form:
              <span class="text-gray-600 font-medium">{formNo || appId}</span>
            </p>
          </div>
        </div>

        <button
          on:click={() => goto(`/${locale}/admin/dashboard`)}
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Dashboard
        </button>
      </div>

      <!-- Step flow tabs -->
      <div class="bg-white rounded-lg border border-gray-200 px-4 py-4">
        <div class="flex flex-wrap items-start flex-1 py-2 gap-x-2 gap-y-4">
          {#each activeTabs as tab, i}
            {#if i > 0}
              <div class="hidden sm:block flex-1 h-1 min-w-[16px] rounded-full self-center mb-5
                {sectionStatus[activeTabs[i-1].key] === 'verified' ? 'bg-purple-400' : 'bg-gray-200'}">
              </div>
            {/if}

            <button
              on:click={() => activeTab = tab.key}
              class="flex flex-col items-center flex-shrink-0 w-[90px] sm:w-[110px] text-center group focus:outline-none"
            >
              <div class="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all shadow-sm
                {activeTab === tab.key
                  ? 'bg-purple-500 border-purple-500 text-white shadow-purple-200'
                  : tab.key === 'summary'
                    ? 'bg-purple-700 border-purple-700 text-white'
                    : sectionStatus[tab.key] === 'verified'
                      ? 'bg-purple-400 border-purple-400 text-white'
                      : sectionStatus[tab.key] === 'rejected'
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400 group-hover:border-purple-400'}"
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                {:else}
                  <span class="text-sm font-bold">{i + 1}</span>
                {/if}
              </div>
              <span class="mt-2 text-[10px] sm:text-xs font-medium leading-tight text-center break-words
                {activeTab === tab.key ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'}">
                {tab.label}
              </span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Summary tab -->
      {#if activeTab === 'summary'}
        <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 class="text-lg font-bold text-gray-800">Resubmission Verification Summary</h2>

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
              {@const totalQ = tabDocs.reduce((acc, doc) =>
                acc + (checkpointsByDoc[String(doc.document_id)]?.questions?.length || 0), 0)}

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
                  <p class="text-xs text-gray-500">
                    {tabDocs.length} rejected doc{tabDocs.length !== 1 ? 's' : ''} ·
                    {yesCount}/{totalQ} questions answered
                  </p>
                </div>
                <button
                  on:click={() => activeTab = tab.key}
                  class="text-xs text-purple-600 hover:underline font-medium"
                >Review</button>
              </div>
            {/each}
          </div>

          <!-- Final decision buttons -->
          <div class="pt-4 border-t border-gray-200">
            <p class="text-sm font-semibold text-gray-700 mb-3">Submit Final Decision</p>
            <div class="flex gap-3 flex-wrap">
              <button
                on:click={() => handleFinalDecision('reject')}
                disabled={!allTabsCompleted}
                title={!allTabsCompleted ? 'Complete all verification questions first' : ''}
                class="px-5 py-2.5 text-sm font-semibold text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >✕ Reject Application</button>
              <button
                on:click={() => handleFinalDecision('forward')}
                disabled={!allTabsCompleted}
                title={!allTabsCompleted ? 'Complete all verification questions first' : ''}
                class="px-5 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >✓ Forward Application</button>
            </div>
          </div>
        </div>

      {:else}
        <!-- Two-column layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <!-- Left: filtered document list -->
          <div class="lg:col-span-1 space-y-3">
            {#each getGroupedDocsForTab(activeTab, appData) as group}
              <div class="overflow-hidden rounded-lg border border-gray-200">

                <!-- level-1 -->
                <div class="bg-purple-700 px-4 py-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <p class="text-white text-xs font-bold uppercase tracking-wider">{group.name}</p>
                  </div>
                  <span class="text-purple-300 text-xs">
                    {group.docs.length} rejected doc{group.docs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <DocumentList
                  docs={group.docs}
                  {appData}
                  {masters}
                  {docVerification}
                  {checkpointsByDoc}
                  bind:checkpointAnswers
                  applicationId={appId}
                  adminToken={getToken()}
                  sectionStatus={sectionStatus[activeTab]}
                  sectionLabel={group.name}
                  bind:expandedDocId
                  bind:expandedDocUrl
                  bind:expandedDocName
                  on:verifySection={() => verifySection(activeTab)}
                  on:rejectSection={() => rejectSection(activeTab)}
                  on:saveDoc={async (e) => {
                    verifyDoc(e.detail.docId);

                    const doc = appData.allDocs.find(d => d.document_id === e.detail.docId);
                    if (!doc) return;
                    const questions = checkpointsByDoc[String(doc.document_id)]?.questions || [];
                    const answersPayload = questions
                      .filter(q => checkpointAnswers[q.id] === 'yes' || checkpointAnswers[q.id] === 'no')
                      .map(q => ({
                        checkpoint_id: q.checkpoint_id,
                        question_id:   q.id,
                        answer:        checkpointAnswers[q.id],
                      }));
                    if (answersPayload.length > 0) {
                      await saveResubmitAnswers(answersPayload);
                    }
                  }}
                />
              </div>
            {/each}

            {#if getDocsForTab(activeTab).length === 0}
              <div class="bg-white rounded-lg border border-dashed border-gray-200 p-12 text-center text-gray-400">
                <svg class="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm font-medium text-green-600">All documents in this section were approved</p>
                <p class="text-xs text-gray-400 mt-1">No rejected documents to review here</p>
              </div>
            {/if}
          </div>

          <!-- Right: Document viewer -->
          <div class="lg:col-span-1 lg:sticky lg:top-[80px] lg:self-start lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto">
            {#if expandedDocId && expandedDocUrl}
              {@const docIdNum = Number(expandedDocId)}
                {@const hasNewDoc = !!(newDocMap[docIdNum]?.file_name || expandedDocUrl)}
                {@const hasOldDoc = !!oldDocMap[docIdNum]?.file_name}
             {@const newUrl = newDocMap[docIdNum]?.file_name || expandedDocUrl}
            {@const activeUrl = showOldDoc && hasOldDoc
            ? oldDocMap[docIdNum].file_name
            : newUrl}

              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">

                <!-- Viewer header -->
                <div class="px-4 py-3 border-b border-gray-100">
                  <div class="flex items-center justify-between gap-3 mb-2">
                    <p class="text-base font-semibold text-gray-800 truncate">{expandedDocName}</p>
                    <button
                      on:click={() => { expandedDocId = null; expandedDocUrl = null; expandedDocName = ''; showOldDoc = false; }}
                      class="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <!-- NEW/OLD toggle tabs -->
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => showOldDoc = false}
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                        {!showOldDoc
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      New Upload
                      {#if hasNewDoc}
                        <span class="w-1.5 h-1.5 rounded-full bg-green-300 inline-block"></span>
                      {/if}
                    </button>

                    <button
                      on:click={() => showOldDoc = true}
                      disabled={!hasOldDoc}
                      title={!hasOldDoc ? 'No original document available' : 'View original document'}
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                        {showOldDoc
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Original
                      {#if hasOldDoc}
                        <span class="w-1.5 h-1.5 rounded-full bg-purple-300 inline-block"></span>
                      {/if}
                    </button>

                    <a
                    href={activeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-auto px-3 py-1.5 text-xs text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                    Open ↗
                    </a>
                  </div>

                  <!-- Label showing which version is active -->
                  <p class="text-[10px] text-gray-400 mt-1.5">
                    {#if showOldDoc}
                      📁 Showing: <span class="text-purple-500 font-medium">Original document (before resubmission)</span>
                    {:else}
                      ✅ Showing: <span class="text-green-600 font-medium">Re-uploaded document (new)</span>
                    {/if}
                  </p>
                </div>

                <!-- Document preview -->
                <div class="bg-gray-50">
                  {#if isImage(activeUrl)}
                    <img src={activeUrl} alt={expandedDocName} class="w-full object-contain max-h-[480px]"/>
                  {:else if isPdf(activeUrl)}
                    <iframe src={activeUrl} title={expandedDocName} class="w-full h-[480px]" frameborder="0"></iframe>
                  {:else}
                    <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                      <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                      <p class="text-base">Preview not available</p>
                      <a href={activeUrl} target="_blank" rel="noopener noreferrer"
                        class="mt-2 text-sm text-blue-600 hover:underline">Open in new tab →</a>
                    </div>
                  {/if}
                </div>
              </div>

            {:else}
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

      <!--  Bottom navigation bar -->
      <div class="bg-white rounded-lg border border-gray-200 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- <div>
          <p class="text-base font-semibold text-gray-800">Resubmission Review Progress</p>
          <p class="text-sm text-gray-400 mt-0.5">
            {verifiedDocs}/{rejectedUploadDocIds.size} rejected docs reviewed
          </p>
          <div class="flex items-center gap-2 mt-2">
            <div class="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full transition-all" style="width: {progressPct}%"></div>
            </div>
            <span class="text-sm font-semibold text-gray-600">{progressPct}%</span>
          </div>
        </div> -->

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
              class="px-6 py-2 text-base font-bold text-white bg-purple-500 hover:bg-purple-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >Next →</button>
          {/if}
        </div>
      </div>

    </div>
  {/if}
</div>

<!-- Decision Moda  -->
{#if showRemarkModal}
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h3 class="text-base font-bold text-gray-800 mb-1">
        {pendingDecision === 'forward' ? '✓ Forward' : '✕ Reject'} Application
      </h3>
      <p class="text-sm text-gray-500 mb-4">
        Form: <span class="font-semibold">{formNo || appId}</span>
      </p>

      {#if pendingDecision === 'reject'}
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Select Reject Reason <span class="text-red-500">*</span>
        </label>
        {#if rejectReasonsLoading}
          <p class="text-sm text-gray-400 py-3">Loading reasons...</p>
        {:else if rejectReasons.length === 0}
          <p class="text-sm text-red-400 py-3">No reject reasons found.</p>
        {:else}
          <select
            bind:value={selectedReasonCode}
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
          >
            <option value="">-- Select a reason --</option>
            {#each rejectReasons as reason}
              <option value={reason.reason_code}>
                {reason.reason_text_english} — {reason.reason_text_marathi}
              </option>
            {/each}
          </select>
        {/if}
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Additional Remark <span class="text-gray-400">(optional)</span>
        </label>
        <textarea
          bind:value={decisionRemark}
          rows="2"
          placeholder="Any additional notes..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        ></textarea>
      {:else}
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Remark <span class="text-gray-400">(optional)</span>
        </label>
        <textarea
          bind:value={decisionRemark}
          rows="3"
          placeholder="Enter your remark..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
        ></textarea>
      {/if}

      <div class="flex gap-3 mt-4 justify-end">
        <button
          on:click={() => { showRemarkModal = false; pendingDecision = ''; selectedReasonCode = ''; decisionRemark = ''; }}
          disabled={isSubmitting}
          class="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
        >Cancel</button>

        <button
          on:click={confirmDecision}
          disabled={isSubmitting || (pendingDecision === 'reject' && !selectedReasonCode)}
          class="px-5 py-2 text-sm font-bold text-white rounded transition-colors disabled:opacity-50 flex items-center gap-2
            {pendingDecision === 'forward' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}"
        >
          {#if isSubmitting}
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Submitting...
          {:else}
            {pendingDecision === 'forward' ? '✓ Confirm Forward' : '✕ Confirm Reject'}
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!--  Toast -->
{#if showToast}
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
    {toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}">
    {#if toastType === 'success'}
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
      </svg>
    {:else}
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    {/if}
    {toastMessage}
  </div>
{/if}