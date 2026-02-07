<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import applicationStartValidation from '$lib/validation/application/strat';
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
});


  let currentStep = 1;
  let isSubmitting = false;
  let errors = {};
  
  let formData = {
    community: '',
    isResident: '',
    district: '',
    aadharNumber: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    consent: false
  };

  // Community options
  const communities = [
    { value: 'muslim', label: 'muslim' },
    { value: 'christian', label: 'christian' },
    { value: 'sikh', label: 'sikh' },
    { value: 'buddhist', label: 'buddhist' },
    { value: 'jain', label: 'jain' },
    { value: 'parsi', label: 'parsi' },
    { value: 'jew', label: 'jew' }
  ];

  // District options
  const districts = [
    { value: 'AHMEDNAGAR', label: 'AHMEDNAGAR - अहमदनगर' },
    { value: 'PUNE', label: 'PUNE - पुणे' },
    { value: 'MUMBAI', label: 'MUMBAI - मुंबई' },
    { value: 'NAGPUR', label: 'NAGPUR - नागपूर' }
  ];

    $: showNextSections =
      formData.community !== '' && formData.isResident === 'Yes';

    $: notEligible = formData.isResident === 'No';

  function validateForm() {
  const result = applicationStartValidation(formData, t);

    errors = result.getErrors();

    return result.isValid();
  }


  async function handleProceed() {
    if (!validateForm()) {
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    isSubmitting = true;

    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/application/start', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // if (!response.ok) throw new Error('Submission failed');
      // const data = await response.json();
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to next step
      goto(`/${locale}/application/personal-details`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      isSubmitting = false;
    }
  }

  // Navigate back to home
  function handleBackToHome() {
    goto(`/${locale}/dashboard`);
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
    
   
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {t.applicationStart?.pageTitle || 'Start Your Application'}
        </h2>
        <p class="text-sm sm:text-base text-gray-600 mt-2">
          {t.applicationStart?.pageSubtitle || 'Please provide your basic information to begin the loan application process'}
        </p>
      </div>
      <button
        on:click={handleBackToHome}
        class="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        <span class="hidden sm:inline">{t.applicationStart?.backToHome || 'Back to Home'}</span>
      </button>
    </div>


    <div class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <p class="text-sm text-blue-800 font-medium">
            {t.applicationStart?.mandatoryFields || 'All fields marked with * are mandatory'}
          </p>
          <p class="text-xs text-blue-700 mt-1">
            {t.applicationStart?.dataSecure || 'Your data is secure and protected'}
          </p>
        </div>
      </div>
    </div>
    
   
     <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        {t.applicationStart?.minorityTitle || 'Select minority community of the applicant'}
        <span class="text-red-500">*</span>
      </h3>
      
      <div class="flex flex-wrap gap-4">
        {#each communities as community}
          <label class="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="community" 
              value={community.value}
              bind:group={formData.community}
              class="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
           <span class="ml-2 text-sm text-gray-700">
            {t.applicationStart?.communities?.[community.label] || community.value}
          </span>
          </label>
        {/each}
      </div>
      {#if errors.community}
        <p class="error-message mt-2 text-sm text-red-600">{errors.community}</p>
      {/if}
    </section>


     <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-2">
        {t.applicationStart?.residencyQuestion || 'Are you a resident of Maharashtra State?'}
        <span class="text-red-500">*</span>
      </h3>
      
      <div class="flex gap-6">
        <label class="flex items-center cursor-pointer">
          <input 
            type="radio" 
            name="resident" 
            value="Yes"
            bind:group={formData.isResident}
            class="w-4 h-4 text-purple-600 focus:ring-purple-500"
          />
          <span class="ml-2 text-sm text-gray-700">{t.applicationStart?.residencyYes || 'Yes'}</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input 
            type="radio" 
            name="resident" 
            value="No"
            bind:group={formData.isResident}
            class="w-4 h-4 text-purple-600 focus:ring-purple-500"
          />
          <span class="ml-2 text-sm text-gray-700">{t.applicationStart?.residencyNo || 'No'}</span>
        </label>
      </div>
      {#if errors.isResident}
        <p class="error-message mt-2 text-sm text-red-600">{errors.isResident}</p>
      {/if}
    </section>

    {#if showNextSections}
       <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-2">
          {t.applicationStart?.districtTitle || 'Application for District Office:'}
          <span class="text-red-500">*</span>
        </h3>
        
        <select 
          bind:value={formData.district}
          class="w-full max-w-md px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.district ? 'border-red-500' : ''}"
        >
          <option value="">{t.applicationStart?.districtPlaceholder || 'Choose your district'}</option>
          {#each districts as district}
            <option value={district.value}>{district.label}</option>
          {/each}
        </select>
        {#if errors.district}
          <p class="error-message mt-2 text-sm text-red-600">{errors.district}</p>
        {/if}
      </section>

       <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          {t.applicationStart?.identityTitle || 'Identity Verification'}
        </h3>
        
        <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg mb-4">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <div>
              <h4 class="font-bold text-gray-900 mb-1 text-sm">
                Aadhar (Mandatory) / आधार (अनिवार्य)
              </h4>
              <p class="text-xs text-gray-600">
                {t.applicationStart?.identityInstruction || 'Keep Aadhar card with you along with the Mobile Number registered in Aadhar.'}
              </p>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
         
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.applicationStart?.aadharLabel || 'Aadhar Number'} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <input
                type="text"
                bind:value={formData.aadharNumber}
                placeholder={t.applicationStart?.aadharPlaceholder || 'Enter 12-digit Aadhar number'}
                maxlength="12"
                class="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.aadharNumber ? 'border-red-500' : 'border-gray-300'}"
              />
            </div>
            {#if errors.aadharNumber}
              <p class="error-message mt-1 text-xs text-red-600">{errors.aadharNumber}</p>
            {/if}
          </div>

         
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.applicationStart?.nameLabel || "Applicant's Full Name (Name as Per Aadhaar Card)"} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <input
                type="text"
                bind:value={formData.fullName}
                placeholder={t.applicationStart?.namePlaceholder || 'Enter your full name as per Aadhar'}
                class="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.fullName ? 'border-red-500' : 'border-gray-300'}"
              />
            </div>
            {#if errors.fullName}
              <p class="error-message mt-1 text-xs text-red-600">{errors.fullName}</p>
            {/if}
          </div>

       
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.applicationStart?.dobLabel || 'Date of Birth'} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <input
                type="date"
                bind:value={formData.dateOfBirth}
                class="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}"
              />
            </div>
            {#if errors.dateOfBirth}
              <p class="error-message mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
            {/if}
          </div>

      
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.applicationStart?.genderLabel || 'Gender'} <span class="text-red-500">*</span>
            </label>
            <select 
              bind:value={formData.gender}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.gender ? 'border-red-500' : 'border-gray-300'}"
            >
              <option value="">{t.applicationStart?.genderPlaceholder || 'Select your gender'}</option>
              <option value="Male">{t.applicationStart?.genderOptions?.male || 'Male'}</option>
              <option value="Female">{t.applicationStart?.genderOptions?.female || 'Female'}</option>
              <option value="Other">{t.applicationStart?.genderOptions?.other || 'Other'}</option>
            </select>
            {#if errors.gender}
              <p class="error-message mt-1 text-xs text-red-600">{errors.gender}</p>
            {/if}
          </div>
        </div>

       
        <div class="mt-4">
          <label class="flex items-start cursor-pointer">
            <input 
              type="checkbox" 
              bind:checked={formData.consent}
              class="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded mt-1 {errors.consent ? 'border-red-500' : ''}"
            />
            <span class="ml-3 text-xs text-gray-700">
              <p>{t.applicationStart?.consentText || 'I provide my consent to share my details with the issuer for the purpose of fetching my details.'}</p>
            </span>
          </label>
          {#if errors.consent}
            <p class="error-message mt-1 text-xs text-red-600 ml-7">{errors.consent}</p>
          {/if}
        </div>
      </section>

    
      <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
        <button
          on:click={handleBackToHome}
          class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          {t.applicationStart?.cancel || 'Cancel'}
        </button>
        <button
          on:click={handleProceed}
          disabled={isSubmitting}
          class="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-md text-sm"
        >
          {#if isSubmitting}
            <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t.applicationStart?.processing || 'Processing...'}</span>
          {:else}
            <span>{t.applicationStart?.proceed || 'Proceed'}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          {/if}
        </button>
      </div>
    {/if}

    {#if notEligible}
    <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-red-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
        </svg>

        <div>
          <h4 class="font-bold text-red-700 mb-1 text-sm">
            Permanent must resident of Maharashtra
          </h4>
          <p class="text-xs text-red-600 font-medium">
            You are not eligible to apply for this scheme.
          </p>
          <p class="text-xs text-gray-600 mt-1">
            अर्जदार महाराष्ट्र राज्याचा कायमस्वरूपी रहिवासी असणे आवश्यक आहे.
          </p>
        </div>
      </div>
    </div>
  {/if}
  </div>
  </div>
</div>