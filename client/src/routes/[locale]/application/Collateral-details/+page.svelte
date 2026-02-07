<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  
  import PropertyCollateralModal from '$lib/components/collateral/PropertyCollateralModal.svelte';
  import FDCollateralModal from '$lib/components/collateral/FDCollateralModal.svelte';
  import LICCollateralModal from '$lib/components/collateral/LICCollateralModal.svelte';
  import GovtEmployeeGuarantorModal from '$lib/components/collateral/GovtEmployeeGuarantorModal.svelte';
  import { onMount } from 'svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];


  let userData = null;
  let showProfileModal = false;



  onMount(() => {
  if (typeof window !== 'undefined') {
    const authUser = sessionStorage.getItem('authUser');

    if (!authUser) {
      goto(`/${locale}/login`);
    }
    else {
       const user = JSON.parse(authUser);
        userData = {
          name: user.name || "Guest User",
          phone: user.mobile || "",
          username: user.username || ""
        };
    }
  }

  const savedCollaterals = sessionStorage.getItem('collateralItems');
    if (savedCollaterals) {
      try {
        collateralItems = JSON.parse(savedCollaterals);
        console.log('Loaded existing collateral items:', collateralItems);
      } catch (error) {
        console.error('Error parsing collateral items:', error);
        collateralItems = [];
      }
    }
});

  let currentStep = 5;
  let isSubmitting = false;
  
  let collateralItems = [];
  
  let showPropertyModal = false;
  let showFDModal = false;
  let showLICModal = false;
  let showGovtEmployeeModal = false;

  function openPropertyModal() {
    showPropertyModal = true;
  }

  function openFDModal() {
    showFDModal = true;
  }

  function openLICModal() {
    showLICModal = true;
  }

  function openGovtEmployeeModal() {
    showGovtEmployeeModal = true;
  }

  function closePropertyModal() {
    showPropertyModal = false;
  }

  function closeFDModal() {
    showFDModal = false;
  }

  function closeLICModal() {
    showLICModal = false;
  }

  function closeGovtEmployeeModal() {
    showGovtEmployeeModal = false;
  }

  function savePropertyCollateral(data) {
    collateralItems = [...collateralItems, data];
    showPropertyModal = false;
  }

  function saveFDCollateral(data) {
    collateralItems = [...collateralItems, data];
    showFDModal = false;
  }

  function saveLICCollateral(data) {
    collateralItems = [...collateralItems, data];
    showLICModal = false;
  }

  function saveGovtEmployee(data) {
    collateralItems = [...collateralItems, data];
    showGovtEmployeeModal = false;
  }

  function deleteCollateral(id) {
    if (confirm('Are you sure you want to delete this collateral?')) {
      collateralItems = collateralItems.filter(item => item.id !== id);
    }
  }

  function editCollateral(item) {
    collateralItems = collateralItems.filter(i => i.id !== item.id);
    
    if (item.type === 'property') {
      showPropertyModal = true;
    } else if (item.type === 'fd') {
      showFDModal = true;
    } else if (item.type === 'lic') {
      showLICModal = true;
    }else if (item.type === 'govt-employee') {
      showGovtEmployeeModal = true;
    }
  }

  function handleBack() {
    goto(`/${locale}/dashboard`);
  }

  function handleCancel() {
    goto(`/${locale}/application/guarantor-details`);
  }

  // async function handleProceed() {
  //   if (collateralItems.length === 0) {
  //     alert('Please add at least one collateral');
  //     return;
  //   }

  //   isSubmitting = true;
  //   try {
  //     // TODO: API call to save collateral data
  //     // const response = await fetch('/api/application/collateral-details', {
  //     //   method: 'POST',
  //     //   headers: { 'Content-Type': 'application/json' },
  //     //   body: JSON.stringify({ collaterals: collateralItems })
  //     // });
      
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     goto(`/${locale}/application/upload-documents`);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert('Failed to submit. Please try again.');
  //   } finally {
  //     isSubmitting = false;
  //   }
  // }


//   async function handleProceed() {
//   if (collateralItems.length === 0) {
//     alert('Please add at least one collateral');
//     return;
//   }

