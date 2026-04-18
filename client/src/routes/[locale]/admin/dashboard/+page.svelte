<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';

  import { getDistrictApplicationsPaginated, validateAdminToken, clearAdminSession, refreshAdminToken } from '$lib/api/adminapi.js';
  import { reSubmitApplication } from '$lib/api/authApi';


  // getDistrictApplications

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let adminUser = null;
  let candidates = [];
  let isLoading = true;
  let fetchError = '';
  
  let district = '';    
  let userName = ''; 

  // Filters & search
  let searchQuery = '';
  let filterStatus = 'all';
  let filterDistrict = 'all';

  //pagination

  let currentPage = 1;
  const perPage = 10;
  let serverTotalPages = 1;
  let serverTotal = 0;

  // Modal
  let selectedCandidate = null;
  let showModal = false;

  // Stats
  // $: totalCandidates = serverTotal || candidates.length;
  // $: approved = candidates.filter(c => c.status === 'Forwarded').length;
  // $: pending = candidates.filter(c => c.status === 'Pending' || c.status === 'Under Review').length;
  // $: rejected = candidates.filter(c => c.status === 'Rejected').length;

  $: totalCandidates = serverTotal || candidates.length;
  let serverApproved = 0;
  let serverPending = 0;
  let serverRejected = 0;
  let serverUnderReview = 0; 
  let serverResubmitapplication = 0;

  $: approved = serverApproved;
  $: pending = serverPending;
  $: rejected = serverRejected;
  $: underReview = serverUnderReview; 
  $: resubmitted  = serverResubmitapplication;

  // Unique districts for filter
  $: districts = [...new Set(candidates.map(c => c.district).filter(Boolean))];

  // Filtered list
  $: filtered = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.applicationId?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.mobile?.includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchDistrict = filterDistrict === 'all' || c.district === filterDistrict;
    return matchSearch && matchStatus && matchDistrict;
  });

  $: totalPages = serverTotalPages;
  $: paginated = filtered;
  $: pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  // Reset to page 1 on filter change
  $: if (searchQuery || filterStatus || filterDistrict) currentPage = 1;

 async function updateStatus(id, status) {
  try {
   const token = document.cookie.match(/(?:^|; )adminTokenJS=([^;]*)/)?.[1]
           || localStorage.getItem('adminToken') || '';
    const res = await fetch('/api/admin/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'updateStatus', id, status })
    });
    const result = await res.json();
    if (result.error === 0) {
      candidates = candidates.map(c => c.id === id ? { ...c, status } : c);
      if (selectedCandidate?.id === id) selectedCandidate = { ...selectedCandidate, status };
    }
  } catch {}
}


  onMount(async () => {
  const tokenFromCookie  = document.cookie.match(/(?:^|; )adminTokenJS=([^;]*)/)?.[1] || '';
  const tokenFromStorage = localStorage.getItem('adminToken') || '';
  let adminToken         = tokenFromCookie || tokenFromStorage;

  console.log('=== DASHBOARD LOADED ===');
  console.log('Token from adminTokenJS cookie:', tokenFromCookie ? tokenFromCookie.substring(0, 50) + '...' : 'not in cookie');
  console.log('Token from localStorage:', tokenFromStorage ? tokenFromStorage.substring(0, 50) + '...' : 'not in storage');
  console.log('All cookies:', document.cookie);
  console.log('Token valid:', validateAdminToken(adminToken));

  if (!adminToken) { goto(`/${locale}/admin/login`); return; }

  if (!validateAdminToken(adminToken)) {
    console.log('Token expired — attempting refresh...');
    const refreshed = await refreshAdminToken();
    if (!refreshed) {
      clearAdminSession();
      goto(`/${locale}/admin/login`);
      return;
    }
    adminToken = document.cookie.match(/(?:^|; )adminTokenJS=([^;]*)/)?.[1]
              || localStorage.getItem('adminToken') || '';
    console.log('Token refreshed:', adminToken.substring(0, 50) + '...');
  }

      district = localStorage.getItem('adminDistrict') 
        || document.cookie.match(/adminDistrict=([^;]+)/)?.[1] || '';
      userName = localStorage.getItem('adminUsername') 
        || document.cookie.match(/adminUsername=([^;]+)/)?.[1] || 'Admin';

      try {
        const raw = localStorage.getItem('adminUser');
        if (raw) adminUser = JSON.parse(raw);
      } catch {}

      if (!adminUser) {
        adminUser = { username: userName };
      }

      await fetchCandidates(1);
    });

   function mapStatus(statusId, statusName) {
  if (statusId == 4 || statusId == 8 || statusId == 9) return 'Forwarded';
  if (statusId == 5 || statusId == 6 || statusId == 7) return 'Rejected';
  if (statusId == 3) return 'Under Review';
  if (statusId == 10) return 'Resubmitted';  //--add this
  if (statusId == 2) return 'Pending';
  return 'Pending';
}

