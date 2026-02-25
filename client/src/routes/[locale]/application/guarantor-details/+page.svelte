<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import { onMount } from 'svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import guarantorDetailsValidation from '$lib/validation/application/guarantorDetails';
  import { user, logout as logoutStore, applicationId } from '$lib/stores/userStore';



  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];


  let userData = null;
  let showProfileModal = false;

  $: userData = $user ? {
  name: $user.name || "Guest User",
  phone: $user.mobile || "",
  username: $user.username || "",
  id: $user.id || null
} : null;


  onMount(() => {
  if (!$user) {
    goto(`/${locale}/login`);
    return;
  }

  if (!$applicationId) {
    goto(`/${locale}/dashboard`);
    return;
  }
});

  let currentStep = 4;
  let isSubmitting = false;
  let errors = {};
  
  let selectedTab = 'guarantor';
  
  let formData = {
    guarantorCommunity: '',
    guarantorFullName: '',
    guarantorDOB: '',
    guarantorGender: '',
    guarantorAadhar: '',
    guarantorPAN: '',
    guarantorMobile: '',
    guarantorEmail: '',
    currentStreetAddress: '',
    currentDistrict: '',
    currentTaluka: '',
    currentPlace: '',
    currentArea: '',
    currentPinCode: '',
    sameAsCurrentAddress: false,
    permanentStreetAddress: '',
    permanentDistrict: '',
    permanentTaluka: '',
    permanentPlace: '',
    permanentArea: '',
    permanentPinCode: '',
    maritalStatus: '',
    educationalQualification: '',
    guardianOccupation: '',
    annualIncome: '',
    previousSurety: '',
    suretyDetails: ''
  };

  const communities = [
    { value: 'Muslim', label: { en: 'Muslim', hi: 'मुस्लिम', mr: 'मुस्लिम' } },
    { value: 'Christian', label: { en: 'Christian', hi: 'ईसाई', mr: 'ख्रिश्चन' } },
    { value: 'Sikh', label: { en: 'Sikh', hi: 'शीख', mr: 'शीख' } },
    { value: 'Buddhist', label: { en: 'Buddhist', hi: 'बौद्ध', mr: 'बौद्ध' } },
    { value: 'Jain', label: { en: 'Jain', hi: 'जैन', mr: 'जैन' } },
    { value: 'Parsi', label: { en: 'Parsi', hi: 'पारसी', mr: 'पारशी' } },
    { value: 'Hindu', label: { en: 'Hindu', hi: 'हिन्दू', mr: 'हिंदू' } },
    { value: 'Others', label: { en: 'Others', hi: 'अन्य', mr: 'अन्य' } },
    { value: 'Jew', label: { en: 'Jew', hi: 'ज्यू', mr: 'ज्यू' } }
  ];

  const districts = [
    { value: '', label: 'Select District' },
    { value: 'AHMEDNAGAR', label: 'AHMEDNAGAR - अहमदनगर' },
    { value: 'AKOLA', label: 'AKOLA - अकोला' },
    { value: 'AMRAVATI', label: 'AMRAVATI - अमरावती' },
    { value: 'BEED', label: 'BEED - बीड' },
    { value: 'PUNE', label: 'PUNE - पुणे' },
    { value: 'MUMBAI', label: 'MUMBAI - मुंबई' },
    { value: 'NAGPUR', label: 'NAGPUR - नागपूर' }
  ];

  const talukas = [
    { value: '', label: 'Select taluka' },
    { value: 'AMBAJOGAI', label: 'AMBAJOGAI - अंबाजोगाई' },
    { value: 'ASHTI', label: 'ASHTI - आष्टी' },
    { value: 'BEED', label: 'BEED - बीड' },
    { value: 'DHARUR', label: 'DHARUR - धारूर' },
    { value: 'GEORAI', label: 'GEORAI - गेवराई' },
    { value: 'KAIJ', label: 'KAIJ - काईज' },
    { value: 'MAJALGAON', label: 'MAJALGAON - मांजळगाव' },
    { value: 'PARLI', label: 'PARLI - परळी' }
  ];

  const areas = [
    { value: '', label: { en: 'Select Area', hi: 'क्षेत्र चुनें', mr: 'परिसर निवडा' } },
    { value: 'Urban', label: { en: 'Urban', hi: 'शहरी', mr: 'शहरी' } },
    { value: 'Rural', label: { en: 'Rural', hi: 'ग्रामीण', mr: 'ग्रामीण' } }
  ];

  const maritalStatusOptions = [
    { value: '', label: { en: 'Select status', hi: 'स्थिति चुनें', mr: 'स्थिती निवडा' } },
    { value: 'Unmarried', label: { en: 'Unmarried', hi: 'अविवाहित', mr: 'अविवाहित' } },
    { value: 'Married', label: { en: 'Married', hi: 'विवाहित', mr: 'विवाहित' } },
    { value: 'Divorced', label: { en: 'Divorced', hi: 'तलाकशुदा', mr: 'घटस्फोटित' } },
    { value: 'Separated', label: { en: 'Separated', hi: 'वेगळे राहणारे', mr: 'वेगळे राहणारे' } },
    { value: 'Widow', label: { en: 'Widow', hi: 'विधवा', mr: 'विधवा' } },
    { value: 'Widower', label: { en: 'Widower', hi: 'विधुर', mr: 'विधुर' } }
  ];

  const educationalQualifications = [
    { value: '', label: { en: 'Select status', hi: 'स्थिति चुनें', mr: 'स्थिती निवडा' } },
    { value: 'No Formal Education', label: { en: 'No Formal Education', hi: 'कोई औपचारिक शिक्षा नहीं', mr: 'कोणतीही औपचारिक शिक्षा नाही' } },
    { value: 'Primary Education', label: { en: 'Primary Education', hi: 'प्राथमिक शिक्षा', mr: 'प्राथमिक शिक्षण' } },
    { value: 'Secondary Education', label: { en: 'Secondary Education', hi: 'माध्यमिक शिक्षा', mr: 'माध्यमिक शिक्षण' } },
    { value: 'Higher Secondary Education', label: { en: 'Higher Secondary Education', hi: 'उच्च माध्यमिक शिक्षा', mr: 'उच्च माध्यमिक शिक्षण' } },
    { value: 'Diploma', label: { en: 'Diploma', hi: 'डिप्लोमा', mr: 'डिप्लोमा' } },
    { value: "Bachelor's Degree", label: { en: "Bachelor's Degree", hi: 'स्नातक', mr: 'स्नातक' } },
    { value: "Master's Degree", label: { en: "Master's Degree", hi: "मास्टर्स डिग्री", mr: "मास्टर्स डिग्री" } },
    { value: 'Doctorate (PhD)', label: { en: 'Doctorate (PhD)', hi: 'डॉक्टरेट (पीएचडी)', mr: 'डॉक्टरेट (पीएचडी)' } },
    { value: 'Post-Doctoral', label: { en: 'Post-Doctoral', hi: 'पोस्ट-डॉक्टरल', mr: 'पोस्ट-डॉक्टरल' } },
    { value: 'Vocational Training', label: { en: 'Vocational Training', hi: 'व्यावसायिक प्रशिक्षण', mr: 'व्यावसायिक प्रशिक्षण' } }
  ];

  const occupations = [
    { value: '', label: { en: 'Select occupation', hi: 'व्यवसाय चुनें', mr: 'व्यवसाय निवडा' } },
    { value: 'Salaried Employee', label: { en: 'Salaried Employee', hi: 'नौकरी कर्मचारी', mr: 'नोकरी कर्मचारी' } },
    { value: 'Self-Employed Professional', label: { en: 'Self-Employed Professional', hi: 'स्वरोजगार व्यावसायिक', mr: 'स्वयंरोजगार व्यावसायिक' } },
    { value: 'Business Owner', label: { en: 'Business Owner', hi: 'व्यवसाय मालिक', mr: 'व्यवसाय मालक' } },
    { value: 'Government Employee', label: { en: 'Government Employee', hi: 'शासकीय कर्मचारी', mr: 'शासकीय कर्मचारी' } },
    { value: 'Farmer', label: { en: 'Farmer', hi: 'शेतकरी', mr: 'शेतकरी' } },
    { value: 'Daily Wage Worker', label: { en: 'Daily Wage Worker', hi: 'दिहाड़ी काम करणारे मजदूर', mr: 'दिवसाचा काम करणारे मजूर' } },
    { value: 'Retired', label: { en: 'Retired', hi: 'निवृत्त', mr: 'निवृत्त' } },
    { value: 'Housewife / Homemaker', label: { en: 'Housewife / Homemaker', hi: 'गृहिणी', mr: 'गृहिणी' } },
    { value: 'Student', label: { en: 'Student', hi: 'विद्यार्थी', mr: 'विद्यार्थी' } },
    { value: 'Unemployed', label: { en: 'Unemployed', hi: 'बेकार', mr: 'बेकार' } },
    { value: 'Other', label: { en: 'Other', hi: 'इतर', mr: 'इतर' } }
  ];

  $: if (formData.sameAsCurrentAddress) {
    formData.permanentStreetAddress = formData.currentStreetAddress;
    formData.permanentDistrict = formData.currentDistrict;
    formData.permanentTaluka = formData.currentTaluka;
    formData.permanentPlace = formData.currentPlace;
    formData.permanentArea = formData.currentArea;
    formData.permanentPinCode = formData.currentPinCode;
  }

 function validateField(fieldName) {
  const result = guarantorDetailsValidation(formData, t);
  const fieldErrors = result.getErrors();
  
  if (fieldErrors[fieldName]) {
    errors = { ...errors, [fieldName]: fieldErrors[fieldName] };
  } else {
    const { [fieldName]: _, ...rest } = errors;
    errors = rest;
  }
}

