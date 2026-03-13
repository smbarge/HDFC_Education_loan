<script>
	import { goto } from '$app/navigation';
	 import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import { onMount } from 'svelte';



	$: locale = $page.params.locale || 'en';
	$: t = i18n[locale];

	let userName = "Admin";

	let stats = [
		{ title: "Total Applications", value: 120 },
		{ title: "Approved", value: 80 },
		{ title: "Pending", value: 30 },
		{ title: "Rejected", value: 10 }
	];

	onMount(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) goto(`/${locale}/admin/login`);

});

	function logout() {
    localStorage.removeItem("adminToken");   // ✅ matches what login saves
    localStorage.removeItem("refreshToken"); // ✅ also clear refresh token
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
				<span class="text-gray-600">Welcome, {userName}</span>
				<button
					class="bg-purple-500 text-white px-4 py-1 rounded hover:bg-red-600"
					on:click={logout}>
					Logout
				</button>
			</div>
		</header>

		<!-- Dashboard Cards -->
		<main class="p-6">

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

				{#each stats as stat}
					<div class="bg-white rounded-xl shadow p-6">
						<h2 class="text-gray-500 text-sm">{stat.title}</h2>
						<p class="text-3xl font-bold mt-2">{stat.value}</p>
					</div>
				{/each}

			</div>

		</main>

	</div>

</div>