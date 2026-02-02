<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import ApplicationStepper from '$lib/components/newapplication/ApplicationStepper.svelte';
  import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
  import { json } from '@sveltejs/kit';

  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  let currentStep = 3;
  let isSubmitting = false;
  let errors = {};
  
  // Form data structure - ready for backend integration
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
    district: '',
    taluka: '',
    place: '',
    pinCode: '',
    
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

  // Options
  const courseTypes = [
    { value: 'UG', label: { en: 'UG (Undergraduate)', hi: 'पदवी', mr: 'पदवी' } },
    { value: 'PG', label: { en: 'PG (Postgraduate)', hi: 'पदव्युत्तर', mr: 'पदव्युत्तर' } },
    { value: 'PhD', label: { en: 'PhD', hi: 'पीएचडी', mr: 'पीएचडी' } },
    { value: 'Diploma', label: { en: 'Diploma', hi: 'डिप्लोमा', mr: 'डिप्लोमा' } },
    { value: 'Certificate', label: { en: 'Certificate', hi: 'प्रमाणपत्र', mr: 'प्रमाणपत्र' } }
  ];

  const streams = [
    { value: 'Engineering', label: { en: 'Engineering', hi: 'अभियांत्रिकी', mr: 'अभियांत्रिकी' } },
    { value: 'Medical', label: { en: 'Medical', hi: 'वैद्यकीय', mr: 'वैद्यकीय' } },
    { value: 'Commerce', label: { en: 'Commerce', hi: 'वाणिज्य', mr: 'वाणिज्य' } },
    { value: 'Arts', label: { en: 'Arts', hi: 'कला', mr: 'कला' } },
    { value: 'Science', label: { en: 'Science', hi: 'विज्ञान', mr: 'विज्ञान' } },
    { value: 'Law', label: { en: 'Law', hi: 'कायदा', mr: 'कायदा' } },
    { value: 'Management', label: { en: 'Management', hi: 'व्यवस्थापन', mr: 'व्यवस्थापन' } },
    { value: 'Other', label: { en: 'Other', hi: 'इतर', mr: 'इतर' } }
  ];

  const modesOfStudy = [
    { value: 'Full-time', label: { en: 'Full-time', hi: 'पूर्णकालिक', mr: 'पूर्णवेळ' } },
    { value: 'Part-time', label: { en: 'Part-time', hi: 'अंशकालिक', mr: 'अंशकालिक' } },
    { value: 'Distance', label: { en: 'Distance Learning', hi: 'दूरस्थ शिक्षण', mr: 'दूरस्थ शिक्षण' } }
  ];

  const admissionStatuses = [
    { value: 'Confirmed', label: { en: 'Confirmed', hi: 'पुष्टी केलेली', mr: 'पुष्टी केलेली' } },
    { value: 'Provisional', label: { en: 'Provisional', hi: 'तात्पुरती', mr: 'तात्पुरती' } }
  ];

  const loanPurposes = [
    { value: 'Tuition Fee', label: { en: 'Tuition Fee', hi: 'शिकवणी शुल्क', mr: 'शिकवणी शुल्क' } },
    { value: 'Hostel Fee', label: { en: 'Hostel Fee', hi: 'वसतिगृह शुल्क', mr: 'वसतिगृह शुल्क' } },
    { value: 'Books & Study Material', label: { en: 'Books & Study Material', hi: 'पुस्तके आणि अभ्यास साहित्य', mr: 'पुस्तके आणि अभ्यास साहित्य' } },
    { value: 'Equipment/Laptop', label: { en: 'Equipment/Laptop', hi: 'उपकरणे/लॅपटॉप', mr: 'उपकरणे/लॅपटॉप' } },
    { value: 'Other', label: { en: 'Other', hi: 'इतर', mr: 'इतर' } }
  ];

  const districts = [
    { value: 'AHMEDNAGAR', label: 'AHMEDNAGAR - अहमदनगर' },
    { value: 'AKOLA', label: 'AKOLA - अकोला' },
    { value: 'AMRAVATI', label: 'AMRAVATI - अमरावती' },
    { value: 'BEED', label: 'BEED - बीड' },
    { value: 'BHANDARA', label: 'BHANDARA - भंडारा' },
    { value: 'BULDHANA', label: 'BULDHANA - बुलडाणा' },
    { value: 'CHANDRAPUR', label: 'CHANDRAPUR - चंद्रपूर' },
    { value: 'PUNE', label: 'PUNE - पुणे' },
    { value: 'MUMBAI', label: 'MUMBAI - मुंबई' },
    { value: 'NAGPUR', label: 'NAGPUR - नागपूर' }
  ];

  // Auto-calculate remaining fee
  $: if (formData.totalCourseFee && formData.feePaid) {
    const total = parseFloat(formData.totalCourseFee) || 0;
    const paid = parseFloat(formData.feePaid) || 0;
    formData.remainingFee = (total - paid).toString();
  }

  // Form validation
  function validateForm() {
    errors = {};
    
    // Student Details
    if (!formData.studentName) {
      errors.studentName = 'Student name is required';
    } else if (formData.studentName.length < 3) {
      errors.studentName = 'Student name must be at least 3 characters';
    }
    
    if (!formData.courseName) {
      errors.courseName = 'Course name is required';
    }
    
    if (!formData.courseType) {
      errors.courseType = 'Course type is required';
    }
    
    if (!formData.streamSpecialization) {
      errors.streamSpecialization = 'Stream/Specialization is required';
    }
    
    if (!formData.courseDuration) {
      errors.courseDuration = 'Course duration is required';
    } else if (!/^\d+$/.test(formData.courseDuration)) {
      errors.courseDuration = 'Course duration must be a valid number (years)';
    }
    
    if (!formData.modeOfStudy) {
      errors.modeOfStudy = 'Mode of study is required';
    }
    
    // Institution Details
    if (!formData.instituteName) {
      errors.instituteName = 'Institute/College name is required';
    }
    
    if (!formData.universityName) {
      errors.universityName = 'University/Board name is required';
    }
    
    if (!formData.instituteAddress) {
      errors.instituteAddress = 'Institute address is required';
    }
    
    if (!formData.district) {
      errors.district = 'District is required';
    }
    
    if (!formData.taluka) {
      errors.taluka = 'Taluka is required';
    }
    
    if (!formData.place) {
      errors.place = 'Place is required';
    }
    
    if (!formData.pinCode) {
      errors.pinCode = 'Pin code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      errors.pinCode = 'Pin code must be 6 digits';
    }
    
    // Admission & Fee Details
    if (!formData.admissionStatus) {
      errors.admissionStatus = 'Admission status is required';
    }
    
    if (!formData.admissionYear) {
      errors.admissionYear = 'Admission year is required';
    }
    
    if (!formData.totalCourseFee) {
      errors.totalCourseFee = 'Total course fee is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.totalCourseFee)) {
      errors.totalCourseFee = 'Total course fee must be a valid amount';
    }
    
    if (formData.feePaid && !/^\d+(\.\d{1,2})?$/.test(formData.feePaid)) {
      errors.feePaid = 'Fee paid must be a valid amount';
    }
    
    if (!formData.remainingFee) {
      errors.remainingFee = 'Remaining fee is required';
    }
    
    // Loan Requirement Details
    if (!formData.loanRequired) {
      errors.loanRequired = 'Loan required amount is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.loanRequired)) {
      errors.loanRequired = 'Loan required must be a valid amount';
    }
    
    if (!formData.purposeOfLoan) {
      errors.purposeOfLoan = 'Purpose of loan is required';
    }
    
    // GST Number is optional but validate format if provided
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      errors.gstNumber = 'Please enter a valid GST number';
    }
    
    // Bank Details
    if (!formData.bankName) {
      errors.bankName = 'Bank name is required';
    }
    
    if (!formData.ifscCode) {
      errors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      errors.ifscCode = 'Please enter a valid IFSC code';
    }
    
    if (!formData.branchName) {
      errors.branchName = 'Branch name is required';
    }
    
    if (!formData.accountNumber) {
      errors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      errors.accountNumber = 'Account number must be 9-18 digits';
    }
    
    if (!formData.bankAddress) {
      errors.bankAddress = 'Bank address is required';
    }
    
    return Object.keys(errors).length === 0;
  }

  // Handle form submission
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
      // const response = await fetch('/api/application/academic-info', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      goto(`/${locale}/application/family-details`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      isSubmitting = false;
    }
  }

  function handleBack() {
    goto(`/${locale}/application/personal-details`);
  }

  function handleCancel() {
    goto(`/${locale}/dashboard`);
  }
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100">
  <DashboardHeader {t} {locale} />
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
        <span class="hidden sm:inline">{t.academicInfo?.backButton || 'Back'}</span>
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
        <!-- Student Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.studentNameLabel}<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.studentName}
            placeholder={t.academicInfo?.studentNamePlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.studentName ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.studentName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.studentName}</p>
          {/if}
        </div>

        <!-- Course Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.courseNameLabel}<span class="text-red-500">*</span>
           
          </label>
          <input
            type="text"
            bind:value={formData.courseName}
            placeholder={t.academicInfo?.courseNamePlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.courseName ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.courseName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.courseName}</p>
          {/if}
        </div>

        <!-- Course Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
             {t.academicInfo?.courseTypeLabel} <span class="text-red-500">*</span>
            
          </label>
          <select
            bind:value={formData.courseType}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.courseType ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.academicInfo?.courseTypePlaceholder}</option>
            {#each courseTypes as type}
              <option value={type.value}>{type.label[locale] || type.label.en}</option>
            {/each}
          </select>
          {#if errors.courseType}
            <p class="error-message mt-1 text-xs text-red-600">{errors.courseType}</p>
          {/if}
        </div>

        <!-- Stream/Specialization -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.streamLabel} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.streamSpecialization}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.streamSpecialization ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.academicInfo?.streamPlaceholder}</option>
            {#each streams as stream}
              <option value={stream.value}>{stream.label[locale] || stream.label.en}</option>
            {/each}
          </select>
          {#if errors.streamSpecialization}
            <p class="error-message mt-1 text-xs text-red-600">{errors.streamSpecialization}</p>
          {/if}
        </div>

        <!-- Course Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
           {t.academicInfo?.courseDurationLabel}<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.courseDuration}
            placeholder={t.academicInfo?.courseDurationPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.courseDuration ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.courseDuration}
            <p class="error-message mt-1 text-xs text-red-600">{errors.courseDuration}</p>
          {/if}
        </div>

        <!-- Mode of Study -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.modeOfStudyLabel}<span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.modeOfStudy}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.modeOfStudy ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.academicInfo?.modeOfStudyPlaceholder}</option>
            {#each modesOfStudy as mode}
              <option value={mode.value}>{mode.label[locale] || mode.label.en}</option>
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
              placeholder={t.academicInfo?.instituteNamePlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.instituteName ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.instituteName}
              <p class="error-message mt-1 text-xs text-red-600">{errors.instituteName}</p>
            {/if}
          </div>

          <!-- University Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
             {t.academicInfo?.universityNameLabel} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={formData.universityName}
              placeholder={t.academicInfo?.universityNamePlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.universityName ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.universityName}
              <p class="error-message mt-1 text-xs text-red-600">{errors.universityName}</p>
            {/if}
          </div>
        </div>

        <!-- Institute Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
             {t.academicInfo?.instituteAddressLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.instituteAddress}
            placeholder={t.academicInfo?.instituteAddressPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.instituteAddress ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.instituteAddress}
            <p class="error-message mt-1 text-xs text-red-600">{errors.instituteAddress}</p>
          {/if}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <!-- District -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.academicInfo?.districtLabel} <span class="text-red-500">*</span>
             
            </label>
            <select
              bind:value={formData.district}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.district ? 'border-red-500' : 'border-gray-300'}"
            >
              <option value="">{t.academicInfo?.districtPlaceholder}</option>
              {#each districts as district}
                <option value={district.value}>{district.label}</option>
              {/each}
            </select>
            {#if errors.district}
              <p class="error-message mt-1 text-xs text-red-600">{errors.district}</p>
            {/if}
          </div>

          <!-- Taluka -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.academicInfo?.talukaLabel}<span class="text-red-500">*</span>
              
            </label>
            <input
              type="text"
              bind:value={formData.taluka}
              placeholder={t.academicInfo?.talukaPlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.taluka ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.taluka}
              <p class="error-message mt-1 text-xs text-red-600">{errors.taluka}</p>
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
              placeholder={t.academicInfo?.placePlaceholder}
              class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.place ? 'border-red-500' : 'border-gray-300'}"
            />
            {#if errors.place}
              <p class="error-message mt-1 text-xs text-red-600">{errors.place}</p>
            {/if}
          </div>

          <!-- Pin Code -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {t.academicInfo?.pinCodeLabel}<span class="text-red-500">*</span>
              
            </label>
            <input
              type="text"
              bind:value={formData.pinCode}
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
        <!-- Admission Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.admissionStatusLabel}<span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.admissionStatus}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.admissionStatus ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.academicInfo?.admissionStatusPlaceholder}</option>
            {#each admissionStatuses as status}
              <option value={status.value}>{status.label[locale] || status.label.en}</option>
            {/each}
          </select>
          {#if errors.admissionStatus}
            <p class="error-message mt-1 text-xs text-red-600">{errors.admissionStatus}</p>
          {/if}
        </div>

        <!-- Admission Year -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.admissionYearLabel}<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.admissionYear}
            placeholder={t.academicInfo?.admissionYearPlaceholder}
            maxlength="4"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.admissionYear ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.admissionYear}
            <p class="error-message mt-1 text-xs text-red-600">{errors.admissionYear}</p>
          {/if}
        </div>

        <!-- Total Course Fee -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.totalCourseFeeLabel}<span class="text-red-500">*</span>
            
          </label>
          <input
            type="text"
            bind:value={formData.totalCourseFee}
            placeholder={t.academicInfo?.totalCourseFeePlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.totalCourseFee ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.totalCourseFee}
            <p class="error-message mt-1 text-xs text-red-600">{errors.totalCourseFee}</p>
          {/if}
        </div>

        <!-- Fee Paid (If Any) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
          {t.academicInfo?.feePaidLabel}</label>
          <input
            type="text"
            bind:value={formData.feePaid}
            placeholder={t.academicInfo?.feePaidPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.feePaid ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.feePaid}
            <p class="error-message mt-1 text-xs text-red-600">{errors.feePaid}</p>
          {/if}
        </div>

        <!-- Remaining Fee Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.remainingFeeLabel}<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.remainingFee}
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
        <!-- Loan Required Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.loanRequiredLabel} <span class="text-red-500">*</span>
            
          </label>
          <input
            type="text"
            bind:value={formData.loanRequired}
            placeholder={t.academicInfo?.loanRequiredPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.loanRequired ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.loanRequired}
            <p class="error-message mt-1 text-xs text-red-600">{errors.loanRequired}</p>
          {/if}
        </div>

        <!-- Purpose Of Loan -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.purposeOfLoanLabel} <span class="text-red-500">*</span>
          </label>
          <select
            bind:value={formData.purposeOfLoan}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.purposeOfLoan ? 'border-red-500' : 'border-gray-300'}"
          >
            <option value="">{t.academicInfo?.purposeOfLoanPlaceholder}</option>
            {#each loanPurposes as purpose}
              <option value={purpose.value}>{purpose.label[locale] || purpose.label.en}</option>
            {/each}
          </select>
          {#if errors.purposeOfLoan}
            <p class="error-message mt-1 text-xs text-red-600">{errors.purposeOfLoan}</p>
          {/if}
        </div>

        <!-- GST Number (Optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.gstNumberLabel}
          </label>
          <input
            type="text"
            bind:value={formData.gstNumber}
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
        <!-- Nationalized Bank Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.bankNameLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.bankName}
            placeholder={t.academicInfo?.bankNamePlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.bankName ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.bankName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.bankName}</p>
          {/if}
        </div>

        <!-- IFSC Code -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.ifscCodeLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.ifscCode}
            placeholder={t.academicInfo?.ifscCodePlaceholder}
            maxlength="11"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.ifscCode ? 'border-red-500' : 'border-gray-300'}"
            style="text-transform: uppercase;"
          />
          {#if errors.ifscCode}
            <p class="error-message mt-1 text-xs text-red-600">{errors.ifscCode}</p>
          {/if}
        </div>

        <!-- Branch Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.branchNameLabel} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={formData.branchName}
            placeholder={t.academicInfo?.branchNamePlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.branchName ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.branchName}
            <p class="error-message mt-1 text-xs text-red-600">{errors.branchName}</p>
          {/if}
        </div>

        <!-- Account Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
           {t.academicInfo?.accountNumberLabel} <span class="text-red-500">*</span>
           
          </label>
          <input
            type="text"
            bind:value={formData.accountNumber}
            placeholder={t.academicInfo?.accountNumberPlaceholder}
            maxlength="18"
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.accountNumber ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.accountNumber}
            <p class="error-message mt-1 text-xs text-red-600">{errors.accountNumber}</p>
          {/if}
        </div>

        <!-- Bank Address -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t.academicInfo?.bankAddressLabel} <span class="text-red-500">*</span>
           
          </label>
          <input
            type="text"
            bind:value={formData.bankAddress}
            placeholder={t.academicInfo?.bankAddressPlaceholder}
            class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm {errors.bankAddress ? 'border-red-500' : 'border-gray-300'}"
          />
          {#if errors.bankAddress}
            <p class="error-message mt-1 text-xs text-red-600">{errors.bankAddress}</p>
          {/if}
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
      <button
        on:click={handleCancel}
        class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        {t.academicInfo?.cancelButton}
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
          <span>{t.academicInfo?.processing}</span>
        {:else}
          <span>{t.academicInfo?.proceedButton}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        {/if}
      </button>
    </div>

    </div>
  </div>
</div>