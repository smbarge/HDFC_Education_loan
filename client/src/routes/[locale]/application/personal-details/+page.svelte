<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import VerificationModal from '$lib/components/newapplication/VerificationModal.svelte';
  import { onMount } from 'svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import personalDetailsValidation from '$lib/validation/application/personalDetails';

  import { customSendEmailOtp, customVerifyEmailOtp , customSendOtp, customVerifyOtp ,getVerifiedContacts } from '$lib/api/authApi';

  import { fetchMasters } from '$lib/api/auth';
import { user, logout as logoutStore, applicationId } from '$lib/stores/userStore';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let showProfileModal = false;

  $: userData = $user ? {
  name: $user.name || "Guest User",
  phone: $user.mobile || "",
  username: $user.username || "",
  id: $user.id || null
} : null;


  //Distrct Dropdown
  let districts = [];
  let isLoadingDistricts = false;
  let districtError = null;


  //gender
  let genders = [];
  let otpError = '';
  
//   onMount(async () => {
//   if (typeof window !== 'undefined') {
//     const authUser = sessionStorage.getItem('authUser');

//     if (!authUser) {
//       goto(`/${locale}/login`);
//     }
//     else {
//        const user = JSON.parse(authUser);
//         userData = {
//           name: user.name || "Guest User",
//           phone: user.mobile || "",
//           username: user.username || "",
//           id: user.id || null 
//         };

//         const applicationId = sessionStorage.getItem('currentApplicationId');
//         if (!applicationId) {
//           alert('No active application found. Please start a new application.');
//           goto(`/${locale}/dashboard`);
//           return;
//         }

//         // Store application ID for later use
//         userData.applicationId = applicationId;



//         if (userData.phone) {
//           formData.mobileNumber = userData.phone;
//           isMobileVerified = true;
//           isMobileEditable = false;
//         }
//     }

//     await loadMasters();
//   }
// });


onMount(async () => {
  if (!$user) {
    goto(`/${locale}/login`);
    return;
  }

  // Check if application ID exists in store
  if (!$applicationId) {
    goto(`/${locale}/dashboard`);
    return;
  }

  // Add application ID to userData
  userData = {
    ...userData,
    applicationId: $applicationId
  };

  // Load verified contacts
  const verifiedContacts = await getVerifiedContacts($applicationId);
  
  if (verifiedContacts.success && verifiedContacts.mobile){
    formData.mobileNumber = verifiedContacts.mobile;
    isMobileVerified = true;
    isMobileEditable = false;
  } else if (userData.phone) {
    // Fallback to user registration mobile
    formData.mobileNumber = userData.phone;
    isMobileVerified = true;
    isMobileEditable = false;
  }

  if (verifiedContacts.success && verifiedContacts.email) {
    formData.emailId = verifiedContacts.email;
    isEmailVerified = true;
    isEmailEditable = false;
  }

  await loadMasters();
});

// Final
// onMount(async () => {
//   if (typeof window !== 'undefined') {
//     const authUser = sessionStorage.getItem('authUser');

//     if (!authUser) {
//       goto(`/${locale}/login`);
//     }
//     else {
//        const user = JSON.parse(authUser);
//         userData = {
//           name: user.name || "Guest User",
//           phone: user.mobile || "",
//           username: user.username || "",
//           id: user.id || null
//         };

//         //Load application ID from session
//         const applicationId = sessionStorage.getItem('currentApplicationId');
//         if (!applicationId) {
//           alert('No active application found. Please start a new application.');
//           goto(`/${locale}/dashboard`);
//           return;
//         }

//         // Store application ID for later use
//         userData.applicationId = applicationId;

//         // Mobile already verified from registration
//         if (userData.phone) {
//           formData.mobileNumber = userData.phone;
//           isMobileVerified = true;
//           isMobileEditable = false;
//         }
//     }