function mapVerifyStatus(app) {
  const answerCount = parseInt(app.answer_count) || 0;
  const status = mapStatus(app.application_status, app.application_status_name);
  if (status === 'Forwarded')   return 'Forwarded';
  if (status === 'Rejected')    return 'Rejected';
  if (status === 'Resubmitted') return 'verify';   // ← ADD THIS — always show Verify
  if (answerCount > 0)          return 'continue';
  return 'verify';
}
  async function fetchCandidates(page = 1) {
  isLoading = true;
  fetchError = '';
  try {
    const result = await getDistrictApplicationsPaginated(district, page, perPage);
    if (result.error !== 0) {
      fetchError = result.errorMsg || 'Failed to load candidates';
    } else {
      // serverTotal      = result.total;
      // serverTotalPages = result.totalPages;
      // currentPage      = result.page;

       serverTotal      = result.total;
      serverTotalPages = result.totalPages;
      currentPage      = result.page;
      serverApproved   = result.approved || 0;
      serverPending    = result.pending  || 0;
      serverRejected   = result.rejected || 0;
      serverUnderReview = result.underReview || 0; 
      serverResubmitapplication = result.resubmitted ||0;

      candidates = (result.applications || []).map(app => ({
        id:            app.id,
        applicationId: app.form_no || `APP-${app.id}`,
        name:          app.name,
        email:         app.email,
        mobile:        app.mobile,
        district:      app.district_name,
        dob:           app.dob,
        gender:        app.gender,
        aadhar:        app.aadhar,
        address:       app.address,
        religion:      app.community || '',
        loanAmount:    app.loan_required_amount || '',
        course:        app.course_name || '',
        loanType:      'Education Loan',
        appliedOn:     app.updated_at,
        status:        mapStatus(app.application_status, app.application_status_name),
        verifyStatus:  mapVerifyStatus(app),   
        documents:     []
      }));
    }
  } catch (err) {
    fetchError = 'Server error. Could not load candidate data.';
  } finally {
    isLoading = false;
  }
  }

  function openViewApplication(candidate) {
    window.open(`/${locale}/admin/view-application?appId=${candidate.id}`, '_blank');
  }

  // function openVerifyApplication(candidate) {
  //   goto(`/${locale}/admin/verify-application1?appId=${candidate.id}&formNo=${encodeURIComponent(candidate.applicationId || '')}`, '_blank');
  // }

  function openVerifyApplication(candidate) {
  if (candidate.status === 'Resubmitted') {
    // Resubmitted applications → separate Level-2 verification page
    goto(
      `/${locale}/admin/verify-resubmit` +
      `?appId=${candidate.id}` +
      `&formNo=${encodeURIComponent(candidate.applicationId || '')}`,
      '_blank'
    );
  } else {
    // All other statuses → existing Level-1 verification page
    goto(`/${locale}/admin/verify-application1?appId=${candidate.id}&formNo=${encodeURIComponent(candidate.applicationId || '')}`, '_blank');
  }
}