//   isSubmitting = true;
//   try {
//     // Save collateral items to session storage
//     sessionStorage.setItem('collateralItems', JSON.stringify(collateralItems));
    
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     goto(`/${locale}/application/upload-documents`);
//   } catch (error) {
//     console.error('Error:', error);
//     alert('Failed to submit. Please try again.');
//   } finally {
//     isSubmitting = false;
//   }
// }




async function handleProceed() {
  if (collateralItems.length === 0) {
    alert('Please add at least one collateral');
    return;
  }

  isSubmitting = true;
  try {
    // Save collateral items to session storage WITH DISPLAY INFO
    const collateralDataToSave = collateralItems.map(item => ({
      ...item,
      // Add display name based on type for error messages
      displayName: item.type === 'property' 
        ? `${t.collateralDetails?.propertyCollateral} - ${item.village}`
        : item.type === 'fd' 
        ? `${t.collateralDetails?.fdCollateral} - ${item.bankName}`
        : item.type === 'lic'
        ? `${t.collateralDetails?.licCollateral} - ${item.policyName}`
        : item.type === 'govt-employee'
        ? `${t.collateralDetails?.govtEmployee} - ${item.fullName}`
        : item.type
    }));
    
    sessionStorage.setItem('collateralItems', JSON.stringify(collateralDataToSave));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    goto(`/${locale}/application/upload-documents`);
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to submit. Please try again.');
  } finally {
    isSubmitting = false;
  }
}


