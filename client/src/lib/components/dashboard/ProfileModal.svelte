<script>
  import { createEventDispatcher } from 'svelte';
  
  export let showProfileModal = false;
  export let userData = {
    name: "Guest User",
    phone: "",
    username: ""
  };
  export let locale = 'en';
  
  const dispatch = createEventDispatcher();
  
  let showLogoutConfirm = false;
  
  function closeModal() {
    showProfileModal = false;
    showLogoutConfirm = false;
    dispatch('close');
  }
  
  function openLogoutConfirm() {
    showLogoutConfirm = true;
  }
  
  function cancelLogout() {
    showLogoutConfirm = false;
  }
  
  function confirmLogout() {
    showLogoutConfirm = false;
    showProfileModal = false;
    dispatch('logout');
  }
  
  function changePassword() {
    dispatch('changePassword');
  }
  
  // Get initials for avatar
  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
  
  // Handle backdrop click
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
</script>

{#if showProfileModal}
  <!-- Modal Backdrop -->
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === 'Escape' && closeModal()}
    role="button"
    tabindex="-1"
  >
    <!-- Modal Content -->
    <div 
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative 
       transform transition-all duration-200 ease-out 
       opacity-100 scale-100"
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      
      <!-- Close Button -->
      <button 
        on:click={closeModal}
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
        aria-label="Close modal"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      {#if !showLogoutConfirm}
        <!-- Profile Content -->
        <div class="text-center">
          <!-- Profile Photo -->
          <div class="mb-6">
            <div class="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg ring-4 ring-purple-100">
              {getInitials(userData.name)}
            </div>
          </div>

          <!-- User Info -->
          <h2 
            id="profile-modal-title"
            class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
          >
            {userData.name}
          </h2>
          
          <div class="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span class="text-sm sm:text-base">{userData.phone || 'No phone number'}</span>
          </div>

          {#if userData.username}
            <p class="text-sm text-gray-500 mb-8">@{userData.username}</p>
          {:else}
            <div class="mb-8"></div>
          {/if}

          <!-- Action Buttons -->
          <div class="space-y-3 mt-8">
            <button
              on:click={changePassword}
              class="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              <span>Change Password</span>
            </button>

            <button
              on:click={openLogoutConfirm}
              class="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      {:else}
        <!-- Logout Confirmation -->
        <div class="text-center py-6">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Are you sure to logout?
          </h3>
          <p class="text-gray-600 mb-8">
            You will need to login again to access your account
          </p>

          <div class="flex gap-3">
            <button
              on:click={cancelLogout}
              class="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              on:click={confirmLogout}
              class="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}