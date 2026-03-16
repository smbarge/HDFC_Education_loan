<script>
	import { goto } from '$app/navigation';
	 import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';
import { getDistrictApplications } from '$lib/api/adminapi.js';



	$: locale = $page.params.locale || 'en';
	$: t = i18n[locale];

let userName = '';
let district = '';
let applications = [];
let isLoading = true;
let fetchError = '';

let stats = [
  { title: "Total Applications", value: 0, color: 'bg-blue-500' },
  { title: "Approved",           value: 0, color: 'bg-green-500' },
  { title: "Pending",            value: 0, color: 'bg-yellow-500' },
  { title: "Rejected",           value: 0, color: 'bg-red-500' }
];

onMount(async () => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) { goto(`/${locale}/admin/login`); return; }

  district = localStorage.getItem('adminDistrict') || '';
  userName = localStorage.getItem('adminUsername') || 'Admin';

  if (!district) { fetchError = 'No district found. Please login again.'; isLoading = false; return; }

  const result = await getDistrictApplications(district);

  if (result.error !== 0) {
    fetchError = result.errorMsg;
  } else {
    stats = [
      { title: "Total Applications", value: result.total,    color: 'bg-blue-500' },
      { title: "Approved",           value: result.approved, color: 'bg-green-500' },
      { title: "Pending",            value: result.pending,  color: 'bg-yellow-500' },
      { title: "Rejected",           value: result.rejected, color: 'bg-red-500' }
    ];
    applications = result.applications;
  }

  isLoading = false;
});

	function logout() {
    localStorage.removeItem("adminToken");   // matches what login saves
    localStorage.removeItem("refreshToken"); // also clear refresh token
    goto(`/${locale}/admin`);
}
</script>

<div class="flex h-screen bg-gray-100">



	<!-- Main Content -->
	<div class="flex-1 flex flex-col">

		<!-- Navbar -->
		<header class="bg-white shadow flex justify-between items-center p-4">
			<h1 class="text-xl font-semibold">Dashboard</h1>

			<div class="flex items-center gap-4">
				<div class="flex flex-col text-right">
					<span class="text-gray-800 font-semibold">Welcome, {userName}</span>
					{#if district}
						<span class="text-purple-600 text-sm font-medium">📍 {district} District</span>
					{/if}
					</div>
				<button
					class="bg-purple-500 text-white px-4 py-1 rounded hover:bg-red-600"
					on:click={logout}>
					Logout
				</button>
			</div>
		</header>

		<!-- Dashboard Cards -->
		<main class="p-6">

  <!-- District heading -->
  <h2 class="text-lg font-bold text-gray-700 mb-4">
    {#if district}
      Applications — {district} District
    {:else}
      All Applications
    {/if}
  </h2>

  <!-- Loading -->
  {#if isLoading}
    <div class="flex items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span class="ml-3 text-gray-600">Loading {district} applications...</span>
    </div>

  {:else if fetchError}
    <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{fetchError}</div>

  {:else}

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {#each stats as stat}
        <div class="bg-white rounded-xl shadow p-6 border-l-4 {stat.color}">
          <h2 class="text-gray-500 text-sm">{stat.title}</h2>
          <p class="text-3xl font-bold mt-2">{stat.value}</p>
        </div>
      {/each}
    </div>

    <!-- Applications Table -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="p-4 border-b">
        <h3 class="font-semibold text-gray-700">Applications List — {district}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 text-left">Form No</th>
              <th class="px-4 py-3 text-left">Name</th>
              <th class="px-4 py-3 text-left">Mobile</th>
              <th class="px-4 py-3 text-left">Email</th>
              <th class="px-4 py-3 text-left">District</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-left">Updated</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each applications as app}
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs">{app.form_no || '—'}</td>
                <td class="px-4 py-3 font-medium">{app.name || '—'}</td>
                <td class="px-4 py-3">{app.mobile || '—'}</td>
                <td class="px-4 py-3">{app.email || '—'}</td>
                <td class="px-4 py-3">{app.district_name || '—'}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold
                    {app.application_status === 'approved' ? 'bg-green-100 text-green-700' :
                     app.application_status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                     app.application_status === 'rejected'  ? 'bg-red-100 text-red-700' :
                     'bg-yellow-100 text-yellow-700'}">
                    {app.application_status || 'pending'}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">
                  {app.updated_at ? new Date(app.updated_at).toLocaleDateString('en-IN') : '—'}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-400">
                  No applications found for {district} district
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

  {/if}
</main>

	</div>

</div>