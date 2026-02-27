<script>
  import licCollateralValidation from '$lib/validation/collateral/licCollateral';

  export let show = false;
  export let onSave;
  export let onCancel;
  export let locale = 'en';
  export let t = {};
  
  let errors = {};
  
  let formData = {
    type: '',
    policyName: '',
    policyType: '',
    policyReceiptNo: '',
    policySurrenderValue: '',
    policyStartDate: '',
    policyMaturityDate: ''
  };

  function validateField(fieldName) {
    const result = licCollateralValidation(formData, t);
    const fieldErrors = result.getErrors();
    
    if (fieldErrors[fieldName]) {
      errors = { ...errors, [fieldName]: fieldErrors[fieldName] };
    } else {
      const { [fieldName]: _, ...rest } = errors;
      errors = rest;
    }
  }

  function validateForm() {
    const result = licCollateralValidation(formData, t);
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

    onSave({ ...formData, id: Date.now(), type: 'lic' });
    resetForm();
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  function resetForm() {
    formData = {
      type: '',
      policyName: '',
      policyType: '',
      policyReceiptNo: '',
      policySurrenderValue: '',
      policyStartDate: '',
      policyMaturityDate: ''
    };
    errors = {};
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">
          {t?.collateralDetails?.licCollateralModal?.modalTitle || 'Add Collateral FD/LIC'} 
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
       
        <!-- LIC Policy Details -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            {t?.collateralDetails?.licCollateralModal?.licPolicyDetailsTitle || 'LIC Policy Details'} 
          </h4>
          
          <div class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {t?.collateralDetails?.licCollateralModal?.policyName || 'Policy Name'} <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  bind:value={formData.policyName}
                  on:input={() => validateField('policyName')}
                  placeholder={t?.collateralDetails?.licCollateralModal?.policyNamePlaceholder || 'Enter Policy Name'}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyName ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.policyName}
                <p class="error-message mt-1 text-xs text-red-600">{errors.policyName}</p>
              {/if}
              </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {t?.collateralDetails?.licCollateralModal?.policyType || 'Policy Type'} <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      bind:value={formData.policyType}
                      on:input={() => validateField('policyType')}
                      placeholder={t?.collateralDetails?.licCollateralModal?.policyTypePlaceholder || 'Enter Policy Type'}
                      class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyType ? 'border-red-500' : 'border-gray-300'}"
                    />
                    {#if errors.policyType}
                      <p class="error-message mt-1 text-xs text-red-600">{errors.policyType}</p>
                    {/if}
                  </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t?.collateralDetails?.licCollateralModal?.policyReceiptNo || 'Policy Receipt No'} <span class="text-red-500">*</span>
               
              </label>
              <input
                type="text"
                bind:value={formData.policyReceiptNo}
                on:input={() => validateField('policyReceiptNo')} 
                placeholder={t?.collateralDetails?.licCollateralModal?.policyReceiptNoPlaceholder || 'Enter Policy Receipt No'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyReceiptNo ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.policyReceiptNo}
                <p class="error-message mt-1 text-xs text-red-600">{errors.policyReceiptNo}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t?.collateralDetails?.licCollateralModal?.policySurrenderValue || 'Policy Surrender Value'} <span class="text-red-500">*</span>
                
              </label>
              <input
                type="text"
                bind:value={formData.policySurrenderValue}
                on:input={() => validateField('policySurrenderValue')}
                placeholder={t?.collateralDetails?.licCollateralModal?.policySurrenderValuePlaceholder || 'Enter Policy Surrender Value'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policySurrenderValue ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.policySurrenderValue}
              <p class="error-message mt-1 text-xs text-red-600">{errors.policySurrenderValue}</p>
            {/if}
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {t?.collateralDetails?.licCollateralModal?.policyStartDate || 'Policy Start Date'} <span class="text-red-500">*</span>
                 
                </label>
                <input
                  type="date"
                  bind:value={formData.policyStartDate}
                  on:change={() => validateField('policyStartDate')}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyStartDate ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.policyStartDate}
                <p class="error-message mt-1 text-xs text-red-600">{errors.policyStartDate}</p>
              {/if}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {t?.collateralDetails?.licCollateralModal?.policyMaturityDate || 'Policy Maturity Date'} <span class="text-red-500">*</span>
                  
                </label>
                <input
                  type="date"
                  bind:value={formData.policyMaturityDate}
                  on:change={() => validateField('policyMaturityDate')}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyMaturityDate ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.policyMaturityDate}
                <p class="error-message mt-1 text-xs text-red-600">{errors.policyMaturityDate}</p>
              {/if}
              </div>
            </div>
          </div>
        </div>

       
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            on:click={handleCancel}
            class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            {t?.collateralDetails?.licCollateralModal?.cancelButton || 'Cancel'}
          </button>
          <button
            on:click={handleAdd}
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {t?.collateralDetails?.licCollateralModal?.addButton || 'Add'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}