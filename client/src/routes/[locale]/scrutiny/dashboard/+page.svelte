<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';
  
  import {
    validateScrutinyToken,
    clearScrutinySession,
    refreshScrutinyToken,
    getStateApplicationsPaginated
  } from '$lib/api/stateapi.js';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let scrutinyUser = null;
  let candidates   = [];
  let isLoading    = true;
  let fetchError   = '';
  let userName     = '';

  // Filters & search
  let searchQuery    = '';
  let filterStatus   = 'all';
  let filterDistrict = 'all';

  // Pagination
  let currentPage      = 1;
  const perPage        = 10;
  let serverTotalPages = 1;
  let serverTotal      = 0;

  // State-wide stats (from server)
  let stateTotal      = 0;
  let stateApproved   = 0;
  let statePending    = 0;
  let stateUnderReview = 0;
  let stateRejected   = 0;

  // Unique districts from current page for client-side filter dropdown
  $: districts = [...new Set(candidates.map(c => c.district).filter(Boolean))].sort();

  // Client-side filtering within current page
  $: filtered = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.applicationId?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.mobile?.includes(q);
    const matchStatus   = filterStatus   === 'all' || c.status   === filterStatus;
    const matchDistrict = filterDistrict === 'all' || c.district === filterDistrict;
    return matchSearch && matchStatus && matchDistrict;
  });

  $: totalPages  = serverTotalPages;
  $: paginated   = filtered;
  $: pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  $: if (searchQuery || filterStatus || filterDistrict) currentPage = 1;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  // src/routes/[locale]/scrutiny/dashboard/+page.svelte

