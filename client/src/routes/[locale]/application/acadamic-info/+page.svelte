<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import { onMount } from 'svelte';
  import ProfileModal from '$lib/components/dashboard/ProfileModal.svelte';
  import academicInfoValidation from '$lib/validation/application/academicInfo';

  import { user, logout as logoutStore, applicationId } from '$lib/stores/userStore';
  import { fetchMasters,fetchTalukas,featchStreams } from '$lib/api/auth';
  import { getEducationDetailsData, customSaveEducationDetails } from '$lib/api/authApi';



  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let showProfileModal = false;

  $: userData = $user ? {
  name: $user.name || "Guest User",
  phone: $user.mobile || "",
  username: $user.username || "",
  id: $user.id || null
} : null;

onMount(async () => {
  if (!$user) {
    goto(`/${locale}/login`);
    return;
  }

  if (!$applicationId) {
    goto(`/${locale}/dashboard`);
    return;
  }

  await loadMasters();

  const educationData = await getEducationDetailsData($applicationId);
  
  if (educationData.error === 0 && educationData.data) {

    const savedCourseType = educationData.data.courseType;
    const savedStreamSpecialization = educationData.data.streamSpecialization;
    const savedDistrict = educationData.data.currentDistrict;
    const savedTaluka = educationData.data.currentTaluka;

    formData = {
      ...formData,
      ...educationData.data
    };

    // Load streams first, THEN set selected stream value
    if (savedCourseType) {
      await loadStreamsForCourse(savedCourseType);
      formData.streamSpecialization = String(savedStreamSpecialization);
    }

    // Load talukas first, THEN set selected taluka value
    if (savedDistrict) {
      await loadTalukasForDistrict(String(savedDistrict), 'current');
      formData.currentTaluka = String(savedTaluka);
    }

    // Force Svelte reactivity
    formData = formData;
  }
});

  let currentStep = 3;
  let isSubmitting = false;
  let errors = {};
  
 
  let formData = {
    // Student Details
    studentName: '',
    courseName: '',
    courseType: '',
    streamSpecialization: '',
    courseDuration: '',
    modeOfStudy: '',
    
    // Institution Details
    instituteName: '',
    universityName: '',
    instituteAddress: '',
    place:'',
    pinCode: '',

    // Current Address
    currentDistrict: '',
    currentTaluka: '',
    
    // Admission & Fee Details
    admissionStatus: '',
    admissionYear: '',
    totalCourseFee: '',
    feePaid: '',
    remainingFee: '',
    
    // Loan Requirement Details
    loanRequired: '',
    purposeOfLoan: '',
    gstNumber: '',
    
    // Bank Details
    bankName: '',
    ifscCode: '',
    branchName: '',
    accountNumber: '',
    bankAddress: ''
  };

  //Distrct Dropdown
  let districts = [];
  let isLoadingDistricts = false;
  let districtError = null;

  //Taluka
  let currentTalukas = [];
  let permanentTalukas = [];
  let isLoadingCurrentTalukas = false;
  let isLoadingPermanentTalukas = false;

  //gender
  let genders = [];
  let mstatus = [];
  let educationq = [];
  let occupations = [];
  let relations = [];
  let courses = [];
  let streams = [];


  let isLoadingStreams = false;
  let modesOfStudys = [];
  let loanPurposes = [];
  let admissionStatuses =[];

  let otpError = '';


  async function loadMasters() {
  isLoadingDistricts = true;
  districtError = null;

  try {
    const result = await fetchMasters();

    if (result.error === 0) {
      // District dropdown
      districts = result.masters.m_district.map(row => ({
        value: row.dist_id,
        label: `${row.eng_name} - ${row.dev_name}`,
        state_id: row.state_id,     
        country_id: row.country_id   
      }));

      // Gender dropdown
      genders = result.masters.m_gender.map(row => ({
        value: row.id,
        label: `${row.eng_name} - ${row.dev_name}`,
      }));

      mstatus = result.masters.m_marital_status.map(row => ({
        value: row.id,
        label: `${row.eng_name} - ${row.dev_name}`,
      }));

      educationq = result.masters.m_educational_qualification.map(row => ({
        value: row.id,
        label: `${row.eng_name} - ${row.dev_name}`,
      }));

      occupations = result.masters.m_occupation.map(row => ({
        value: row.id,
        label: `${row.eng_name} - ${row.dev_name}`,
      }));

      relations = result.masters.m_relation.map(row => ({
        value: row.id,
        label: `${row.eng_name} - ${row.dev_name}`,
      }));

      courses = result.masters.m_course_type.map(row => ({
        value: row.course_id,
        label: `${row.eng_name} - ${row.dev_name}`,
      }));

      modesOfStudys = result.masters.m_mode_of_study.map(row => ({
        value: row.id,
        label: `${row.eng_name} - ${row.dev_name}`,
      }));

      loanPurposes = result.masters.m_perpose_loan.map(row => ({
        value: row.id,
        label: `${row.eng_name} - ${row.dev_name}`,
      }));

      
      admissionStatuses = result.masters.m_admission_status.map(row => ({
        value: row.id,
        label: `${row.eng_name} - ${row.dev_name}`,
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

async function loadTalukasForDistrict(districtId, type = 'current') {
  const district = districts.find(d => d.value == districtId);

  console.log("Distrcts _id_Selected :",district);

  if (!district) return;  

  if (type === 'current') {
    isLoadingCurrentTalukas = true;
  } else {
    isLoadingPermanentTalukas = true;
  }

  try {
    const result = await fetchTalukas({
      district_id: district.value, 
      state_id: district.state_id,
      country_id: district.country_id
    });

    console.log("Taluka result:", result);

    if (result.error === 0 && Array.isArray(result.talukas)) {

      const talukaList = result.talukas.map(row => ({
        value: row.taluka_id,
        label: `${row.eng_name} - ${row.dev_name}`
      }));

      if (type === 'current') {
        currentTalukas = talukaList;
      } else {
        permanentTalukas = talukaList;
      }

    } else {
      console.error("Invalid taluka response:", result);
    }



  } catch (error) {
    console.error('Failed to load talukas:', error);
  } finally {
    if (type === 'current') {
      isLoadingCurrentTalukas = false;
    } else {
      isLoadingPermanentTalukas = false;
    }
  }
}

async function loadStreamsForCourse(courseId) {
  if (!courseId) {
    streams = [];
    return;
  }

  isLoadingStreams = true;
  try {
    const result = await featchStreams({ course_id: courseId });
    if (result.error === 0 && Array.isArray(result.streams)) {
      streams = result.streams.map(row => ({
        value: row.stream_id,
        label: `${row.eng_name} - ${row.dev_name}`
      }));
    } else {
      streams = [];
    }
  } catch (error) {
    console.error('Failed to load streams:', error);
    streams = [];
  } finally {
    isLoadingStreams = false;
  }
}


  // Auto-calculate remaining fee
  $: if (formData.totalCourseFee && formData.feePaid) {
    const total = parseFloat(formData.totalCourseFee) || 0;
    const paid = parseFloat(formData.feePaid) || 0;
    formData.remainingFee = (total - paid).toString();
  }

 function validateField(fieldName) {
  const result = academicInfoValidation(formData, t);
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
  const result = academicInfoValidation(formData, t);
  errors = result.getErrors();
  return result.isValid();
}

  // Handle form submission
//  async function handleProceed() {
//   const result = academicInfoValidation(formData, t);
//   errors = result.getErrors();
  
//   if (!result.isValid()) {
//     const firstErrorElement = document.querySelector('.error-message');
//     if (firstErrorElement) {
//       firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//     return;
//   }
//   await loadTalukasForDistrict(formData.currentDistrict, 'permanent');

//   isSubmitting = true;

//   try {
//     // TODO: Replace with actual API endpoint
//     // const response = await fetch('/api/application/academic-info', {
//     //   method: 'POST',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify(formData)
//     // });
    
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     goto(`/${locale}/application/guarantor-details`);
//   } catch (error) {
//     console.error('Error submitting form:', error);
//     alert('Failed to submit form. Please try again.');
//   } finally {
//     isSubmitting = false;
//   }
// }


async function handleProceed() {

  const result = academicInfoValidation(formData, t);
  errors = result.getErrors();
  
  if (!result.isValid()) {
    console.log('Validation failed:', errors);
    const firstErrorElement = document.querySelector('.error-message');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  isSubmitting = true;

  try {
    console.log('Saving education details for application:', $applicationId);
    
    const saveResult = await customSaveEducationDetails({
      applicationId: $applicationId,
      educationDetails: {
        institution_name: formData.instituteName,
        university: formData.universityName,
        institution_address: formData.instituteAddress,
        institution_district: formData.currentDistrict,
        institution_taluka: formData.currentTaluka,
        institution_place: formData.place,
        institution_pincode: formData.pinCode,
        bank_name: formData.bankName,
        branch_name: formData.branchName,
        ifsc_code: formData.ifscCode,
        account_number: formData.accountNumber,
        bank_address: formData.bankAddress,
        loan_required_amount: formData.loanRequired,
        purpose_of_loan: formData.purposeOfLoan,
        gst_number: formData.gstNumber || null,
        admission_status: formData.admissionStatus,
        admission_year: formData.admissionYear,
        total_course_fee: formData.totalCourseFee,
        fee_paid: formData.feePaid || 0,
        remaining_fee: formData.remainingFee,
        course_name: formData.courseName,
        course_type: formData.courseType,
        stream_specialization: formData.streamSpecialization,
        course_duration: formData.courseDuration,
        mode_of_study: formData.modeOfStudy,
        student_name: formData.studentName
      }
    });

    console.log('Save result:', saveResult);

    if (saveResult.error !== 0) {
      console.error('Save failed:', saveResult.errorMsg);
      alert(saveResult.errorMsg || 'Failed to save education details');
      return;
    }

    console.log('Education details saved successfully');
    console.log('Navigating to guarantor-details page');

    // sessionStorage.setItem('purposeOfLoan', formData.purposeOfLoan);
    
    goto(`/${locale}/application/guarantor-details`);

  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An error occurred while saving. Please try again.');
  } finally {
    isSubmitting = false;
  }
}

  function handleBack() {
    goto(`/${locale}/dashboard`);
  }

  function handleCancel() {
    goto(`/${locale}/application/personal-details`);
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
    
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex-1 min-w-0">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {t.academicInfo?.pageTitle || 'Student Education Details'}
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

    <!-- Student Details Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            {t.academicInfo?.section1Title || 'Student Details'}
          </h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.studentNameLabel}<span class="text-red-500">*</span>
          </label>
          <input
          type="text"
          bind:value={formData.studentName}
          on:input={() => validateField('studentName')}
          placeholder={t.academicInfo?.studentNamePlaceholder}
          class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.studentName ? 'border-red-500' : 'border-gray-300'}"
        />

          {#if errors.studentName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.studentName}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.courseNameLabel}<span class="text-red-500">*</span>
           
          </label>
          <input
          type="text"
          bind:value={formData.courseName}
          on:input={() => validateField('courseName')}  
          placeholder={t.academicInfo?.courseNamePlaceholder}
          class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.courseName ? 'border-red-500' : 'border-gray-300'}"
        />
          {#if errors.courseName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.courseName}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
             {t.academicInfo?.courseTypeLabel} <span class="text-red-500">*</span>
            
          </label>
          <select
              bind:value={formData.courseType}
              on:change={() => {
                validateField('courseType');
                loadStreamsForCourse(formData.courseType);
                formData.streamSpecialization = '';
              }}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.courseType ? 'border-red-500' : 'border-gray-300'}"
            >
            <option value="">{t.academicInfo?.courseTypePlaceholder}</option>
            {#each courses as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
          {#if errors.courseType}
            <p class="error-message mt-1 text-xs text-red-600">{errors.courseType}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.streamLabel} <span class="text-red-500">*</span>
          </label>
          <select
              bind:value={formData.streamSpecialization}
              on:change={() => validateField('streamSpecialization')}
              disabled={!formData.courseType || isLoadingStreams}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm
              {errors.streamSpecialization ? 'border-red-500' : 'border-gray-300'}
              {!formData.courseType || isLoadingStreams ? 'bg-gray-100 cursor-not-allowed' : ''}"
            >
              <option value="">{isLoadingStreams ? 'Loading...' : (t.academicInfo?.streamPlaceholder || 'Select Stream')}</option>
              {#each streams as stream}
                <option value={stream.value}>{stream.label}</option>
              {/each}
            </select>
          {#if errors.streamSpecialization}
            <p class="error-message mt-1 text-xs text-red-600">{errors.streamSpecialization}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
           {t.academicInfo?.courseDurationLabel}<span class="text-red-500">*</span>
          </label>
         <input
            type="text"
            bind:value={formData.courseDuration}
            on:input={() => validateField('courseDuration')} 
            placeholder={t.academicInfo?.courseDurationPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.courseDuration ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.courseDuration}
            <p class="error-message mt-1 text-xs text-red-600">{errors.courseDuration}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.modeOfStudyLabel}<span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.modeOfStudy}
            on:change={() => validateField('modeOfStudy')}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.modeOfStudy ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.academicInfo?.modeOfStudyPlaceholder}</option>
            {#each modesOfStudys as mode}
              <option value={mode.value}>{mode.label}</option>
            {/each}
          </select>
          {#if errors.modeOfStudy}
            <p class="error-message mt-1 text-xs text-red-600">{errors.modeOfStudy}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Institution Details Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            {t.academicInfo?.section2Title}
          </h3>
        
        </div>
      </div>

      <div class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
        
          <!-- Institute Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.academicInfo?.instituteNameLabel}<span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.instituteName}
               on:input={() => validateField('instituteName')}
              placeholder={t.academicInfo?.instituteNamePlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.instituteName ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.instituteName}
              <p class="error-message mt-1 text-xs text-red-600">{errors.instituteName}</p>
            {/if}
          </div>

          <!-- universityName -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
             {t.academicInfo?.universityNameLabel} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.universityName}
              on:input={() => validateField('universityName')}
              placeholder={t.academicInfo?.universityNamePlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.universityName ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.universityName}
              <p class="error-message mt-1 text-xs text-red-600">{errors.universityName}</p>
            {/if}
          </div>
        </div>

        <!-- Institute Address Current -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
             {t.academicInfo?.instituteAddressLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.instituteAddress}
            on:input={() => validateField('instituteAddress')}
            placeholder={t.academicInfo?.instituteAddressPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.instituteAddress ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.instituteAddress}
            <p class="error-message mt-1 text-xs text-red-600">{errors.instituteAddress}</p>
          {/if}
        </div>

        <!-- District -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.academicInfo?.districtLabel} <span class="text-red-500">*</span>
             
            </label>
            <select
              bind:value={formData.currentDistrict}
              on:change={() => {
              validateField('currentDistrict');
              loadTalukasForDistrict(formData.currentDistrict,'current'); 
              formData.currentTaluka = '';  
              }}              
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm border-gray-300"            >
              <option value="">
                {t.personalDetails?.districtPlaceholder || 'Select District'}
              </option>
              {#each districts as district}
                <option value={district.value}>{district.label}</option>
              {/each}
            </select>
            {#if errors.currentDistrict}
              <p class="error-message mt-1 text-xs text-red-600">{errors.currentDistrict}</p>
            {/if}
          </div>

          <!-- Taluka -->
          <!-- <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.academicInfo?.talukaLabel}<span class="text-red-500">*</span>
              
            </label>
            <input
              type="text"
              bind:value={formData.taluka}
              on:input={() => validateField('taluka')}
              placeholder={t.academicInfo?.talukaPlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.taluka ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.taluka}
              <p class="error-message mt-1 text-xs text-red-600">{errors.taluka}</p>
            {/if}
          </div> -->

          <div>
             <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.academicInfo?.talukaLabel}<span class="text-red-500">*</span>
            </label>

            <select
            bind:value={formData.currentTaluka}
            on:change={() => validateField('currentTaluka')}
            disabled={!formData.currentDistrict || isLoadingCurrentTalukas}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm 
            {errors.currentTaluka ? 'border-red-500' : 'border-gray-300'}
            {!formData.currentDistrict || isLoadingCurrentTalukas ? 'bg-gray-100 cursor-not-allowed' : ''}"
          >
            <option value="">
              {isLoadingCurrentTalukas ? 'Loading...' : (t.personalDetails?.talukaPlaceholder || 'Select taluka')}
            </option>
            {#each currentTalukas as taluka}
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
              {t.academicInfo?.placeLabel} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.place}
              on:input={() => validateField('place')}
              placeholder={t.academicInfo?.placePlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.place ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.place}
              <p class="error-message mt-1 text-xs text-red-600">{errors.place}</p>
            {/if}
          </div>

          <!-- pinCode -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.academicInfo?.pinCodeLabel}<span class="text-red-500">*</span>
              
            </label>
            <input
              type="text"
              bind:value={formData.pinCode}
              on:input={() => validateField('pinCode')}
              placeholder={t.academicInfo?.pinCodePlaceholder}
              maxlength="6"
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.pinCode ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.pinCode}
              <p class="error-message mt-1 text-xs text-red-600">{errors.pinCode}</p>
            {/if}
          </div>
        </div>
      </div>
    </section>

    <!-- Admission & Fee Details Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            {t.academicInfo?.section3Title}
          </h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.admissionStatusLabel}<span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.admissionStatus}
            on:change={() => validateField('admissionStatus')}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.admissionStatus ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.academicInfo?.admissionStatusPlaceholder}</option>
            {#each admissionStatuses as status}
              <option value={status.value}>{status.label}</option>
            {/each}
          </select>
          {#if errors.admissionStatus}
            <p class="error-message mt-1 text-xs text-red-600">{errors.admissionStatus}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.admissionYearLabel}<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.admissionYear}
            on:input={() => validateField('admissionYear')}
            placeholder={t.academicInfo?.admissionYearPlaceholder}
            maxlength="4"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.admissionYear ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.admissionYear}
            <p class="error-message mt-1 text-xs text-red-600">{errors.admissionYear}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.totalCourseFeeLabel}<span class="text-red-500">*</span>
            
          </label>
          <input
            type="text"
            bind:value={formData.totalCourseFee}
            on:input={() => validateField('totalCourseFee')}
            placeholder={t.academicInfo?.totalCourseFeePlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.totalCourseFee ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.totalCourseFee}
            <p class="error-message mt-1 text-xs text-red-600">{errors.totalCourseFee}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
          {t.academicInfo?.feePaidLabel}</label>
          <input
            type="text"
            bind:value={formData.feePaid}
            on:input={() => validateField('feePaid')}
            placeholder={t.academicInfo?.feePaidPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.feePaid ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.feePaid}
            <p class="error-message mt-1 text-xs text-red-600">{errors.feePaid}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.remainingFeeLabel}<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.remainingFee}
            on:input={() => validateField('remainingFee')}
            placeholder={t.academicInfo?.remainingFeePlaceholder}
            readonly
            class="w-full px-3 py-2.5 border rounded-lg bg-gray-50 text-sm {errors.remainingFee ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.remainingFee}
            <p class="error-message mt-1 text-xs text-red-600">{errors.remainingFee}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Loan Requirement Details Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
          {t.academicInfo?.section4Title}</h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.loanRequiredLabel} <span class="text-red-500">*</span>
            
          </label>
          <input
            type="text"
            bind:value={formData.loanRequired}
            on:input={() => validateField('loanRequired')}
            placeholder={t.academicInfo?.loanRequiredPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.loanRequired ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.loanRequired}
            <p class="error-message mt-1 text-xs text-red-600">{errors.loanRequired}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.purposeOfLoanLabel} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.purposeOfLoan}
            on:change={() => validateField('purposeOfLoan')} 
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.purposeOfLoan ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.academicInfo?.purposeOfLoanPlaceholder}</option>
            {#each loanPurposes as purpose}
              <option value={purpose.value}>{purpose.label}</option>
            {/each}
          </select>
          {#if errors.purposeOfLoan}
            <p class="error-message mt-1 text-xs text-red-600">{errors.purposeOfLoan}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.gstNumberLabel}
          </label>
          <input
            type="text"
            bind:value={formData.gstNumber}
            on:input={() => validateField('gstNumber')}
            placeholder={t.academicInfo?.gstNumberPlaceholder}
            maxlength="15"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.gstNumber ? 'border-red-500' : 'border-gray-300'}"
            style="text-transform: uppercase;"
          />
          {#if errors.gstNumber}
            <p class="error-message mt-1 text-xs text-red-600">{errors.gstNumber}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Bank Details Section -->
    <section class="mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            {t.academicInfo?.section5Title}
          </h3>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.bankNameLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.bankName}
            on:input={() => validateField('bankName')}
            placeholder={t.academicInfo?.bankNamePlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.bankName ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.bankName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.bankName}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.ifscCodeLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.ifscCode}
            on:input={() => validateField('ifscCode')}
            placeholder={t.academicInfo?.ifscCodePlaceholder}
            maxlength="11"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.ifscCode ? 'border-red-500' : 'border-gray-300'}"
            style="text-transform: uppercase;"
          />
          {#if errors.ifscCode}
            <p class="error-message mt-1 text-xs text-red-600">{errors.ifscCode}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.branchNameLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.branchName}
            on:input={() => validateField('branchName')}
            placeholder={t.academicInfo?.branchNamePlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.branchName ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.branchName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.branchName}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
           {t.academicInfo?.accountNumberLabel} <span class="text-red-500">*</span>
           
          </label>
          <input
            type="text"
            bind:value={formData.accountNumber}
             on:input={() => validateField('accountNumber')}
            placeholder={t.academicInfo?.accountNumberPlaceholder}
            maxlength="18"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.accountNumber ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.accountNumber}
            <p class="error-message mt-1 text-xs text-red-600">{errors.accountNumber}</p>
          {/if}
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.bankAddressLabel} <span class="text-red-500">*</span>
           
          </label>
          <input
            type="text"
            bind:value={formData.bankAddress}
            on:input={() => validateField('bankAddress')}
            placeholder={t.academicInfo?.bankAddressPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.bankAddress ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.bankAddress}
            <p class="error-message mt-1 text-xs text-red-600">{errors.bankAddress}</p>
          {/if}
        </div>
      </div>
    </section>

   <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
  
      <!-- Cancel / Back -->
      <button
        on:click={handleCancel}
        class="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <!-- Left Arrow -->
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        {t.academicInfo?.cancelButton}
      </button>

      <!-- Proceed -->
      <button
        on:click={handleProceed}
        disabled={isSubmitting}
        class="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-md text-sm"
      >
        {#if isSubmitting}
          <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>{t.academicInfo?.processing}</span>
        {:else}
          <span>{t.academicInfo?.proceedButton}</span>
          <!-- Right Arrow -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
            {/if}
          </button>

    </div>


    </div>
  </div>
</div>