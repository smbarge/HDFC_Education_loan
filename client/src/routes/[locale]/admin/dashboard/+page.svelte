<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';
  import { getDistrictApplications} from '$lib/api/adminapi.js';

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
  let currentPage = 1;
  const perPage = 10;

  // Modal
  let selectedCandidate = null;
  let showModal = false;

  // Stats
  $: totalCandidates = candidates.length;
  $: approved = candidates.filter(c => c.status === 'Approved').length;
  $: pending = candidates.filter(c => c.status === 'Pending').length;
  $: rejected = candidates.filter(c => c.status === 'Rejected').length;

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

  $: totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  $: paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  $: pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  // Reset to page 1 on filter change
  $: if (searchQuery || filterStatus || filterDistrict) currentPage = 1;

  async function updateStatus(id, status) {
    try {
      const token = localStorage.getItem('adminToken');
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

  function openModal(candidate) {
    selectedCandidate = candidate;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedCandidate = null;
  }

  onMount(async () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) { goto(`/${locale}/admin/login`); return; }

    district = localStorage.getItem('adminDistrict') || '';
    userName = localStorage.getItem('adminUsername') || 'Admin';

    try {
      const raw = localStorage.getItem('adminUser');
      if (raw) adminUser = JSON.parse(raw);
    } catch {}

    if (!adminUser) {
      adminUser = { username: userName };
    }

    await fetchCandidates();
  });

  async function fetchCandidates() {
    isLoading = true;
    fetchError = '';
    try {
      const result = await getDistrictApplications(district);
      if (result.error !== 0) {
        fetchError = result.errorMsg || 'Failed to load candidates';
      } else {
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
          religion:      app.religion || '',
          loanAmount:    app.loan_amount || '',
          course:        app.course_name || '',
          loanType:      'Education Loan',
          appliedOn:     app.updated_at,
          status:        app.application_status === 'submitted' ? 'Pending'
                       : app.application_status === 'approved'  ? 'Approved'
                       : app.application_status === 'rejected'  ? 'Rejected'
                       : 'Pending',
          documents:     []
        }));
      }
    } catch (err) {
      fetchError = 'Server error. Could not load candidate data.';
    } finally {
      isLoading = false;
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("refreshToken");
    goto(`/${locale}/admin`);
  }

  function statusColor(status) {
    if (status === 'Approved') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Rejected') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }

  function statusDot(status) {
    if (status === 'Approved') return 'bg-green-500';
    if (status === 'Rejected') return 'bg-red-500';
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

<!-- Click-outside modal close -->
{#if showModal}
  <div
    class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
    on:click={closeModal}
    on:keydown={(e) => e.key === 'Escape' && closeModal()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  ></div>
{/if}

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
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">

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
          <option value="Approved">Approved</option>
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
                <th class="text-left px-3 lg:px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">Submitted Date</th>
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
                  <td class="px-3 lg:px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(candidate.appliedOn)}
                  </td>
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
                      on:click={() => openModal(candidate)}
                      class="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                    >
                      View
                    </button>
                  </td>
                  <!-- Verify -->
                  <td class="px-3 lg:px-4 py-3">
                    {#if candidate.status === 'Approved'}
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                        </svg>
                        Verified
                      </span>
                    {:else}
                      <button
                        on:click={() => updateStatus(candidate.id, 'Approved')}
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
            Showing <span class="font-semibold text-gray-700">{(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)}</span>
            of <span class="font-semibold text-gray-700">{filtered.length}</span> candidates
          </p>
          <div class="flex items-center gap-1 sm:gap-1.5">
            <button
              on:click={() => currentPage = Math.max(1, currentPage - 1)}
              disabled={currentPage === 1}
              class="px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>

            {#each pageNumbers as p, idx}
              {#if idx > 0 && pageNumbers[idx - 1] !== p - 1}
                <span class="text-gray-400 px-0.5 text-xs">…</span>
              {/if}
              <button
                on:click={() => currentPage = p}
                class="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg text-xs sm:text-sm font-semibold transition-colors
                  {currentPage === p ? 'bg-purple-600 text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}"
              >{p}</button>
            {/each}

            <button
              on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
              disabled={currentPage === totalPages}
              class="px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
          </div>
        </div>
      {/if}
    </div>

  </main>
</div>

<!-- Candidate Detail Modal -->
{#if showModal && selectedCandidate}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg sm:max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-y-auto">

      <!-- Modal Header -->
      <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
        <div>
          <h3 class="text-base sm:text-lg lg:text-xl font-bold text-purple-600">Candidate Details</h3>
          <p class="text-xs text-gray-400 mt-0.5">Application ID: {selectedCandidate.applicationId || '—'}</p>
        </div>
        <button
          on:click={closeModal}
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 space-y-4 sm:space-y-5 lg:space-y-6">

        <!-- Status badge + update -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border {statusColor(selectedCandidate.status)}">
            <span class="w-2 h-2 rounded-full {statusDot(selectedCandidate.status)}"></span>
            {selectedCandidate.status || 'Pending'}
          </span>
          <div class="flex gap-1.5 sm:gap-2 ml-auto flex-wrap">
            <button
              on:click={() => updateStatus(selectedCandidate.id, 'Approved')}
              class="px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 transition-colors"
            >✓ Approve</button>
            <button
              on:click={() => updateStatus(selectedCandidate.id, 'Rejected')}
              class="px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 transition-colors"
            >✕ Reject</button>
            <button
              on:click={() => updateStatus(selectedCandidate.id, 'Pending')}
              class="px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-200 transition-colors"
            >⟳ Pending</button>
          </div>
        </div>

        <!-- Personal Info -->
        <div>
          <h4 class="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">Personal Information</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            {#each [
              ['Full Name', selectedCandidate.name],
              ['Date of Birth', formatDate(selectedCandidate.dob)],
              ['Gender', selectedCandidate.gender],
              ['Category', selectedCandidate.category],
              ['Religion', selectedCandidate.religion],
              ['Aadhar No.', selectedCandidate.aadhar],
              ['Mobile', selectedCandidate.mobile],
              ['Email', selectedCandidate.email],
              ['District', selectedCandidate.district],
              ['Taluka', selectedCandidate.taluka],
              ['Address', selectedCandidate.address],
            ] as [label, value]}
              <div class="bg-gray-50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                <p class="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                <p class="text-xs sm:text-sm text-gray-800 font-semibold break-words">{value || '—'}</p>
              </div>
            {/each}
          </div>
        </div>

        <!-- Loan Info -->
        <div>
          <h4 class="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">Loan Details</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            {#each [
              ['Loan Type', selectedCandidate.loanType],
              ['Loan Amount', selectedCandidate.loanAmount ? `₹${Number(selectedCandidate.loanAmount).toLocaleString('en-IN')}` : null],
              ['Course Name', selectedCandidate.course],
              ['Institution', selectedCandidate.institution],
              ['Applied On', formatDate(selectedCandidate.appliedOn)],
              ['Bank Name', selectedCandidate.bankName],
              ['Account No.', selectedCandidate.accountNo],
              ['IFSC Code', selectedCandidate.ifsc],
            ] as [label, value]}
              <div class="bg-gray-50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                <p class="text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                <p class="text-xs sm:text-sm text-gray-800 font-semibold break-words">{value || '—'}</p>
              </div>
            {/each}
          </div>
        </div>

        <!-- Documents -->
        {#if selectedCandidate.documents?.length}
          <div>
            <h4 class="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">Uploaded Documents</h4>
            <div class="flex flex-wrap gap-2">
              {#each selectedCandidate.documents as doc}
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700 font-medium hover:bg-purple-100 transition-colors"
                >
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                  {doc.name}
                </a>
              {/each}
            </div>
          </div>
        {/if}

      </div>

      <!-- Modal Footer -->
      <div class="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 border-t border-gray-100 flex justify-end">
        <button
          on:click={closeModal}
          class="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >Close</button>
      </div>
    </div>
  </div>
{/if}