onMount(async () => {
    // ── Wait for browser to flush storage after navigation ──
    await new Promise(resolve => setTimeout(resolve, 80));

    let token = localStorage.getItem('scrutinyToken')
      || document.cookie.match(/(?:^|; )scrutinyTokenJS=([^;]*)/)?.[1] || '';

    console.log('=== SCRUTINY DASHBOARD LOADED ===');
    console.log('Token found:', token ? token.substring(0, 40) + '...' : 'NONE');
    console.log('All cookies:', document.cookie);

    if (!token) {
      console.log('No token — redirecting to login');
      goto(`/${locale}/scrutiny/login`);
      return;
    }

    if (!validateScrutinyToken(token)) {
      console.log('Token invalid/expired — attempting refresh...');
      const refreshed = await refreshScrutinyToken();
      if (!refreshed) {
        console.log('Refresh failed — clearing session');
        clearScrutinySession();
        goto(`/${locale}/scrutiny/login`);
        return;
      }
      token = localStorage.getItem('scrutinyToken') || '';
      console.log('Token refreshed successfully');
    }

    console.log('Token valid — loading dashboard');

    userName = localStorage.getItem('scrutinyUsername')
      || document.cookie.match(/scrutinyUsername=([^;]+)/)?.[1] || 'Scrutiny Officer';

    try {
      const raw = localStorage.getItem('scrutinyUser');
      if (raw) scrutinyUser = JSON.parse(raw);
    } catch {}
    if (!scrutinyUser) scrutinyUser = { username: userName };

    await fetchCandidates(1);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  function mapStatus(statusId) {
    const s = Number(statusId);
    if ([4, 8, 9].includes(s)) return 'Forwarded';
    if ([5, 6, 7].includes(s)) return 'Rejected';
    if (s === 3)               return 'Under Review';
    if (s === 2)               return 'Pending';
    return 'Pending';
  }

  function mapVerifyStatus(app) {
    const answerCount = parseInt(app.answer_count) || 0;
    const status      = mapStatus(app.application_status);
    if (status === 'Forwarded') return 'Forwarded';
    if (status === 'Rejected')  return 'Rejected';
    if (answerCount > 0)        return 'continue';
    return 'verify';
  }

  // ── Data fetch ────────────────────────────────────────────────────────────
  async function fetchCandidates(page = 1) {
    isLoading  = true;
    fetchError = '';
    try {
      const result = await getStateApplicationsPaginated(page, perPage);
      if (result.error !== 0) {
        fetchError = result.errorMsg || 'Failed to load applications';
      } else {
        serverTotal      = result.total;
        serverTotalPages = result.totalPages;
        currentPage      = result.page;

        stateTotal       = result.total       || 0;
        stateApproved    = result.approved    || 0;
        statePending     = result.pending     || 0;
        stateUnderReview = result.underReview || 0;
        stateRejected    = result.rejected    || 0;

        candidates = (result.applications || []).map(app => ({
          id:            app.id,
          applicationId: app.form_no || `APP-${app.id}`,
          name:          app.name,
          email:         app.email,
          mobile:        app.mobile,
          district:      app.district_name,
          religion:      app.community || '',
          loanAmount:    app.loan_required_amount || '',
          course:        app.course_name || '',
          appliedOn:     app.updated_at,
          status:        mapStatus(app.application_status),
          verifyStatus:  mapVerifyStatus(app)
        }));
      }
    } catch {
      fetchError = 'Server error. Could not load application data.';
    } finally {
      isLoading = false;
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function openViewApplication(candidate) {
    window.open(`/${locale}/scrutiny/view-application?appId=${candidate.id}`, '_blank');
  }

  function openVerifyApplication(candidate) {
    window.open(
      `/${locale}/scrutiny/verify-application?appId=${candidate.id}&formNo=${encodeURIComponent(candidate.applicationId || '')}`,
      '_blank'
    );
  }

  function handleLogout() {
    clearScrutinySession();
    goto(`/${locale}/scrutiny/login`);
  }

  // ── Style helpers ─────────────────────────────────────────────────────────
  function statusColor(status) {
    if (status === 'Forwarded')    return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Rejected')     return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'Under Review') return 'bg-orange-50 text-orange-500 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }

  function statusDot(status) {
    if (status === 'Forwarded')    return 'bg-green-500';
    if (status === 'Rejected')     return 'bg-red-500';
    if (status === 'Under Review') return 'bg-orange-400';
    return 'bg-yellow-500';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return dateStr; }
  }

  // Stats cards config
  $: statCards = [
    {
    label: 'Total Forwarded',
    value: stateTotal,
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    label: 'Forwarded by Districts',
    value: stateApproved,
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'bg-purple-100 text-purple-600'
  }
  ];
</script>

<svelte:head>
  <title>State Scrutiny Dashboard - MAMFDC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</svelte:head>

<div class="min-h-screen flex flex-col" style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #e0f2fe 100%)">

  <!-- ── Header ── -->
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
    <div class="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between gap-2">

      <!-- Logo + Title -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        <div class="flex-shrink-0">
          <img src="/MaulanaAzad.jpg" alt="MAMFDC Logo"
            class="h-8 sm:h-10 md:h-12 lg:h-[70px] w-auto object-contain"/>
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

      <!-- Right: user badge + logout -->
      <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
        {#if scrutinyUser}
          <div class="hidden md:flex items-center gap-2 px-2 lg:px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
            <div class="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {scrutinyUser.username?.[0]?.toUpperCase() || 'S'}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-xs lg:text-sm font-medium text-purple-700 truncate">{scrutinyUser.username}</span>
              <span class="text-[10px] lg:text-xs text-purple-500 font-medium">🏛️ State Scrutiny Officer</span>
            </div>
          </div>
        {/if}

        <button
          on:click={handleLogout}
          class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
        >
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>

  <!-- ── Main ── -->
  <main class="flex-1 w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">

    <!-- Page heading -->
    <div class="mb-4 sm:mb-6 lg:mb-8">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-1 h-6 bg-purple-500 rounded-full"></div>
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">State Scrutiny Dashboard</h2>
      </div>
      <p class="text-xs sm:text-sm lg:text-base text-gray-500 ml-3">
        All applications across <span class="font-semibold text-puprle-600">Maharashtra State</span>
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mb-6 lg:mb-8">
      {#each statCards as card}
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 lg:p-5 flex items-center gap-2 sm:gap-3 lg:gap-4">
          <div class="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl {card.color} flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={card.icon}/>
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] sm:text-xs text-gray-500 font-medium leading-tight truncate">{card.label}</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Table section -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- Toolbar -->
      <div class="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search by name, application no., email, mobile..."
            class="w-full pl-9 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors"
          />
        </div>

        <!-- Status filter -->
        <select
          bind:value={filterStatus}
          class="w-full sm:w-44 px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
        >
          <option value="all">All Forwarded</option>
          <option value="Forwarded">Forwarded</option>
        </select>

        <!-- District filter (from current page data) -->
        <select
          bind:value={filterDistrict}
          class="w-full sm:w-44 px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
        >
          <option value="all">All Districts</option>
          {#each districts as d}
            <option value={d}>{d}</option>
          {/each}
        </select>
      </div>

      <!-- Loading state -->
      {#if isLoading}
        <div class="flex items-center justify-center py-24">
          <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p class="text-sm text-gray-500">Loading state applications...</p>
          </div>
        </div>

      <!-- Error state -->
      {:else if fetchError}
        <div class="flex items-center justify-center py-24">
          <div class="flex flex-col items-center gap-3 text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="text-sm text-red-600 font-medium">{fetchError}</p>
            <button
              on:click={() => fetchCandidates(1)}
              class="text-sm text-green-600 hover:text-green-800 underline font-medium"
            >Try again</button>
          </div>
        </div>

      <!-- Empty state -->
      {:else if paginated.length === 0}
        <div class="flex items-center justify-center py-24">
          <div class="flex flex-col items-center gap-3 text-center">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="text-sm text-gray-600 font-medium">No applications found</p>
            <p class="text-xs text-gray-400">Try adjusting your filters or search query</p>
          </div>
        </div>

      <!-- Table -->
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Sr. No</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Application No.</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Applicant Name</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">District</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Mobile</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Email</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Religion</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Loan Amount</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Course Name</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Applied On</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Status</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">View</th>
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Verify</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              {#each paginated as candidate, i}
                <tr class="hover:bg-green-50/30 transition-colors">

                  <!-- Sr. No -->
                  <td class="px-3 lg:px-4 py-3 text-gray-400 text-xs">
                    {(currentPage - 1) * perPage + i + 1}
                  </td>

                  <!-- Application No. -->
                  <td class="px-3 lg:px-4 py-3">
                    <span class="font-mono text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {candidate.applicationId || '—'}
                    </span>
                  </td>

                  <!-- Name -->
                  <td class="px-3 lg:px-4 py-3 text-gray-800 font-semibold text-xs whitespace-nowrap">
                    {candidate.name || '—'}
                  </td>

                  <!-- District -->
                  <td class="px-3 lg:px-4 py-3 text-xs whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 text-gray-600">
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                      {candidate.district || '—'}
                    </span>
                  </td>

                  <!-- Mobile -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{candidate.mobile || '—'}</td>

                  <!-- Email -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{candidate.email || '—'}</td>

                  <!-- Religion -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{candidate.religion || '—'}</td>

                  <!-- Loan Amount -->
                  <td class="px-3 lg:px-4 py-3 text-gray-700 text-xs font-medium whitespace-nowrap">
                    {candidate.loanAmount ? `₹${Number(candidate.loanAmount).toLocaleString('en-IN')}` : '—'}
                  </td>

                  <!-- Course -->
                  <td class="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap max-w-[160px] truncate">
                    {candidate.course || '—'}
                  </td>

                  <!-- Applied On -->
                  <td class="px-3 lg:px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(candidate.appliedOn)}
                  </td>

                  <!-- Status -->
                  <td class="px-3 lg:px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border {statusColor(candidate.status)}">
                      <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 {statusDot(candidate.status)}"></span>
                      {candidate.status || 'Pending'}
                    </span>
                  </td>

                  <!-- View -->
                  <td class="px-3 lg:px-4 py-3">
                    <button
                      on:click={() => openViewApplication(candidate)}
                      class="text-xs font-semibold text-green-600 hover:text-green-800 hover:underline transition-colors whitespace-nowrap"
                    >View</button>
                  </td>

                  <!-- Verify -->
                  <td class="px-3 lg:px-4 py-3">
                    {#if candidate.verifyStatus === 'Forwarded'}
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 border border-green-200 whitespace-nowrap">
                        ✓ Forwarded
                      </span>
                    {:else if candidate.verifyStatus === 'Rejected'}
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
                        ✕ Rejected
                      </span>
                    {:else if candidate.verifyStatus === 'continue'}
                      <button
                        on:click={() => openVerifyApplication(candidate)}
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors whitespace-nowrap shadow-sm"
                      >↩ Continue</button>
                    {:else}
                      <button
                        on:click={() => openVerifyApplication(candidate)}
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors whitespace-nowrap shadow-sm"
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
        <div class="px-3 sm:px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="text-xs text-gray-500">
            Showing
            <span class="font-semibold text-gray-700">{(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, serverTotal)}</span>
            of
            <span class="font-semibold text-gray-700">{serverTotal}</span>
            applications
          </p>
          <div class="flex items-center gap-1 sm:gap-1.5">
            <button
              on:click={() => fetchCandidates(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>

            {#each pageNumbers as p, idx}
              {#if idx > 0 && pageNumbers[idx - 1] !== p - 1}
                <span class="text-gray-400 text-xs px-0.5">…</span>
              {/if}
              <button
                on:click={() => fetchCandidates(p)}
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold transition-colors
                  {currentPage === p
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}"
              >{p}</button>
            {/each}

            <button
              on:click={() => fetchCandidates(Math.min(serverTotalPages, currentPage + 1))}
              disabled={currentPage === serverTotalPages}
              class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>