</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100">
  <DashboardHeader
        {t}
        {locale}
        {userData}
        on:openProfile={() => showProfileModal = true}
      />

      <ProfileModal
        {userData}
        {locale}
        bind:showProfileModal
        on:close={() => showProfileModal = false}
        on:logout={() => {
          sessionStorage.removeItem('authUser');
          goto(`/${locale}/login`);
        }}
      />

  <ApplicationStepper {currentStep} {locale} />

  <div class="w-full px-2 sm:px-4 md:px-6 lg:px-8 pb-12 overflow-x-hidden">
    <div class="max-w-[1400px] mx-auto">
    
      <div class="mb-5 flex items-center justify-between gap-3">
                <div class="flex-1">
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {t.collateralDetails?.pageTitle}
          </h2>
        </div>

        <button
          on:click={handleBack}
          class="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex-shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="hidden sm:inline">{t.applicationStart?.backToHome || 'Back to Home'}</span>
        </button>

      </div>


    <div class="mb-6 bg-gray-100 rounded-xl p-4 sm:p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          on:click={openPropertyModal}
          class="flex items-center justify-center gap-3 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <div class="text-left">
            <div class="font-bold">{t.collateralDetails?.addPropertyButton}</div>
          </div>
        </button>

        <!-- FD Collateral -->
        <button
          on:click={openFDModal}
          class="flex items-center justify-center gap-3 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <div class="text-left">
            <div class="font-bold">{t.collateralDetails?.addFDButton}</div>
          </div>
        </button>

        <!-- LIC Collateral -->
        <button
          on:click={openLICModal}
          class="flex items-center justify-center gap-3 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <div class="text-left">
            <div class="font-bold">{t.collateralDetails?.addLICButton}</div>
          </div>
        </button>

        <!-- Government Employee -->
        <button
          on:click={openGovtEmployeeModal}
          class="flex items-center justify-center gap-3 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md text-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <div class="text-left">
            <div class="font-bold">{t.collateralDetails?.addGovtPropertyButton}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Collateral Items Display -->
    {#if collateralItems.length > 0}
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {#each collateralItems as item (item.id)}
          <div class="bg-white rounded-xl shadow-md p-4 relative hover:shadow-lg transition-shadow">
            <button
              on:click={() => deleteCollateral(item.id)}
              class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
              title={t.collateralDetails?.deleteTooltip}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>

            <button
              on:click={() => editCollateral(item)}
              class="absolute top-3 right-12 w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
              title={t.collateralDetails?.editTooltip}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>

            <div class="pr-20">
              {#if item.type === 'property'}
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  <h4 class="font-bold text-gray-900">{t.collateralDetails?.propertyCollateral}</h4>
                </div>
                <div class="space-y-1 text-sm text-gray-600">
                  <p><span class="font-medium">{t.collateralDetails?.type}:</span> {item.propertyType}</p>
                  <p><span class="font-medium">{t.collateralDetails?.surveyNo}:</span> {item.surveyNo}</p>
                  <p><span class="font-medium">{t.collateralDetails?.village}:</span> {item.village}</p>
                  <p><span class="font-medium">{t.collateralDetails?.propertyValue}:</span> ₹{item.propertyValue}</p>
                </div>

              {:else if item.type === 'fd'}
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h4 class="font-bold text-gray-900">{t.collateralDetails?.fdCollateral}</h4>
                </div>
                <div class="space-y-1 text-sm text-gray-600">
                  <p><span class="font-medium">{t.collateralDetails?.bankName}:</span> {item.bankName}</p>
                  <p><span class="font-medium">{t.collateralDetails?.branchName}:</span> {item.branchName}</p>
                  <p><span class="font-medium">{t.collateralDetails?.fdDepositAmount}:</span> ₹{item.fdDepositAmount}</p>
                  <p><span class="font-medium">{t.collateralDetails?.fdMaturityDate}:</span> {item.fdMaturityDate}</p>
                </div>

              {:else if item.type === 'lic'}
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <h4 class="font-bold text-gray-900">{t.collateralDetails?.licCollateral}</h4>
                </div>
                <div class="space-y-1 text-sm text-gray-600">
                  <p><span class="font-medium">{t.collateralDetails?.policyName}:</span> {item.policyName}</p>
                  <p><span class="font-medium">{t.collateralDetails?.policyType}:</span> {item.policyType}</p>
                  <p><span class="font-medium">{t.collateralDetails?.policyReceiptNo}:</span> {item.policyReceiptNo}</p>
                  <p><span class="font-medium">{t.collateralDetails?.policySurrenderValue}:</span> ₹{item.policySurrenderValue}</p>
                </div>
              {:else if item.type === 'govt-employee'}
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <h4 class="font-bold text-gray-900">{t.collateralDetails?.govtEmployee}</h4>
                </div>
                <div class="space-y-1 text-sm text-gray-600">
                  <p><span class="font-medium">{t.collateralDetails?.fullName}:</span> {item.fullName}</p>
                  <p><span class="font-medium">{t.collateralDetails?.departmentName}:</span> {item.departmentName}</p>
                  <p><span class="font-medium">{t.collateralDetails?.designation}:</span> {item.designation}</p>
                  <p><span class="font-medium">{t.collateralDetails?.employeeID}:</span> {item.employeeID}</p>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-white rounded-xl shadow-md p-12 text-center mb-6">
        <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-gray-500 text-lg font-medium">{t.collateralDetails?.noCollateralTitle}</p>
        <p class="text-gray-400 text-sm mt-1">{t.collateralDetails?.noCollateralSubtitle}</p>
      </div>
    {/if}

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row justify-center gap-3">
        <button
          on:click={handleCancel}
          class="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <!-- Left Arrow -->
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span>{t.collateralDetails?.cancelButton}</span>
        </button>
      <button
        on:click={handleProceed}
        disabled={isSubmitting}
        class="inline-flex items-center justify-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-md text-sm"
      >
        {#if isSubmitting}
          <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{t.collateralDetails?.processingButton}</span>
        {:else}
          <span>{t.collateralDetails?.proceedButton}</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        {/if}
      </button>
    </div>

    </div>
  </div>5678448993
</div>

<!-- Modals -->
 
<PropertyCollateralModal 
  show={showPropertyModal} 
  onSave={savePropertyCollateral} 
  onCancel={closePropertyModal} 
/>

<FDCollateralModal 
  show={showFDModal} 
  onSave={saveFDCollateral} 
  onCancel={closeFDModal} 
/>

<LICCollateralModal 
  show={showLICModal} 
  onSave={saveLICCollateral} 
  onCancel={closeLICModal} 
/>

<GovtEmployeeGuarantorModal 
  show={showGovtEmployeeModal} 
  onSave={saveGovtEmployee} 
  onCancel={closeGovtEmployeeModal} 
/>