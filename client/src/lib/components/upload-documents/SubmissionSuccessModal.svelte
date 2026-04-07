<script>
// @ts-nocheck

  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';

  export let show = false;
  export let applicationId = null;

  const dispatch = createEventDispatcher();

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  function handleGoToDashboard() {
    dispatch('goToDashboard');
  }
</script>

<svelte:head>
  <style>
    @keyframes bounce-in {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .animate-bounce-in {
      animation: bounce-in 0.5s ease-out;
    }
    
    @keyframes confetti {
      0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      animation: confetti 3s ease-out forwards;
    }
  </style>
</svelte:head>

{#if show}
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    
    <!-- Modal Card -->
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform scale-100 animate-bounce-in relative overflow-hidden">
      
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-green-100 opacity-20 rounded-full -mr-16 -mt-16"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 opacity-20 rounded-full -ml-12 -mb-12"></div>

      <!-- Success Icon with Animation -->
      <div class="relative z-10">
        <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <!-- Success Message -->
        <h2 class="text-3xl font-bold text-gray-900 mb-3">
          {t.uploadDocuments?.successModal?.title || t.success.title}
        </h2>
        
        <p class="text-gray-600 mb-6 leading-relaxed">
          {t.uploadDocuments?.successModal?.message || t.success.successMessage}
        </p>

        <!-- Application ID Card -->
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 mb-6 border border-purple-200">
          <p class="text-sm text-gray-600 mb-2 font-medium">
            {t.uploadDocuments?.successModal?.applicationIdLabel || t.success.applicationIdLabel}
          </p>
          <div class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-2xl font-bold text-purple-600">
              {t.success.applicationId} {applicationId}
            </p>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            {t.uploadDocuments?.successModal?.saveIdNote || t.success.saveIdMessage}
          </p>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-gray-700">
              <p class="font-semibold text-blue-900 mb-1">
                {t.uploadDocuments?.successModal?.whatNextTitle || t.success.nextStepsTitle}
              </p>
              <ul class="space-y-1 text-xs">
                <li>• {t.uploadDocuments?.successModal?.step1 || t.success.reviewDocuments}</li>
                <li>• {t.uploadDocuments?.successModal?.step2 || t.success.receiveUpdates}</li>
                <li>• {t.uploadDocuments?.successModal?.step3 || t.success.checkDashboard}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Go to Dashboard Button -->
        <button
          on:click={handleGoToDashboard}
          class="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          <span>{t.uploadDocuments?.successModal?.dashboardButton || t.success.goToDashboard}</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>

        <p class="text-xs text-gray-500 mt-4">
          {t.uploadDocuments?.successModal?.thankYou || t.success.thankYou}
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Additional component-specific styles if needed */
</style>