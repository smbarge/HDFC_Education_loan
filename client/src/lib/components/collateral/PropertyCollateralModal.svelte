<script>
  import propertyCollateralValidation from '$lib/validation/collateral/propertyCollateral';

  export let show = false;
  export let onSave;
  export let onCancel;
  export let locale = 'en'; 
  export let t = {};  
  
  let errors = {};
  
  let formData = {
    propertyType: '',
    documentType: '',
    surveyNo: '',
    district: '',
    taluka: '',
    village: '',
    pinCode: '',
    units: '',
    hectares: '',
    rGuntha: '',
    propertyValue: ''
  };

  const propertyTypes = [
    { value: 'residential', label: 'residential' },
    { value: 'commercial', label: 'commercial' },
    { value: 'agriland', label: 'agriLand' },
    { value: 'openplot', label: 'openPlot' }
  ];

  const documentTypes = [
    { value: '712', label: 'doc712' },
    { value: '8a', label: 'doc8A' },
    { value: 'prcard', label: 'prCard' },
    { value: '6D', label: 'doc6D' }
  ];

  const districts = [
    { value: '', label: 'Select District' },
    { value: 'KOLHAPUR', label: 'KOLHAPUR' },
    { value: 'PUNE', label: 'PUNE' },
    { value: 'MUMBAI', label: 'MUMBAI' },
    { value: 'NAGPUR', label: 'NAGPUR' },
    { value: 'BEED', label: 'BEED' }
  ];

  const talukas = [
    { value: '', label: 'Select Taluka' },
    { value: 'HATKALANGLE', label: 'HATKALANGLE' },
    { value: 'BEED', label: 'BEED' },
    { value: 'ASHTI', label: 'ASHTI' }
  ];

  function validateField(fieldName) {
    const result = propertyCollateralValidation(formData, t);
    const fieldErrors = result.getErrors();
    
    if (fieldErrors[fieldName]) {
      errors = { ...errors, [fieldName]: fieldErrors[fieldName] };
    } else {
      const { [fieldName]: _, ...rest } = errors;
      errors = rest;
    }
  }

  function validateForm() {
    const result = propertyCollateralValidation(formData, t);
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

    onSave({ ...formData, id: Date.now(), type: 'property' });
    resetForm();
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  function resetForm() {
    formData = {
      propertyType: '',
      documentType: '',
      surveyNo: '',
      district: '',
      taluka: '',
      village: '',
      pinCode: '',
      units: '',
      hectares: '',
      rGuntha: '',
      propertyValue: ''
    };
    errors = {};
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">
          {t?.collateralDetails?.propertyCollateralModal?.modalTitle || 'Add Collateral Property'}
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

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t?.collateralDetails?.propertyCollateralModal?.propertyTypeLabel || 'Please select the property type:'} <span class="text-red-500">*</span>
           
          </label>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            {#each propertyTypes as type}
              <label class="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2
                            hover:border-blue-400
                            peer-checked:border-blue-500">
                
                <input
                  type="radio"
                  name="propertyType"
                  value={type.value}
                  bind:group={formData.propertyType}
                  on:change={() => validateField('propertyType')}
                  class="w-4 h-4 accent-blue-600"
                />

                <div class="leading-tight">
                  <p class="text-sm font-medium text-gray-900">
                    {t?.collateralDetails?.propertyCollateralModal?.[type.label] || type.value}
                  </p>
                 
                </div>
       
                  
              </label>
            {/each}
          </div>
          {#if errors.propertyType}
                    <p class="error-message mt-2 text-xs text-red-600">{errors.propertyType}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {t?.collateralDetails?.propertyCollateralModal?.documentTypeLabel || 'Please select the document type:'} <span class="text-red-500">*</span>
            
          </label>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            {#each documentTypes as doc}
              <label
                class="flex items-center gap-2 border rounded-md px-3 py-2
                      cursor-pointer hover:border-blue-400">

                <input
                  type="radio"
                  name="documentType"
                  value={doc.value}
                  bind:group={formData.documentType}
                  on:change={() => validateField('documentType')}
                  class="w-4 h-4 accent-blue-600"
                />

                <div class="leading-tight">
                  <p class="text-sm font-medium text-gray-900">
                    {t?.collateralDetails?.propertyCollateralModal?.[doc.label] || doc.value}
                  </p>
                 
                </div>
               

              </label>
            {/each}
          </div>
           {#if errors.documentType}
                  <p class="error-message mt-2 text-xs text-red-600">{errors.documentType}</p>
            {/if}
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            {t?.collateralDetails?.propertyCollateralModal?.propertyAddressTitle || 'Property Address'}
          </h4>
          
          <div class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t?.collateralDetails?.propertyCollateralModal?.surveyNo || 'Survey No'}  <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={formData.surveyNo}
                on:input={() => validateField('surveyNo')}
                placeholder={t?.collateralDetails?.propertyCollateralModal?.surveyNoPlaceholder || 'Enter Survey No.'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.surveyNo ? 'border-red-500' : 'border-gray-300'}"
              />
             {#if errors.surveyNo}
              <p class="error-message mt-1 text-xs text-red-600">{errors.surveyNo}</p>
            {/if}
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {t?.collateralDetails?.propertyCollateralModal?.district || 'District'} <span class="text-red-500">*</span>
                </label>
                <select
                  bind:value={formData.district}
                  on:change={() => validateField('district')}  
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.district ? 'border-red-500' : 'border-gray-300'}"
                >
                  {#each districts as dist}
                    <option value={dist.value}>{dist.label}</option>
                  {/each}
                </select>
               {#if errors.district}
                <p class="error-message mt-1 text-xs text-red-600">{errors.district}</p>
              {/if}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {t?.collateralDetails?.propertyCollateralModal?.taluka || 'Taluka'} <span class="text-red-500">*</span>
                </label>
                <select
                  bind:value={formData.taluka}
                  on:change={() => validateField('taluka')}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.taluka ? 'border-red-500' : 'border-gray-300'}"
                >
                  {#each talukas as tal}
                    <option value={tal.value}>{tal.label}</option>
                  {/each}
                </select>
                {#if errors.taluka}
                  <p class="error-message mt-1 text-xs text-red-600">{errors.taluka}</p>
                {/if}
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {t?.collateralDetails?.propertyCollateralModal?.village || 'Village'} <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  bind:value={formData.village}
                  on:input={() => validateField('village')}
                  placeholder={t?.collateralDetails?.propertyCollateralModal?.villagePlaceholder || 'Enter City/Town/Village of property'}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.village ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.village}
                <p class="error-message mt-1 text-xs text-red-600">{errors.village}</p>
              {/if}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {t?.collateralDetails?.propertyCollateralModal?.pinCode || 'PIN code'} <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  bind:value={formData.pinCode}
                  on:input={() => validateField('pinCode')}
                  placeholder={t?.collateralDetails?.propertyCollateralModal?.pinCodePlaceholder || 'Enter PIN code'}
                  maxlength="6"
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.pinCode ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.pinCode}
                <p class="error-message mt-1 text-xs text-red-600">{errors.pinCode}</p>
              {/if}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            {t?.collateralDetails?.propertyCollateralModal?.propertyValueAreaTitle || 'Property Value and Area'} 
          </h4>
          
          <div class="grid md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t?.collateralDetails?.propertyCollateralModal?.units || 'Units'} <span class="text-red-500">*</span>
              </label>
              <select
                bind:value={formData.units}
                 on:change={() => validateField('units')}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              >
                <option value="">{t?.collateralDetails?.propertyCollateralModal?.unitsPlaceholder || 'Select'}</option>
                <option value="hectares">{t?.collateralDetails?.propertyCollateralModal?.unitsHectares || 'Hectares'}</option>
                <option value="acres">{t?.collateralDetails?.propertyCollateralModal?.unitsAcres || 'Acres'}</option>
                <option value="guntha">{t?.collateralDetails?.propertyCollateralModal?.unitsGuntha || 'Guntha'}</option>
              </select>
              {#if errors.units}
              <p class="error-message mt-1 text-xs text-red-600">{errors.units}</p>
            {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t?.collateralDetails?.propertyCollateralModal?.hectaresAcres || 'Hectares/Acres'}  <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={formData.hectares}
                 on:input={() => validateField('hectares')}
                placeholder={t?.collateralDetails?.propertyCollateralModal?.hectaresPlaceholder || 'Enter Area'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              />
              {#if errors.hectares}
                <p class="error-message mt-1 text-xs text-red-600">{errors.hectares}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t?.collateralDetails?.propertyCollateralModal?.rGuntha || 'R/Guntha'} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={formData.rGuntha}
                on:input={() => validateField('rGuntha')}
                placeholder={t?.collateralDetails?.propertyCollateralModal?.rGunthaPlaceholder || 'Enter Area'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              />
              {#if errors.rGuntha}
              <p class="error-message mt-1 text-xs text-red-600">{errors.rGuntha}</p>
            {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t?.collateralDetails?.propertyCollateralModal?.propertyValue || 'Property Value in Rs'}  <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={formData.propertyValue}
                on:input={() => validateField('propertyValue')}
                placeholder={t?.collateralDetails?.propertyCollateralModal?.propertyValuePlaceholder || 'Enter property value'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.propertyValue ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.propertyValue}
                <p class="error-message mt-1 text-xs text-red-600">{errors.propertyValue}</p>
              {/if}
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            on:click={handleCancel}
            class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            {t?.collateralDetails?.propertyCollateralModal?.cancelButton || 'Cancel'}
          </button>
          <button
            on:click={handleAdd}
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {t?.collateralDetails?.propertyCollateralModal?.addButton || 'Add'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}