//     await loadMasters();
//   }
// });


  async function loadMasters() {
  isLoadingDistricts = true;
  districtError = null;

  try {
    const result = await fetchMasters();

    if (result.error === 0) {
      // District dropdown
      districts = result.masters.m_district.map(row => ({
        value: row.dist_id,
        label: `${row.eng_name} - ${row.dev_name}`
      }));

      // Gender dropdown
      genders = result.masters.m_gender.map(row => ({
        value: row.id,
        label: row.eng_name
      }));

    } else {
      districtError = 'Failed to load masters';
    }

  } catch (error) {
    districtError = 'Failed to load masters';
  } finally {
    isLoadingDistricts = false;
  }
}

  let currentStep = 2;
  let isSubmitting = false;
  let errors = {};
  
  let showVerificationModal = false;
  let verificationType = 'email';
  let verificationContact = '';
  let emailVerificationUID = '';

  let mobileVerificationUID = '';


  let isMobileVerified = false;
  let isEmailVerified = false;
  let isMobileEditable = true;
  let isEmailEditable = true;
  
  let formData = {
    // Personal Details
    mobileNumber: '',
    emailId: '',
    panCard: '',
    rationCard: '',
    
    // Current Address
    currentStreetAddress: '',
    currentDistrict: '',
    currentTaluka: '',
    currentPlace: '',
    currentArea: '',
    currentPinCode: '',
    
    // Permanent Address
    sameAsCurrentAddress: false,
    permanentStreetAddress: '',
    permanentDistrict: '',
    permanentTaluka: '',
    permanentPlace: '',
    permanentArea: '',
    permanentPinCode: '',
    
    // Life & Education
    maritalStatus: '',
    educationalQualification: '',
    
    // Parent/Guardian Info
    parentName: '',
    relationship: '',
    occupation: '',
    annualIncome: '',
    
    // Surety Declaration
    previousSurety: '',
    suretyDetails: ''
  };

  const maritalStatusOptions = [
    { value: 'Single', label: { en: 'Single', hi: 'अविवाहित', mr: 'अविवाहित' } },
    { value: 'Married', label: { en: 'Married', hi: 'विवाहित', mr: 'विवाहित' } },
    { value: 'Divorced', label: { en: 'Divorced', hi: 'तलाकशुदा', mr: 'घटस्फोटित' } },
    { value: 'Widowed', label: { en: 'Widowed', hi: 'विधवा', mr: 'विधुर' } }
  ];

  const relationshipOptions = [
    { value: 'Father', label: { en: 'Father', hi: 'पिता', mr: 'वडील' } },
    { value: 'Mother', label: { en: 'Mother', hi: 'माता', mr: 'आई' } },
    { value: 'Guardian', label: { en: 'Guardian', hi: 'अभिभावक', mr: 'पालक' } }
  ];

  function handleMobileEdit() {
    isMobileEditable = true;
    isMobileVerified = false;
  }

  async function handleMobileVerify() {
    if (!formData.mobileNumber) {
      errors.mobileNumber = 'Please enter mobile number first';
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      return;
    }
    
    try {
      const result = await customSendOtp({
        mobileNumber: formData.mobileNumber,
        name: userData?.name || 'User',
        id: userData?.applicationId 
      });

      if (result.error === 0) {
        mobileVerificationUID = result.uid;
        verificationType = 'mobile';
        verificationContact = formData.mobileNumber;
        showVerificationModal = true;
      } else {
        errors.mobileNumber = result.errorMsg || 'Failed to send OTP';
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      errors.mobileNumber = 'Failed to send OTP. Please try again.';
    }
  }

 async function handleEmailVerify() {
    if (!formData.emailId) {
      errors.emailId = 'Please enter email address first';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      errors.emailId = 'Please enter a valid email address';
      return;
    }
    
    try {
          const result = await customSendEmailOtp({
          email: formData.emailId,
          name: userData?.name || 'User',
          id: userData?.applicationId // Use application ID from session
        });

      if (result.error === 0) {
        emailVerificationUID = result.uid; // Save UID
        verificationType = 'email';
        verificationContact = formData.emailId;
        showVerificationModal = true;
      } else {
        errors.emailId = result.errorMsg || 'Failed to send OTP';
      }
    } catch (error) {
      console.error('Failed to send email OTP:', error);
      errors.emailId = 'Failed to send OTP. Please try again.';
    }
  }

 async function handleVerificationSuccess(event) {
  const { otp, type } = event.detail;
   otpError = '';
  
  try {
    if (type === 'mobile') {
      // CHANGE: Verify mobile OTP with dataName parameter
      const result = await customVerifyOtp({
        uid: mobileVerificationUID,
        otp: otp,
        dataName: 'applicant' // Same as email verification
      });

      if (result.error === 0) {
        isMobileVerified = true;
        isMobileEditable = false;
        showVerificationModal = false;
        
        // Clear mobile errors
        const { mobileNumber, ...restErrors } = errors;
        errors = restErrors;
        
        console.log('Mobile verified:', result.mobile);
      } else {
         otpError = result.errorMsg || 'Invalid OTP. Please try again.';
      }
    } 
    else if (type === 'email') {
      const result = await customVerifyEmailOtp({
        uid: emailVerificationUID,
        otp: otp,
        dataName: 'applicant' // Optional: for contacts table
      });

      if (result.error === 0) {
        isEmailVerified = true;
        isEmailEditable = false;
        showVerificationModal = false;
        
        // Clear email errors
        const { emailId, ...restErrors } = errors;
        errors = restErrors;
        
        console.log('Email verified:', result.email);
      } else {
        otpError = result.errorMsg || 'Invalid OTP. Please try again.';
      }
    }
  } catch (error) {
    console.error('OTP verification failed:', error);
     otpError = 'Verification failed. Please try again.';
  }
}

  function handleModalClose() {
    showVerificationModal = false;
  }

function handleSameAddressChange() {
  if (formData.sameAsCurrentAddress) {
    // Copy current address to permanent address
    formData.permanentStreetAddress = formData.currentStreetAddress;
    formData.permanentDistrict = formData.currentDistrict;
    formData.permanentTaluka = formData.currentTaluka;
    formData.permanentPlace = formData.currentPlace;
    formData.permanentArea = formData.currentArea;
    formData.permanentPinCode = formData.currentPinCode;
    
    // Clear all permanent address errors
    const newErrors = { ...errors };
    delete newErrors.permanentStreetAddress;
    delete newErrors.permanentDistrict;
    delete newErrors.permanentTaluka;
    delete newErrors.permanentPlace;
    delete newErrors.permanentArea;
    delete newErrors.permanentPinCode;
    errors = newErrors;
  } else {
    // Clear permanent address fields when unchecked
    formData.permanentStreetAddress = '';
    formData.permanentDistrict = '';
    formData.permanentTaluka = '';
    formData.permanentPlace = '';
    formData.permanentArea = '';
    formData.permanentPinCode = '';
  }
}
function validateField(fieldName) {
  const result = personalDetailsValidation(formData, t);
  const fieldErrors = result.getErrors();
  
  if (fieldErrors[fieldName]) {
    // Set error if validation fails for this field
    errors = { ...errors, [fieldName]: fieldErrors[fieldName] };
  } else {
    // Clear error if validation passes for this field
    const { [fieldName]: _, ...rest } = errors;
    errors = rest;
  }
}

  function validateForm() {
  const result = personalDetailsValidation(formData, t);
  errors = result.getErrors();
  return result.isValid();
  }


  async function handleProceed() {
     const result = personalDetailsValidation(formData, t);
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
      goto(`/${locale}/application/acadamic-info`);
    } catch (error) {
      console.error('Error submitting form:', error);
      errors.general = 'Failed to submit form. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
  function handleBack() {
    goto(`/${locale}/dashboard`);
  }

  function handleCancel() {
    goto(`/${locale}/application/start`);
  }

  function handleLogout() {
  logoutStore();
  goto(`/${locale}/login`);
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
  on:logout={handleLogout}
/>

  <ApplicationStepper {currentStep} {t} />

  <div class="w-full px-2 sm:px-4 md:px-6 lg:px-8 pb-12 overflow-x-hidden">
    <div class="max-w-[1400px] mx-auto">
    
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {t.personalDetails?.pageTitle || 'Student Personal Details'}
        </h2>
      </div>
      <button
        on:click={handleBack}
        class="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        <span class="hidden sm:inline">{t.applicationStart?.backToHome || 'Back to Home'}</span>
      </button>
    </div>

    <!-- Applicant Personal Details -->
   <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    </div>
    <h3 class="text-base sm:text-lg font-bold text-gray-900">
      1. {t.personalDetails?.section1Title || 'Applicant Personal Details'}
    </h3>
  </div>

  <div class="space-y-4">
    
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

      <!-- Mobile -->
      <div class="w-full">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {t.personalDetails?.mobileLabel || 'Mobile Number'} <span class="text-red-500">*</span>
        </label>

        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex-1 relative min-w-0">
            <input
              type="text"
              bind:value={formData.mobileNumber}
              on:input={() => validateField('mobileNumber')}
              placeholder={t.personalDetails?.mobilePlaceholder || 'Enter mobile'}
              maxlength="10"
              disabled={isMobileVerified}
              readonly={!isMobileEditable}
              class="w-full px-3 py-2.5 border rounded-lg text-sm
              focus:ring-2 focus:ring-purple-500 focus:border-purple-500
              disabled:bg-gray-100
              {errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}"
            />

            {#if isMobileVerified}
               <div class="absolute inset-y-0 right-2 flex items-center gap-2 pointer-events-none">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            {/if}
          </div>

          <button
            on:click={isMobileVerified ? handleMobileEdit : handleMobileVerify}
            class="w-full sm:w-auto flex-shrink-0 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {isMobileVerified
              ? (t.personalDetails?.mobileEditButton || 'Edit')
              : (t.personalDetails?.VerifyButton || 'Verify')}
          </button>
        </div>

        {#if errors.mobileNumber}
          <p class="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>
        {/if}
      </div>

      
      <!-- Email -->
    <div class="w-full">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {t.personalDetails?.emailLabel || 'Email'} <span class="text-red-500">*</span>
      </label>

      <div class="flex flex-col sm:flex-row gap-2">

        <div class="flex-1 relative min-w-0">
          <input
            type="email"
            bind:value={formData.emailId}
            on:input={() => validateField('emailId')}
            placeholder={t.personalDetails?.emailPlaceholder || 'Enter email'}
            disabled={isEmailVerified}
            readonly={!isEmailEditable}
            class="w-full px-3 py-2.5 border rounded-lg text-sm
            focus:ring-2 focus:ring-purple-500 focus:border-purple-500
            disabled:bg-gray-100
            {errors.emailId ? 'border-red-500' : 'border-gray-300'}"
          />

          {#if isEmailVerified}
            <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          {/if}
        </div>

        <button
          on:click={handleEmailVerify}
          disabled={isEmailVerified}
          class="w-full sm:w-auto flex-shrink-0 px-4 py-2.5 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2
          {isEmailVerified 
            ? 'bg-green-100 text-green-700 cursor-not-allowed' 
            : 'bg-cyan-500 hover:bg-cyan-600 text-white'}"
        >
          {#if isEmailVerified}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Verified
          {:else}
            {t.personalDetails?.VerifyButton || 'Verify'}
          {/if}
        </button>

      </div>

      {#if errors.emailId}
        <p class="mt-1 text-xs text-red-600">{errors.emailId}</p>
      {/if}
    </div>


      <!-- PAN -->
      <div class="w-full">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {t.personalDetails?.panLabel || 'PAN Card'}
        </label>
        <input
          type="text"
          bind:value={formData.panCard}
          on:input={() => validateField('panCard')}
          placeholder={t.personalDetails?.panPlaceholder || 'Enter PAN'}
          maxlength="10"
          class="w-full px-3 py-2.5 border rounded-lg text-sm
          focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          {errors.panCard ? 'border-red-500' : 'border-gray-300'}"
          style="text-transform: uppercase;"
        />
        {#if errors.panCard}
          <p class="mt-1 text-xs text-red-600">{errors.panCard}</p>
        {/if}
      </div>

    </div>

  </div>
   </section>



    <!-- Current Address -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">
            2. {t.personalDetails?.section2Title || 'Current Address'}
          </h3>
          <p class="text-xs text-gray-600">सध्याचा पत्ता</p>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Street Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.currentStreetLabel || 'Street Address'} <span class="text-red-500">*</span>
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
            placeholder={t.personalDetails?.streetPlaceholder || 'Enter address'}
            class="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentStreetAddress ? 'border-red-500' : 'border-gray-300'}"
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
              {t.personalDetails?.districtLabel || 'District'} <span class="text-red-500">*</span>
            </label>
           <select
              bind:value={formData.currentDistrict}
              on:change={() => validateField('currentDistrict')}
              class="w-full px-2 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentDistrict ? 'border-red-500' : 'border-gray-300'}"
            >
              <option value="">{t.personalDetails?.districtPlaceholder || 'Select'}</option>
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
              {t.personalDetails?.talukaLabel || 'Taluka'} <span class="text-red-500">*</span>
            </label>
          <input
              type="text"
              bind:value={formData.currentTaluka}
              on:input={() => validateField('currentTaluka')}
              placeholder={t.personalDetails?.talukaPlaceholder || 'Taluka'}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentTaluka ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.currentTaluka}
              <p class="error-message mt-1 text-xs text-red-600">{errors.currentTaluka}</p>
            {/if}
          </div>

          <!-- Place -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.personalDetails?.placeLabel || 'Place'} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.currentPlace}
              on:input={() => validateField('currentPlace')}
              placeholder={t.personalDetails?.placePlaceholder || 'Place'}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentPlace ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.currentPlace}
              <p class="error-message mt-1 text-xs text-red-600">{errors.currentPlace}</p>
            {/if}
          </div>

          <!-- Area -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
             {t.personalDetails?.areaLabel || 'Area'}<span class="text-red-500">*</span>
            </label>
           <input
            type="text"
            bind:value={formData.currentArea}
            on:input={() => validateField('currentArea')}
            placeholder={t.personalDetails?.areaPlaceholder || 'Area'}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentArea ? 'border-red-500' : 'border-gray-300'}"
          />
            {#if errors.currentArea}
              <p class="error-message mt-1 text-xs text-red-600">{errors.currentArea}</p>
            {/if}
          </div>
        </div>

        <!-- Pin Code -->
        <div class="max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.pinCodeLabel || 'Pin Code'} <span class="text-red-500">*</span>
          </label>
         <input
            type="text"
            bind:value={formData.currentPinCode}
            on:input={() => validateField('currentPinCode')}
            placeholder={t.personalDetails?.pinCodePlaceholder || 'Pin Code'}
            maxlength="6"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.currentPinCode ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.currentPinCode}
            <p class="error-message mt-1 text-xs text-red-600">{errors.currentPinCode}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Same as Current Address Checkbox -->
    <div class="mb-6">
      <label class="flex items-start cursor-pointer">
        <input 
            type="checkbox" 
            bind:checked={formData.sameAsCurrentAddress}
            on:change={handleSameAddressChange}
            class="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded mt-1"
          />
        <span class="ml-2 text-sm text-gray-700">
          <p class="font-medium">{t.personalDetails?.sameAddressQuestion || 'Same as current address'}</p>
        </span>
      </label>
    </div>

    <!-- Permanent Address -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">
            3. {t.personalDetails?.section3Title || 'Permanent Address'}
          </h3>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Street Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.permanentStreetLabel || 'Street Address'}<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.permanentStreetAddress}
            on:input={() => validateField('permanentStreetAddress')}
            placeholder={t.personalDetails?.streetPlaceholder || 'Enter address'}
            disabled={formData.sameAsCurrentAddress}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm {errors.permanentStreetAddress ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.permanentStreetAddress}
            <p class="error-message mt-1 text-xs text-red-600">{errors.permanentStreetAddress}</p>
          {/if}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <!-- District -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.personalDetails?.districtLabel || 'District'} <span class="text-red-500">*</span>
            </label>
           
                <select
                  bind:value={formData.permanentDistrict}
                  on:change={() => validateField('permanentDistrict')}
                  disabled={formData.sameAsCurrentAddress}
                  class="w-full px-2 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm {errors.permanentDistrict ? 'border-red-500' : 'border-gray-300'}"
                >
              <option value="">{t.personalDetails?.districtPlaceholder || 'Select'}</option>
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
              {t.personalDetails?.talukaLabel || 'Taluka'}<span class="text-red-500">*</span>
            </label>
            <input
                type="text"
                bind:value={formData.permanentTaluka}
                on:input={() => validateField('permanentTaluka')}
                placeholder={t.personalDetails?.talukaPlaceholder || 'Taluka'}
                disabled={formData.sameAsCurrentAddress}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm {errors.permanentTaluka ? 'border-red-500' : 'border-gray-300'}"
              />
            {#if errors.permanentTaluka}
              <p class="error-message mt-1 text-xs text-red-600">{errors.permanentTaluka}</p>
            {/if}
          </div>

          <!-- Place -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.personalDetails?.placeLabel || 'Place'} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.permanentPlace}
              on:input={() => validateField('permanentPlace')}
              placeholder={t.personalDetails?.placePlaceholder || 'Place'}
              disabled={formData.sameAsCurrentAddress}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm {errors.permanentPlace ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.permanentPlace}
              <p class="error-message mt-1 text-xs text-red-600">{errors.permanentPlace}</p>
            {/if}
          </div>

          <!-- Area -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.personalDetails?.areaLabel || 'Area'} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.permanentArea}
              placeholder={t.personalDetails?.areaPlaceholder || 'Area'}
              disabled={formData.sameAsCurrentAddress}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm {errors.permanentArea ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.permanentArea}
              <p class="error-message mt-1 text-xs text-red-600">{errors.permanentArea}</p>
            {/if}
          </div>
        </div>

        <!-- Pin Code -->
        <div class="max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.pinCodeLabel || 'Pin Code'} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.permanentPinCode}
            on:input={() => validateField('permanentPinCode')}
            placeholder={t.personalDetails?.pinCodePlaceholder || 'Pin Code'}
            maxlength="6"
            disabled={formData.sameAsCurrentAddress}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm {errors.permanentPinCode ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.permanentPinCode}
            <p class="error-message mt-1 text-xs text-red-600">{errors.permanentPinCode}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Life & Education Details -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">
            4. {t.personalDetails?.section4Title || 'Life & Education Details'}
          </h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Marital Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.maritalStatusLabel || 'Marital Status'} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.maritalStatus}
            on:change={() => validateField('maritalStatus')}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.maritalStatus ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.personalDetails?.maritalPlaceholder || 'Select'}</option>
            {#each maritalStatusOptions as status}
              <option value={status.value}>{status.label[locale] || status.label.en}</option>
            {/each}
          </select>
          {#if errors.maritalStatus}
            <p class="error-message mt-1 text-xs text-red-600">{errors.maritalStatus}</p>
          {/if}
        </div>

        <!-- Educational Qualification -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.educationLabel || 'Educational Qualification'} <span class="text-red-500">*</span>
          </label>
         <input
            type="text"
            bind:value={formData.educationalQualification}
            on:input={() => validateField('educationalQualification')}
            placeholder={t.personalDetails?.educationPlaceholder || 'Last passed exam'}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.educationalQualification ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.educationalQualification}
            <p class="error-message mt-1 text-xs text-red-600">{errors.educationalQualification}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Parent/Guardian Information -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">
            5. {t.personalDetails?.section5Title || 'Parent / Guardian Information'}
          </h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Parent Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.parentNameLabel || 'Parent / Guardian Name'} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.parentName}
            on:input={() => validateField('parentName')}
            placeholder={t.personalDetails?.parentNamePlaceholder || 'Enter name'}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.parentName ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.parentName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.parentName}</p>
          {/if}
        </div>

        <!-- Relationship -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.relationshipLabel || 'Relationship'} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.relationship}
            on:change={() => validateField('relationship')}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.relationship ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.personalDetails?.relationshipPlaceholder || 'Select'}</option>
            {#each relationshipOptions as relation}
              <option value={relation.value}>{relation.label[locale] || relation.label.en}</option>
            {/each}
          </select>
          {#if errors.relationship}
            <p class="error-message mt-1 text-xs text-red-600">{errors.relationship}</p>
          {/if}
        </div>

        <!-- Occupation -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.occupationLabel || 'Occupation'} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.occupation}
            on:input={() => validateField('occupation')}
            placeholder={t.personalDetails?.occupationPlaceholder || 'Enter occupation'}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.occupation ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.occupation}
            <p class="error-message mt-1 text-xs text-red-600">{errors.occupation}</p>
          {/if}
        </div>

        <!-- Annual Income -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.personalDetails?.annualIncomeLabel || 'Annual Income'} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.annualIncome}
            on:input={() => validateField('annualIncome')}
            placeholder={t.personalDetails?.annualIncomePlaceholder || 'Enter annual income'}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.annualIncome ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.annualIncome}
            <p class="error-message mt-1 text-xs text-red-600">{errors.annualIncome}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Surety Declaration -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">
            6. {t.personalDetails?.section6Title || 'Surety Declaration'}
          </h3>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            {t.personalDetails?.suretyQuestion || 'Has the applicant / parent previously provided surety?'} <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-6">
            <label class="flex items-center cursor-pointer">
              <input 
              type="radio" 
              name="surety" 
              value="Yes"
              bind:group={formData.previousSurety}
              on:change={() => validateField('previousSurety')}
              class="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />

              <span class="ml-2 text-sm text-gray-700">{t.personalDetails?.suretyYes || 'Yes'}</span>
            </label>
            <label class="flex items-center cursor-pointer">
             <input 
              type="radio" 
              name="surety" 
              value="No"
              bind:group={formData.previousSurety}
              on:change={() => validateField('previousSurety')}
              class="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
              <span class="ml-2 text-sm text-gray-700">{t.personalDetails?.suretyNo || 'No'}</span>
            </label>
          </div>
          {#if errors.previousSurety}
            <p class="error-message mt-2 text-xs text-red-600">{errors.previousSurety}</p>
          {/if}
        </div>

        
      </div>
    </section>

    <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
      <button
        on:click={handleCancel}
        class="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        {t.personalDetails?.cancelButton || 'Back'}
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
          <span>{t.personalDetails?.processing || 'Processing...'}</span>
        {:else}
          <span>{t.personalDetails?.proceedButton || 'Proceed to Next Step'}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        {/if}
      </button>
    </div>

    </div>
  </div>
</div>

<!-- Verification Modal -->
<VerificationModal
  bind:isOpen={showVerificationModal}
  {verificationType}
  contactInfo={verificationContact}
  {otpError}
  on:verify={handleVerificationSuccess}
  on:cancel={handleModalClose}
  on:close={handleModalClose}
/>