function validateForm() {
  const result = guarantorDetailsValidation(formData, t);
  errors = result.getErrors();
  return result.isValid();
}

  // async function handleProceed() {
  //   if (!validateForm()) {
  //     const firstErrorElement = document.querySelector('.error-message');
  //     if (firstErrorElement) {
  //       firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     }
  //     return;
  //   }

  //   isSubmitting = true;

  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     goto(`/${locale}/application/Collateral-details`);
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //     alert('Failed to submit form. Please try again.');
  //   } finally {
  //     isSubmitting = false;
  //   }
  // }

//   async function handleProceed() {
//   if (!validateForm()) {
//     const firstErrorElement = document.querySelector('.error-message');
//     if (firstErrorElement) {
//       firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//     return;
//   }

//   isSubmitting = true;

//   try {
//     // Save guarantor data to session storage
//     const guarantorData = {
//       type: 'guarantor', 
//       ...formData
//     };
//     sessionStorage.setItem('guarantorData', JSON.stringify(guarantorData));
    
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     goto(`/${locale}/application/Collateral-details`);
//   } catch (error) {
//     console.error('Error submitting form:', error);
//     alert('Failed to submit form. Please try again.');
//   } finally {
//     isSubmitting = false;
//   }
// }


async function handleProceed() {
  const result = guarantorDetailsValidation(formData, t);
  errors = result.getErrors();
  
  if (!result.isValid()) {
    const firstErrorElement = document.querySelector('.error-message');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  isSubmitting = true;

  try {
    // Save guarantor data to session storage WITH DISPLAY INFO
    const guarantorData = {
      type: 'guarantor',
      ...formData,
      displayName: `${formData.guarantorFullName} - ${formData.guarantorMobile}` // For error messages
    };
    sessionStorage.setItem('guarantorData', JSON.stringify(guarantorData));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    goto(`/${locale}/application/Collateral-details`);
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Failed to submit form. Please try again.');
  } finally {
    isSubmitting = false;
  }
}

  function handleBack() {
    goto(`/${locale}/dashboard`);
  }

  function handleCancel() {
    goto(`/${locale}/application/acadamic-info`);
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
            logoutStore();
            goto(`/${locale}/login`);
          }}
      />

  <ApplicationStepper {currentStep} {locale} />

  <div class="w-full px-2 sm:px-4 md:px-6 lg:px-8 pb-12 overflow-x-hidden">
    <div class="max-w-[1400px] mx-auto">
    
    <div class="mb-6 flex items-center justify-between">
      <div class="flex-1 min-w-0">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {t.guarantorDetails?.pageTitle}
        </h2>
      </div>
      <button
        on:click={handleBack}
        class="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex-shrink-0 ml-4"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        <span class="hidden sm:inline">{t.applicationStart?.backToHome || 'Back to Home'}</span>
      </button>
    </div>

    <!-- Guarantor Personal Details Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
           {t.guarantorDetails?.section1Title}
          </h3>
          
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">
          {t.guarantorDetails?.guarantorCommunityLabel}
        </label>
        <div class="flex flex-wrap gap-4">
          {#each communities as community}
            <label class="flex items-center cursor-pointer">
              <input 
                  type="radio" 
                  name="guarantorCommunity" 
                  value={community.value}
                  bind:group={formData.guarantorCommunity}
                  on:change={() => validateField('guarantorCommunity')}  
                  class="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
              <span class="ml-2 text-sm text-gray-700">
                {community.label[locale] || community.label.en}
              </span>
            </label>
          {/each}
        </div>
        {#if errors.guarantorCommunity}
          <p class="error-message mt-2 text-xs text-red-600">{errors.guarantorCommunity}</p>
        {/if}
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.guarantorFullNameLabel}<span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <input
              type="text"
              bind:value={formData.guarantorFullName}
              on:input={() => validateField('guarantorFullName')}
              placeholder={t.guarantorDetails?.guarantorFullNamePlaceholder}
              class="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.guarantorFullName ? 'border-red-500' : 'border-gray-300'}"
            />
          </div>
          {#if errors.guarantorFullName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.guarantorFullName}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.guarantorDOBLabel} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <input
              type="date"
              bind:value={formData.guarantorDOB}
              on:change={() => validateField('guarantorDOB')}
              placeholder="01/01/2001"
              class="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.guarantorDOB ? 'border-red-500' : 'border-gray-300'}"
            />
          </div>
          {#if errors.guarantorDOB}
            <p class="error-message mt-1 text-xs text-red-600">{errors.guarantorDOB}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.guarantorGenderLabel} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.guarantorGender}
            on:change={() => validateField('guarantorGender')}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.guarantorGender ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.guarantorDetails?.guarantorGenderPlaceholder}</option>
            <option value="Male">{t.guarantorDetails?.genderOptions.male}</option>
            <option value="Female">{t.guarantorDetails?.genderOptions.female}</option>
            <option value="Other">{t.guarantorDetails?.genderOptions.other}</option>
          </select>
          {#if errors.guarantorGender}
            <p class="error-message mt-1 text-xs text-red-600">{errors.guarantorGender}</p>
          {/if}
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.guarantorAadharLabel}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <input
              type="text"
              bind:value={formData.guarantorAadhar}
              on:input={() => validateField('guarantorAadhar')}
              placeholder={t.guarantorDetails?.guarantorAadharPlaceholder}
              maxlength="12"
              class="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.guarantorAadhar ? 'border-red-500' : 'border-gray-300'}"
            />
          </div>
          {#if errors.guarantorAadhar}
            <p class="error-message mt-1 text-xs text-red-600">{errors.guarantorAadhar}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
           {t.guarantorDetails?.guarantorPANLabel}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <input
              type="text"
              bind:value={formData.guarantorPAN}
              on:input={() => validateField('guarantorPAN')} 
              placeholder={t.guarantorDetails?.guarantorPANPlaceholder}
              maxlength="10"
              class="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.guarantorPAN ? 'border-red-500' : 'border-gray-300'}"
              style="text-transform: uppercase;"
            />
          </div>
          {#if errors.guarantorPAN}
            <p class="error-message mt-1 text-xs text-red-600">{errors.guarantorPAN}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.guarantorMobileLabel} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <input
              type="text"
              bind:value={formData.guarantorMobile}
              on:input={() => validateField('guarantorMobile')}
              placeholder={t.guarantorDetails?.guarantorMobilePlaceholder}
              maxlength="10"
              class="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.guarantorMobile ? 'border-red-500' : 'border-gray-300'}"
            />
          </div>
          {#if errors.guarantorMobile}
            <p class="error-message mt-1 text-xs text-red-600">{errors.guarantorMobile}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.guarantorEmailLabel}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <input
              type="email"
              bind:value={formData.guarantorEmail}
              on:input={() => validateField('guarantorEmail')} 
              placeholder={t.guarantorDetails?.guarantorEmailPlaceholder}
              class="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.guarantorEmail ? 'border-red-500' : 'border-gray-300'}"
            />
          </div>
          {#if errors.guarantorEmail}
            <p class="error-message mt-1 text-xs text-red-600">{errors.guarantorEmail}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Current Address Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            {t.guarantorDetails?.section2Title}
          </h3>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Current Street Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.currentStreetAddressLabel} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <input
              type="text"
              bind:value={formData.currentStreetAddress}
              on:input={() => validateField('currentStreetAddress')}
              placeholder={t.guarantorDetails?.currentStreetAddressPlaceholder}
              class="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentStreetAddress ? 'border-red-500' : 'border-gray-300'}"
            />
          </div>
          {#if errors.currentStreetAddress}
            <p class="error-message mt-1 text-xs text-red-600">{errors.currentStreetAddress}</p>
          {/if}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <!-- District -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.guarantorDetails?.currentDistrictLabel} <span class="text-red-500">*</span>
            </label>
            <select
              bind:value={formData.currentDistrict}
              on:change={() => validateField('currentDistrict')}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentDistrict ? 'border-red-500' : 'border-gray-300'}"
            >
              {#each districts as district}
                <option value={district.value}>{district.label}</option>
              {/each}
            </select>
            {#if errors.currentDistrict}
              <p class="error-message mt-1 text-xs text-red-600">{errors.currentDistrict}</p>
            {/if}
          </div>

          <!-- Taluka -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.guarantorDetails?.currentTalukaLabel}<span class="text-red-500">*</span>
            </label>
            <select
              bind:value={formData.currentTaluka}
              on:change={() => validateField('currentTaluka')}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentTaluka ? 'border-red-500' : 'border-gray-300'}"
            >
              {#each talukas as taluka}
                <option value={taluka.value}>{taluka.label}</option>
              {/each}
            </select>
            {#if errors.currentTaluka}
              <p class="error-message mt-1 text-xs text-red-600">{errors.currentTaluka}</p>
            {/if}
          </div>

          <!-- Place -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.guarantorDetails?.currentPlaceLabel} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.currentPlace}
              on:input={() => validateField('currentPlace')}
              placeholder={t.guarantorDetails?.currentPlacePlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentPlace ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.currentPlace}
              <p class="error-message mt-1 text-xs text-red-600">{errors.currentPlace}</p>
            {/if}
          </div>

          <!-- Area -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.guarantorDetails?.currentAreaLabel} <span class="text-red-500">*</span>
            </label>
            <select
              bind:value={formData.currentArea}
              on:change={() => validateField('currentArea')}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentArea ? 'border-red-500' : 'border-gray-300'}"
            >
              {#each areas as area}
                <option value={area.value}>{area.label[locale] || area.label.en}</option>
              {/each}
            </select>
            {#if errors.currentArea}
              <p class="error-message mt-1 text-xs text-red-600">{errors.currentArea}</p>
            {/if}
          </div>
        </div>

        <!-- Pin Code -->
        <div class="max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.currentPinCodeLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.currentPinCode}
            on:input={() => validateField('currentPinCode')}
            placeholder={t.guarantorDetails?.currentPinCodePlaceholder}
            maxlength="6"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentPinCode ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.currentPinCode}
            <p class="error-message mt-1 text-xs text-red-600">{errors.currentPinCode}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Same Address Checkbox -->
    <div class="mb-6">
      <label class="flex items-start cursor-pointer">
        <input 
          type="checkbox" 
          bind:checked={formData.sameAsCurrentAddress}
          class="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded mt-1"
        />
        <span class="ml-2 text-sm text-gray-700">
          <p class="font-medium">{t.guarantorDetails?.sameAddressLabel}</p>
        </span>
      </label>
    </div>

    <!-- Permanent Address Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            {t.guarantorDetails?.section3Title}
          </h3>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Permanent Street Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.permanentStreetAddressLabel} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <input
              type="text"
              bind:value={formData.permanentStreetAddress}
              on:input={() => validateField('permanentStreetAddress')}
              placeholder={t.guarantorDetails?.permanentStreetAddressPlaceholder}
              disabled={formData.sameAsCurrentAddress}
              class="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-sm {errors.permanentStreetAddress ? 'border-red-500' : 'border-gray-300'}"
            />
          </div>
          {#if errors.permanentStreetAddress}
            <p class="error-message mt-1 text-xs text-red-600">{errors.permanentStreetAddress}</p>
          {/if}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <!-- District -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.guarantorDetails?.permanentDistrictLabel} <span class="text-red-500">*</span>
            </label>
            <select
              bind:value={formData.permanentDistrict}
              on:change={() => validateField('permanentDistrict')}
              disabled={formData.sameAsCurrentAddress}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-sm {errors.permanentDistrict ? 'border-red-500' : 'border-gray-300'}"
            >
              {#each districts as district}
                <option value={district.value}>{district.label}</option>
              {/each}
            </select>
            {#if errors.permanentDistrict}
              <p class="error-message mt-1 text-xs text-red-600">{errors.permanentDistrict}</p>
            {/if}
          </div>

          <!-- Taluka -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.guarantorDetails?.permanentTalukaLabel} <span class="text-red-500">*</span>
            </label>
            <select
              bind:value={formData.permanentTaluka}
              on:change={() => validateField('permanentTaluka')}
              disabled={formData.sameAsCurrentAddress}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-sm {errors.permanentTaluka ? 'border-red-500' : 'border-gray-300'}"
            >
              {#each talukas as taluka}
                <option value={taluka.value}>{taluka.label}</option>
              {/each}
            </select>
            {#if errors.permanentTaluka}
              <p class="error-message mt-1 text-xs text-red-600">{errors.permanentTaluka}</p>
            {/if}
          </div>

          <!-- Place -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.guarantorDetails?.permanentPlaceLabel} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.permanentPlace}
              on:input={() => validateField('permanentPlace')}
              placeholder={t.guarantorDetails?.permanentPlacePlaceholder}
              disabled={formData.sameAsCurrentAddress}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-sm {errors.permanentPlace ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.permanentPlace}
              <p class="error-message mt-1 text-xs text-red-600">{errors.permanentPlace}</p>
            {/if}
          </div>

          <!-- Area -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.guarantorDetails?.permanentAreaLabel} <span class="text-red-500">*</span>
            </label>
            <select
              bind:value={formData.permanentArea}
              on:change={() => validateField('permanentArea')}
              disabled={formData.sameAsCurrentAddress}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-sm {errors.permanentArea ? 'border-red-500' : 'border-gray-300'}"
            >
              {#each areas as area}
                <option value={area.value}>{area.label[locale] || area.label.en}</option>
              {/each}
            </select>
            {#if errors.permanentArea}
              <p class="error-message mt-1 text-xs text-red-600">{errors.permanentArea}</p>
            {/if}
          </div>
        </div>

        <!-- Pin Code -->
        <div class="max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.permanentPinCodeLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.permanentPinCode}
            on:input={() => validateField('permanentPinCode')}
            placeholder={t.guarantorDetails?.currentPinCodePlaceholder}
            maxlength="6"
            disabled={formData.sameAsCurrentAddress}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-sm {errors.permanentPinCode ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.permanentPinCode}
            <p class="error-message mt-1 text-xs text-red-600">{errors.permanentPinCode}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Life & Education Details Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            {t.guarantorDetails?.section4Title}
          </h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Select Marital Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.maritalStatusLabel} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.maritalStatus}
            on:change={() => validateField('maritalStatus')}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.maritalStatus ? 'border-red-500' : 'border-gray-300'}"
          >
            {#each maritalStatusOptions as status}
              <option value={status.value}>{status.label[locale] || status.label.en}</option>
            {/each}
          </select>
          {#if errors.maritalStatus}
            <p class="error-message mt-1 text-xs text-red-600">{errors.maritalStatus}</p>
          {/if}
        </div>

        <!-- Educational Qualifications -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.educationalQualificationLabel} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.educationalQualification}
              on:change={() => validateField('educationalQualification')} 
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.educationalQualification ? 'border-red-500' : 'border-gray-300'}"
          >
            {#each educationalQualifications as qual}
              <option value={qual.value}>{qual.label[locale] || qual.label.en}</option>
            {/each}
          </select>
          {#if errors.educationalQualification}
            <p class="error-message mt-1 text-xs text-red-600">{errors.educationalQualification}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Occupation of Guardian Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
           {t.guarantorDetails?.section5Title}
          </h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Select Occupation of Guardian -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.guardianOccupationLabel} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.guardianOccupation}
            on:change={() => validateField('guardianOccupation')}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.guardianOccupation ? 'border-red-500' : 'border-gray-300'}"
          >
            {#each occupations as occupation}
              <option value={occupation.value}>{occupation.label[locale] || occupation.label.en}</option>
            {/each}
          </select>
          {#if errors.guardianOccupation}
            <p class="error-message mt-1 text-xs text-red-600">{errors.guardianOccupation}</p>
          {/if}
        </div>

        <!-- Annual Income -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.guarantorDetails?.annualIncomeLabel} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 text-sm">₹</span>
            </div>
            <input
              type="text"
              bind:value={formData.annualIncome}
              on:input={() => validateField('annualIncome')}
              placeholder={t.guarantorDetails?.annualIncomePlaceholder}
              class="w-full pl-8 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.annualIncome ? 'border-red-500' : 'border-gray-300'}"
            />
          </div>
          {#if errors.annualIncome}
            <p class="error-message mt-1 text-xs text-red-600">{errors.annualIncome}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Has the guarantor previously provided surety Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            {t.guarantorDetails?.previousSuretyLabel}
            <span class="block text-xs text-gray-500">{t.guarantorDetails?.previousSuretySubtitle2}</span>
          </label>
          <div class="flex gap-6">
            <label class="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="previousSurety" 
                value="Yes"
                bind:group={formData.previousSurety}
                on:change={() => validateField('previousSurety')} 
                class="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
              />
              <span class="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="previousSurety" 
                value="No"
                bind:group={formData.previousSurety}
                on:change={() => validateField('previousSurety')}
                class="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
              />
              <span class="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
          {#if errors.previousSurety}
            <p class="error-message mt-2 text-xs text-red-600">{errors.previousSurety}</p>
          {/if}
        </div>

        {#if formData.previousSurety === 'Yes'}
          <div>
            <textarea
              bind:value={formData.suretyDetails}
              on:input={() => validateField('suretyDetails')}
              placeholder={t.guarantorDetails?.suretyDetailsPlaceholder}
              rows="3"
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.suretyDetails ? 'border-red-500' : 'border-gray-300'}"
            ></textarea>
            {#if errors.suretyDetails}
              <p class="error-message mt-1 text-xs text-red-600">{errors.suretyDetails}</p>
            {/if}
          </div>
        {/if}
      </div>
    </section>

    <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <button
            on:click={handleCancel}
            class="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <!-- Left Arrow (Back) -->
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>{t.guarantorDetails?.cancelButton}</span>
          </button>

          <!-- Proceed Button -->
          <button
            on:click={handleProceed}
            disabled={isSubmitting}
            class="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-md text-sm"
          >
            {#if isSubmitting}
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{t.guarantorDetails?.processing}</span>
            {:else}
              <span>{t.guarantorDetails?.proceedButton}</span>
              <!-- Right Arrow (Next) -->
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            {/if}
          </button>
      </div>


    </div>
  </div>
</div>