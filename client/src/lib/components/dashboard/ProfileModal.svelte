<script>
  import { createEventDispatcher } from 'svelte';
  import { customSendOtp, customVerifyOtp, customChangePassword } from '$lib/api/authApi.js';
   import { i18n } from '$lib/i18n';
    import { logout } from '$lib/stores/userStore';

  export let locale = 'en';

  $: t = i18n[locale]?.logout || i18n.en.logout;
  
  export let showProfileModal = false;
  export let userData = {
    name: "Guest User",
    phone: "",
    username: ""
  };

  
  const dispatch = createEventDispatcher();
  
  let showLogoutConfirm = false;

  //chnage password 

  // ADD these after the existing let variables:
let showChangePassword = false;
let showOtpScreen = false;
let oldPassword = '';
let newPassword = '';
let confirmPassword = '';
let showOld = false;
let showNew = false;
let showConfirm = false;
let otpValue = '';
let cpError = '';

let otpUid = '';
let isSendingOtp = false;
let isVerifying = false;
  
 function closeModal() {
  showProfileModal = false;
  showLogoutConfirm = false;
  showChangePassword = false;
  showOtpScreen = false;
  cpError = '';
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



   
function openChangePassword() {
  showChangePassword = true;
  showOtpScreen = false;
  oldPassword = ''; newPassword = ''; confirmPassword = '';
  otpValue = ''; cpError = '';
}

async function handleSendOtp() {
  cpError = '';
  if (!newPassword || newPassword.length < 6) { cpError = 'New password must be at least 6 characters.'; return; }
  if (newPassword !== confirmPassword) { cpError = 'Passwords do not match.'; return; }

  isSendingOtp = true;
  try {
    const result = await customSendOtp({ mobileNumber: userData.phone, name: userData.name, id: null });
    if (result.error !== 0) { cpError = result.errorMsg || 'Failed to send OTP.'; return; }
    otpUid = result.uid;
    showOtpScreen = true;
  } catch(e) {
    cpError = 'Failed to send OTP. Try again.';
  } finally {
    isSendingOtp = false;
  }
}


let showPasswordSuccess = false;

async function handleVerifyOtp() {
  cpError = '';
  if (!otpValue || otpValue.length < 4) { cpError = 'Enter a valid OTP.'; return; }

  isVerifying = true;
  try {
    // Step 1: Verify OTP
    const verifyResult = await customVerifyOtp({ uid: otpUid, otp: otpValue, dataName: null });
    if (verifyResult.error !== 0) { cpError = verifyResult.errorMsg || 'Invalid OTP.'; return; }

    // Step 2: Change password
    const changeResult = await customChangePassword({ mobile: userData.phone, password: newPassword, userId: null });
    if (changeResult.error !== 0) { cpError = changeResult.errorMsg || 'Failed to change password.'; return; }

    showChangePassword = false;
    showOtpScreen = false;
    showPasswordSuccess = true;
    setTimeout(() => showPasswordSuccess = false, 3000);
  } catch(e) {
    cpError = 'Something went wrong. Try again.';
  } finally {
    isVerifying = false;
  }
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

    {#if showPasswordSuccess}
        <div class="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold text-sm">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
         {t.passwordChangedSuccessfully}
        </div>
      {/if}
      
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

        {#if !showLogoutConfirm && !showChangePassword && !showOtpScreen}      
        <div class="text-center">
          <!-- Profile Photo -->
          <div class="mb-6">
                <div class="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full shadow-lg ring-4 ring-purple-100 overflow-hidden">
                  {#if userData.photo}
                    <img 
                      src={userData.photo} 
                      alt={userData.name}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <div class="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                      {getInitials(userData.name)}
                    </div>
                  {/if}
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
              on:click={openChangePassword}
              class="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              <span>{t.changePassword}</span>
            </button>

            <button
              on:click={openLogoutConfirm}
              class="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      
        
        {:else if showChangePassword && !showOtpScreen}

        <div>
    <div class="flex items-center gap-3 mb-6">
      <button on:click={() => showChangePassword = false} class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
      </button>
      <h3 class="text-xl font-bold text-gray-900">{t.changePassword}</h3>
    </div>
    <div class="space-y-4">
     
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">{t.newPassword}</label>
        <div class="relative">
          <input type={showNew ? 'text' : 'password'} value={newPassword} on:input={(e) => newPassword = e.target.value} placeholder={t.enterNewPassword} class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm pr-12"/>
          <button type="button" on:click={() => showNew = !showNew} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{#if showNew}<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>{:else}<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>{/if}</svg>
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">{t.confirmNewPassword}</label>
        <div class="relative">
         <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} on:input={(e) => confirmPassword = e.target.value} placeholder={t.reEnterNewPassword} class="w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-sm pr-12 {confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : confirmPassword && confirmPassword === newPassword ? 'border-green-400' : 'border-gray-200 focus:border-purple-500'}"/>
          <button type="button" on:click={() => showConfirm = !showConfirm} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{#if showConfirm}<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>{:else}<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>{/if}</svg>
          </button>
        </div>
        {#if confirmPassword && confirmPassword !== newPassword}<p class="text-xs text-red-500 mt-1">{t.passwordsDoNotMatch}</p>
        {:else if confirmPassword && confirmPassword === newPassword}<p class="text-xs text-green-600 mt-1">✓ {t.passwordsMatch}</p>{/if}
      </div>
      {#if cpError}
        <div class="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {cpError}
        </div>
      {/if}
      <p class="text-xs text-gray-500 text-center">{t.otpWillBeSent} <span class="font-semibold text-purple-700">{userData.phone}</span></p>
        <button on:click={handleSendOtp} disabled={isSendingOtp} class="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-md">
          {isSendingOtp ? t.sendingOtp : t.sendOtpChangePassword}
        </button>
    </div>
  </div>

   {:else if showOtpScreen}

   <div>
    <div class="flex items-center gap-3 mb-6">
      <button on:click={() => showOtpScreen = false} class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      </button>
      <h3 class="text-xl font-bold text-gray-900">{t.verifyOtp}</h3>
    </div>
    <div class="text-center mb-6">
      <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      </div>
      <p class="text-sm text-gray-600">{t.otpSentTo} <span class="font-semibold text-purple-700">{userData.phone}</span></p>
      <p class="text-xs text-gray-400 mt-1">{t.enterOtpToConfirm}</p>
    </div>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">{t.enterOtp}</label>
        <input type="text" bind:value={otpValue} placeholder="_ _ _ _ _ _" maxlength="6" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-center text-2xl font-bold tracking-[0.5em]"/>
      </div>
      {#if cpError}
        <div class="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {cpError}
        </div>
      {/if}

        <button on:click={handleVerifyOtp} disabled={isVerifying} class="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-md">
    {isVerifying ? t.verifying: t.verifyChangePassword}
  </button>

      <div class="text-center">
        <span class="text-sm text-gray-500">{t.didntReceiveOtp} </span>
        <button on:click={() => { otpValue = ''; cpError = ''; }} class="text-sm text-purple-600 font-semibold hover:text-purple-800">{t.resendOtp}</button>
      </div>
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
            {t.sureLogout}
          </h3>
          <p class="text-gray-600 mb-8">
            {t.loginAgain}
          </p>

          <div class="flex gap-3">
            <button
              on:click={cancelLogout}
              class="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              {t.cancel}
            </button>
            <button
              on:click={confirmLogout}
              class="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {t.yesLogout}
            </button>
          </div>
        </div>
      {/if}


    </div>
  </div>

  
{/if}