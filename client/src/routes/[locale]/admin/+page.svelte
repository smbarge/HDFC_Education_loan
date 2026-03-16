<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import Header from '$lib/components/landingpage/Header.svelte';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  function handleAdminLogin() {
    goto(`/${locale}/admin/login`);
  }
  
</script>

<svelte:head>
  <title>Admin Portal - MAMFDC Education Loan</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 flex flex-col">

  <!-- Header -->
  <Header />

  <!-- Hero Section -->
  <main class="flex-1 flex flex-col items-center justify-center px-4 py-12">

    <!-- Hero Card -->
    <div class="w-full max-w-4xl">

      <!-- Badge -->
      <div class="flex justify-center mb-6">
        <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
          <span class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          {t.adminPortal.title}
        </span>
      </div>

      <!-- Title -->
      <div class="text-center mb-10">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t.adminPortal.mamfdcLoan}
          <span class="block text-purple-600 mt-1">{t.adminPortal.administrationPanel}</span>
        </h2>
        <p class="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          {t.adminPortal.description}
        </p>
      </div>

      <!-- Feature Cards -->
      <!-- <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div class="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center border border-purple-50 hover:shadow-lg transition-shadow">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="font-bold text-gray-900 mb-1">Application Review</h3>
          <p class="text-sm text-gray-500">Review and process loan applications submitted by applicants.</p>
        </div>

        <div class="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center border border-purple-50 hover:shadow-lg transition-shadow">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 class="font-bold text-gray-900 mb-1">Document Verification</h3>
          <p class="text-sm text-gray-500">Verify uploaded documents and approve or reject submissions.</p>
        </div>
        
        <div class="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center border border-purple-50 hover:shadow-lg transition-shadow">
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="font-bold text-gray-900 mb-1">User Management</h3>
          <p class="text-sm text-gray-500">Manage applicant accounts and track application status.</p>
        </div>
      </div> -->

      <!-- CTA Button -->
      <div class="flex justify-center">
        <button
          on:click={handleAdminLogin}
          class="inline-flex items-center gap-3 px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg text-base"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          {t.adminPortal.footerLogin}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-100 py-4">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-sm text-gray-400">© {new Date().getFullYear()} {t.adminPortal.copyright}</p>
    </div>
  </footer>

</div>