function handleLogout() {
    clearAdminSession();
    goto(`/${locale}/admin`);
  }


function statusColor(status) {
  if (status === 'Forwarded')    return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'Rejected')     return 'bg-red-100 text-red-700 border-red-200';
  if (status === 'Under Review') return 'bg-red-50 text-red-400 border-red-200';
  if (status === 'Resubmitted')  return 'bg-blue-100 text-blue-700 border-blue-200';  // ← ADD
  if (status === 'Pending')      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-yellow-100 text-yellow-700 border-yellow-200';
}

function statusDot(status) {
  if (status === 'Forwarded')    return 'bg-green-500';
  if (status === 'Rejected')     return 'bg-red-500';
  if (status === 'Under Review') return 'bg-red-300';
  if (status === 'Resubmitted')  return 'bg-blue-500';   // ← ADD
  if (status === 'Pending')      return 'bg-yellow-500';
  return 'bg-yellow-500';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - MAMFDC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</svelte:head>

<div class="min-h-screen flex flex-col" style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #e0f2fe 100%)">

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
        <!-- <div class="hidden sm:flex items-center gap-0.5 sm:gap-1">
          {#each [['en','English'],['hi','हिंदी'],['mr','मराठी']] as [code, label]}
            <button
              on:click={() => goto(`/${code}/admin/dashboard`)}
              class="px-2 sm:px-2.5 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md text-xs font-medium transition-colors
                {locale === code ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
            >{label}</button>
          {/each}
        </div> -->

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

  <!-- Main -->
  <main class="flex-1 w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">

    <!-- Page heading -->
    <div class="mb-4 sm:mb-6 lg:mb-8">
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">Dashboard</h2>
      <p class="text-xs sm:text-sm lg:text-base text-gray-500 mt-1">
        {#if district}
          Showing applications for <span class="font-semibold text-purple-600">{district} District</span>
        {:else}
          Manage and review all candidate applications
        {/if}
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
      <!-- Total -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div class="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium">Total</p>
          <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{totalCandidates}</p>
        </div>
      </div>

      <!-- Approved -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div class="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium">Approved</p>
          <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{approved}</p>
        </div>
      </div>

      <!-- Under Review -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div class="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </div>
        <div>
          <p class="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium">Under Review</p>
          <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{underReview}</p>
        </div>
      </div>

      <!-- Pending -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div class="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium">Pending</p>
          <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{pending}</p>
        </div>
      </div>

      <!-- Rejected -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div class="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium">Rejected</p>
          <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{rejected}</p>
        </div>
      </div>

      <!-- resubmitt?ed -->
       <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div class="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium">Resubmitted Application</p>
          <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{resubmitted}</p>
        </div>
    </div>
    </div>

     

    <!-- Table Section -->
    <div>

      <!-- Toolbar -->
      <div class="mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search by name, ID, email, mobile..."
            class="w-full pl-9 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          />
        </div>

        <!-- Status filter -->
        <select
          bind:value={filterStatus}
          class="w-full sm:w-auto px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Forwarded">Forwarded</option>
          <option value="Rejected">Rejected</option>
        </select>

        <!-- District filter -->
        <select
          bind:value={filterDistrict}
          class="w-full sm:w-auto px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
        >
          <option value="all">All Districts</option>
          {#each districts as d}
            <option value={d}>{d}</option>
          {/each}
        </select>
      </div>

      <!-- Loading -->
      {#if isLoading}
        <div class="flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <p class="text-sm text-gray-500">Loading candidates...</p>
          </div>
        </div>

      <!-- Error -->
      {:else if fetchError}
        <div class="flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3 text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="text-sm text-red-600 font-medium">{fetchError}</p>
            <button on:click={fetchCandidates} class="text-sm text-purple-600 hover:text-purple-800 underline">Try again</button>
          </div>
        </div>

      <!-- Empty -->
      {:else if paginated.length === 0}
        <div class="flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3 text-center">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="text-sm text-gray-500 font-medium">No candidates found</p>
            <p class="text-xs text-gray-400">Try adjusting your filters or search query</p>
          </div>
        </div>

      <!-- Table -->
      {:else}
        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Sr. No</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Application No.</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Applicant Name</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">District</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Mobile</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Email</th>
                <!-- <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Submitted Date</th> -->
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Religion</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Loan Amount</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Course Name</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Status</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">View Application</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Verify</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {#each paginated as candidate, i}
                <tr class="hover:bg-purple-50/40 transition-colors">
                  <!-- Sr. No -->
                  <td class="px-3 lg:px-4 py-3 text-gray-500 text-xs">
                    {(currentPage - 1) * perPage + i + 1}
                  </td>
                  <!-- Application No. -->
                  <td class="px-3 lg:px-4 py-3">
                    <span class="font-mono text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {candidate.applicationId || '—'}
                    </span>
                  </td>
                  <!-- Applicant Name -->
                  <td class="px-3 lg:px-4 py-3 text-gray-800 font-semibold text-xs whitespace-nowrap">
                    {candidate.name || '—'}
                  </td>
                  <!-- District -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {candidate.district || '—'}
                  </td>
                  <!-- Mobile -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {candidate.mobile || '—'}
                  </td>
                  <!-- Email -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {candidate.email || '—'}
                  </td>
                  <!-- Submitted Date -->
                  <!-- <td class="px-3 lg:px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(candidate.appliedOn)}
                  </td> -->
                  <!-- Religion -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {candidate.religion || '—'}
                  </td>
                  <!-- Loan Amount -->
                  <td class="px-3 lg:px-4 py-3 text-gray-700 text-xs font-medium whitespace-nowrap">
                    {candidate.loanAmount ? `₹${Number(candidate.loanAmount).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <!-- Course Name -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {candidate.course || '—'}
                  </td>
                  <!-- Status -->
                  <td class="px-3 lg:px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border {statusColor(candidate.status)}">
                      <span class="w-1.5 h-1.5 rounded-full {statusDot(candidate.status)} flex-shrink-0"></span>
                      {candidate.status || 'Pending'}
                    </span>
                  </td>
                  <!-- View Application -->
                  <td class="px-3 lg:px-4 py-3">
                    <button
                      on:click={() => openViewApplication(candidate)}
                      class="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                    >
                      View
                    </button>
                  </td>
                   <td class="px-3 lg:px-4 py-3">
                    {#if candidate.verifyStatus === 'Forwarded'}
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                        ✓ Forwarded
                      </span>
                    {:else if candidate.verifyStatus === 'Rejected'}
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                        ✕ Rejected
                      </span>
                    {:else if candidate.verifyStatus === 'continue'}
                      <button
                        on:click={() => openVerifyApplication(candidate)}
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors whitespace-nowrap shadow-sm"
                      >
                        ↩ Continue
                      </button>
                    {:else}
                      <button
                        on:click={() => openVerifyApplication(candidate)}
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors whitespace-nowrap shadow-sm"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                        </svg>
                        Verify
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p class="text-xs text-gray-500">
            Showing <span class="font-semibold text-gray-700">{(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, serverTotal)}</span>
            of <span class="font-semibold text-gray-700">{serverTotal}</span> candidates
          </p>
          <div class="flex items-center gap-1 sm:gap-1.5">
            <button
              on:click={() => fetchCandidates(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              class="px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>

            {#each pageNumbers as p, idx}
              {#if idx > 0 && pageNumbers[idx - 1] !== p - 1}
                <span class="text-gray-400 px-0.5 text-xs">…</span>
              {/if}
              <button
                on:click={() => fetchCandidates(p)}
                class="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg text-xs sm:text-sm font-semibold transition-colors
                  {currentPage === p ? 'bg-purple-600 text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}"
              >{p}</button>
            {/each}

            <button
              on:click={() => fetchCandidates(Math.min(serverTotalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              class="px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
          </div>
        </div>
      {/if}
    </div>

  </main>
</div>