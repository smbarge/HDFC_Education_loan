<script>
  import govtEmployeeValidation from '$lib/validation/collateral/govtEmployee';

  export let show = false;
  export let onSave;
  export let onCancel;
  export let locale = 'en';
  export let t = {};
  
  let errors = {};
  
  let formData = {
    fullName: '',
    relationship: '',
    aadharNumber: '',
    mobileNumber: '',
    residentialAddress: '',
    departmentName: '',
    designation: '',
    employeeID: '',
    hasSalaryCertificate: false,
    hasIdentityCard: false,
    retirementDate: '',
    hasForm24B: false,
    isPermanent: false
  };

  $: relationships = [
    { value: '', label: t.collateralDetails?.govtEmployeeModal?.relationshipPlaceholder || 'Select Relationship' },
    { value: 'father', label: t.collateralDetails?.govtEmployeeModal?.father || 'Father' },
    { value: 'mother', label: t.collateralDetails?.govtEmployeeModal?.mother || 'Mother' },
    { value: 'spouse', label: t.collateralDetails?.govtEmployeeModal?.spouse || 'Spouse' },
    { value: 'brother', label: t.collateralDetails?.govtEmployeeModal?.brother || 'Brother' },
    { value: 'sister', label: t.collateralDetails?.govtEmployeeModal?.sister || 'Sister' },
    { value: 'uncle', label: t.collateralDetails?.govtEmployeeModal?.uncle || 'Uncle' },
    { value: 'aunt', label: t.collateralDetails?.govtEmployeeModal?.aunt || 'Aunt' },
    { value: 'friend', label: t.collateralDetails?.govtEmployeeModal?.friend || 'Friend' },
    { value: 'other', label: t.collateralDetails?.govtEmployeeModal?.other || 'Other' }
  ];

  function validateField(fieldName) {
    const result = govtEmployeeValidation(formData, t);
    const fieldErrors = result.getErrors();
    
    if (fieldErrors[fieldName]) {
      errors = { ...errors, [fieldName]: fieldErrors[fieldName] };
    } else {
      const { [fieldName]: _, ...rest } = errors;
      errors = rest;
    }
  }

  function validateForm() {
    const result = govtEmployeeValidation(formData, t);
    errors = result.getErrors();
    return result.isValid();
  }

  function handleAdd() {
    if (!validateForm()) {
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    onSave({ ...formData, id: Date.now(), type: 'govt-employee' });
    resetForm();
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  function resetForm() {
    formData = {
      fullName: '',
      relationship: '',
      aadharNumber: '',
      mobileNumber: '',
      residentialAddress: '',
      departmentName: '',
      designation: '',
      employeeID: '',
      hasSalaryCertificate: false,
      hasIdentityCard: false,
      retirementDate: '',
      hasForm24B: false,
      isPermanent: false
    };
    errors = {};
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">
          {t.collateralDetails?.govtEmployeeModal?.modalTitle || 'Add Government Employee Guarantor'}
        </h3>
        <button
          on:click={handleCancel}
          class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-6">
   
        <!-- <div>
          <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {t.collateralDetails?.govtEmployeeModal?.personalDetailsTitle || 'Guarantor Personal Details'}
          </h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.fullName || 'Full Name of Guarantor'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.fullName}
                placeholder={t.collateralDetails?.govtEmployeeModal?.fullNamePlaceholder || 'Enter full name...'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fullName ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fullName}
                <p class="mt-1 text-xs text-red-600">{errors.fullName}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.relationship || 'Relationship with Applicant'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <select
                bind:value={formData.relationship}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.relationship ? 'border-red-500' : 'border-gray-300'}"
              >
                {#each relationships as rel}
                  <option value={rel.value}>{rel.label}</option>
                {/each}
              </select>
              {#if errors.relationship}
                <p class="mt-1 text-xs text-red-600">{errors.relationship}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.aadharNumber || 'Aadhaar Number'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.aadharNumber}
                placeholder={t.collateralDetails?.govtEmployeeModal?.aadharNumberPlaceholder || 'Enter 12-digit Aadhaar...'}
                maxlength="12"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.aadharNumber ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.aadharNumber}
                <p class="mt-1 text-xs text-red-600">{errors.aadharNumber}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.mobileNumber || 'Mobile Number'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.mobileNumber}
                placeholder={t.collateralDetails?.govtEmployeeModal?.mobileNumberPlaceholder || 'Enter 10-digit mobile...'}
                maxlength="10"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.mobileNumber}
                <p class="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>
              {/if}
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.residentialAddress || 'Residential Address'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <textarea
                bind:value={formData.residentialAddress}
                placeholder={t.collateralDetails?.govtEmployeeModal?.residentialAddressPlaceholder || 'Enter complete residential address...'}
                rows="2"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.residentialAddress ? 'border-red-500' : 'border-gray-300'}"
              ></textarea>
              {#if errors.residentialAddress}
                <p class="mt-1 text-xs text-red-600">{errors.residentialAddress}</p>
              {/if}
            </div>
          </div>
        </div> -->

        <!--  -->

        <div>
          <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {t.collateralDetails?.govtEmployeeModal?.employmentDetailsTitle || 'Employment Details'}
          </h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.departmentName || 'Department / Office Name'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.departmentName}
                on:input={() => validateField('departmentName')}
                placeholder={t.collateralDetails?.govtEmployeeModal?.departmentNamePlaceholder || 'Enter department/office name...'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.departmentName ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.departmentName}
                <p class="mt-1 text-xs text-red-600">{errors.departmentName}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.designation || 'Designation'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.designation}
                on:input={() => validateField('designation')}
                placeholder={t.collateralDetails?.govtEmployeeModal?.designationPlaceholder || 'Enter designation...'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.designation ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.designation}
              <p class="error-message mt-1 text-xs text-red-600">{errors.designation}</p>
            {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.employeeID || 'Employee ID Number'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.employeeID}
                on:input={() => validateField('employeeID')} 
                placeholder={t.collateralDetails?.govtEmployeeModal?.employeeIDPlaceholder || 'Enter employee ID...'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.employeeID ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.employeeID}
                <p class="error-message mt-1 text-xs text-red-600">{errors.employeeID}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.govtEmployeeModal?.retirementDate || 'Date of Retirement (Mandatory)'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
              </label>
              <input
                type="date"
                bind:value={formData.retirementDate}
                on:change={() => validateField('retirementDate')}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.retirementDate ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.retirementDate}
                <p class="error-message mt-1 text-xs text-red-600">{errors.retirementDate}</p>
              {/if}
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-semibold text-gray-900 mb-3">
            {t.collateralDetails?.govtEmployeeModal?.requiredDocsTitle || 'Required Documents'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
            <span class="block text-xs text-gray-500">{t.collateralDetails?.govtEmployeeModal?.requiredDocsSubtitle || 'All Mandatory'}</span>
          </h4>

          <div class="space-y-2 bg-gray-50 p-4 rounded-lg">

            <label
              class="flex items-start gap-3 p-2 rounded cursor-pointer hover:bg-white border"
              class:border-red-500={errors.isPermanent}
            >
              <input
                type="checkbox"
                bind:checked={formData.hasSalaryCertificate}
                class="w-4 h-4 mt-1 accent-blue-600"
              />
              <div class="text-sm">
                <p class="font-medium text-gray-900">
                  {t.collateralDetails?.govtEmployeeModal?.salaryCertificate || 'Original Salary Certificate'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
                </p>
              </div>
            </label>

            <label
              class="flex items-start gap-3 p-2 rounded cursor-pointer hover:bg-white border"
              class:border-red-500={errors.isPermanent}
            >
              <input
                type="checkbox"
                bind:checked={formData.hasIdentityCard}
                class="w-4 h-4 mt-1 accent-blue-600"
              />
              <div class="text-sm">
                <p class="font-medium text-gray-900">
                  {t.collateralDetails?.govtEmployeeModal?.identityCard || 'Office Identity Card'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
                </p>
              </div>
            </label>

            <label
              class="flex items-start gap-3 p-2 rounded cursor-pointer hover:bg-white border"
              class:border-red-500={errors.isPermanent}
            >
              <input
                type="checkbox"
                bind:checked={formData.hasForm24B}
                class="w-4 h-4 mt-1 accent-blue-600"
              />
              <div class="text-sm">
                <p class="font-medium text-gray-900">
                  {t.collateralDetails?.govtEmployeeModal?.form24B || 'Form – 24 (B)'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
                </p>
              </div>
            </label>

            <label
              class="flex items-start gap-3 p-2 rounded cursor-pointer hover:bg-white border"
              class:border-red-500={errors.isPermanent}
            >
              <input
                type="checkbox"
                bind:checked={formData.isPermanent}
                on:change={() => validateField('isPermanent')}
                class="w-4 h-4 mt-1 accent-blue-600"
              />
              <div class="text-sm">
                <p class="font-medium text-gray-900">
                  {t.collateralDetails?.govtEmployeeModal?.permanentEmployee || 'Permanent Government Employee'} <span class="text-red-500">{t.collateralDetails?.govtEmployeeModal?.required || '*'}</span>
                </p>
              </div>
            </label>

            {#if errors.isPermanent}
              <p class="error-message text-xs text-red-600 pl-7">
                {errors.isPermanent}
              </p>
            {/if}

          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            on:click={handleCancel}
            class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            {t.collateralDetails?.govtEmployeeModal?.cancelButton || 'Cancel'}
          </button>
          <button
            on:click={handleAdd}
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {t.collateralDetails?.govtEmployeeModal?.addButton || 'Add'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}