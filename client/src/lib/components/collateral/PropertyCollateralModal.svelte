<script>
  export let show = false;
  export let onSave;
  export let onCancel;
  
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
    { value: 'residential', labelEn: 'Residential', labelMr: 'निवासी' },
    { value: 'commercial', labelEn: 'Commercial', labelMr: 'व्यावसायिक' },
    { value: 'agriland', labelEn: 'Agri Land', labelMr: 'कृषी जमीन' },
    { value: 'openplot', labelEn: 'Open Plot', labelMr: 'खुली जागा' }
  ];

  const documentTypes = [
    { value: '712', labelEn: '7/12', labelMr: '०/१२ उतारा' },
    { value: '8a', labelEn: '8A', labelMr: '८अ उतारा' },
    { value: 'prcard', labelEn: 'PR Card', labelMr: 'पीआर कार्ड' },
    { value: '6D', labelEn: '6D', labelMr: '६ डी' }
  ];

  const districts = [
    { value: '', label: 'District' },
    { value: 'KOLHAPUR', label: 'KOLHAPUR' },
    { value: 'PUNE', label: 'PUNE' },
    { value: 'MUMBAI', label: 'MUMBAI' },
    { value: 'NAGPUR', label: 'NAGPUR' },
    { value: 'BEED', label: 'BEED' }
  ];

  const talukas = [
    { value: '', label: 'Taluka' },
    { value: 'HATKALANGLE', label: 'HATKALANGLE' },
    { value: 'BEED', label: 'BEED' },
    { value: 'ASHTI', label: 'ASHTI' }
  ];

  function validate() {
    errors = {};
    
    if (!formData.surveyNo) errors.surveyNo = 'Survey number is required';
    if (!formData.district) errors.district = 'District is required';
    if (!formData.taluka) errors.taluka = 'Taluka is required';
    if (!formData.village) errors.village = 'Village is required';
    if (!formData.pinCode) errors.pinCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pinCode)) errors.pinCode = 'PIN code must be 6 digits';
    if (!formData.propertyValue) errors.propertyValue = 'Property value is required';
    
    return Object.keys(errors).length === 0;
  }

  function handleAdd() {
    if (validate()) {
      onSave({ ...formData, id: Date.now(), type: 'property' });
      resetForm();
    }
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  function resetForm() {
    formData = {
      propertyType: 'agriland',
      documentType: '712',
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
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">
          Add Collateral Property / तारण मालमत्ता जोडा
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
        <!-- Property Type Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Please select the property type: <span class="text-red-500">*</span>
            <span class="block text-xs text-gray-500">
              कृपया संपत्तीचा प्रकार निवडा
            </span>
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
                    class="w-4 h-4 accent-blue-600"
                  />

                  <div class="leading-tight">
                    <p class="text-sm font-medium text-gray-900">
                      {type.labelEn}
                    </p>
                    <p class="text-xs text-gray-600">
                      {type.labelMr}
                    </p>
                  </div>
                </label>
              {/each}
            </div>
        </div>


        <!-- Document Type Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Please select the document type: <span class="text-red-500">*</span>
            <span class="block text-xs text-gray-500">
              कृपया दस्तऐवज प्रकार निवडा
            </span>
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
                  class="w-4 h-4 accent-blue-600"
                />

                <div class="leading-tight">
                  <p class="text-sm font-medium text-gray-900">
                    {doc.labelEn}
                  </p>
                  <p class="text-xs text-gray-600">
                    {doc.labelMr}
                  </p>
                </div>

              </label>
            {/each}
          </div>
        </div>


        <!-- Property Address Section -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            Property Address / मालमत्तेचा पत्ता
          </h4>
          
          <div class="space-y-4">
            <!-- Survey No -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Survey No / सर्वे नंबर <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={formData.surveyNo}
                placeholder="Enter Survey No."
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.surveyNo ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.surveyNo}
                <p class="mt-1 text-xs text-red-600">{errors.surveyNo}</p>
              {/if}
            </div>

            <!-- District and Taluka -->
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  District / जिल्हा <span class="text-red-500">*</span>
                </label>
                <select
                  bind:value={formData.district}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.district ? 'border-red-500' : 'border-gray-300'}"
                >
                  {#each districts as dist}
                    <option value={dist.value}>{dist.label}</option>
                  {/each}
                </select>
                {#if errors.district}
                  <p class="mt-1 text-xs text-red-600">{errors.district}</p>
                {/if}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Taluka / तालुका <span class="text-red-500">*</span>
                </label>
                <select
                  bind:value={formData.taluka}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.taluka ? 'border-red-500' : 'border-gray-300'}"
                >
                  {#each talukas as tal}
                    <option value={tal.value}>{tal.label}</option>
                  {/each}
                </select>
                {#if errors.taluka}
                  <p class="mt-1 text-xs text-red-600">{errors.taluka}</p>
                {/if}
              </div>
            </div>

            <!-- Village and PIN Code -->
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Village / गाव <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  bind:value={formData.village}
                  placeholder="Enter City/Town/Village of property"
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.village ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.village}
                  <p class="mt-1 text-xs text-red-600">{errors.village}</p>
                {/if}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  PIN code / पिन कोड <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  bind:value={formData.pinCode}
                  placeholder="Enter PIN code"
                  maxlength="6"
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.pinCode ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.pinCode}
                  <p class="mt-1 text-xs text-red-600">{errors.pinCode}</p>
                {/if}
              </div>
            </div>
          </div>
        </div>

        <!-- Property Value and Area -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            Property Value and Area / मालमत्तेची किंमत आणि क्षेत्र मध्ये
          </h4>
          
          <div class="grid md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Units / युनिट्स <span class="text-red-500">*</span>
              </label>
              <select
                bind:value={formData.units}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              >
                <option value="">Select</option>
                <option value="hectares">Hectares</option>
                <option value="acres">Acres</option>
                <option value="guntha">Guntha</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Hectares/acers / हेक्टर / एकर <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={formData.hectares}
                placeholder="Enter Area"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                R/guntha / आर / गुंठा <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={formData.rGuntha}
                placeholder="Enter Area"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Property Value in Rs / मालमत्तेची किंमत रुपये मध्ये <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={formData.propertyValue}
                placeholder="Enter property value"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.propertyValue ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.propertyValue}
                <p class="mt-1 text-xs text-red-600">{errors.propertyValue}</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            on:click={handleCancel}
            class="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            on:click={handleAdd}
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}