<script>
  export let show = false;
  export let onSave;
  export let onCancel;
  
  let errors = {};
  
  let formData = {
    type: 'bankfd',
    bankName: '',
    branchName: '',
    streetAddress: '',
    district: '',
    taluka: '',
    place: '',
    pinCode: '',
    fdAccountNumber: '',
    fdStartDate: '',
    fdMaturityDate: '',
    interestRate: '',
    fdDepositAmount: ''
  };

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
    
    if (!formData.bankName) errors.bankName = 'Bank name is required';
    if (!formData.branchName) errors.branchName = 'Branch name is required';
    if (!formData.streetAddress) errors.streetAddress = 'Street address is required';
    if (!formData.district) errors.district = 'District is required';
    if (!formData.taluka) errors.taluka = 'Taluka is required';
    if (!formData.place) errors.place = 'Place is required';
    if (!formData.pinCode) errors.pinCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pinCode)) errors.pinCode = 'PIN code must be 6 digits';
    if (!formData.fdAccountNumber) errors.fdAccountNumber = 'FD account number is required';
    if (!formData.fdStartDate) errors.fdStartDate = 'FD start date is required';
    if (!formData.fdMaturityDate) errors.fdMaturityDate = 'FD maturity date is required';
    if (!formData.interestRate) errors.interestRate = 'Interest rate is required';
    if (!formData.fdDepositAmount) errors.fdDepositAmount = 'FD deposit amount is required';
    
    return Object.keys(errors).length === 0;
  }

  function handleAdd() {
    if (validate()) {
      onSave({ ...formData, id: Date.now(), type: 'fd' });
      resetForm();
    }
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  function resetForm() {
    formData = {
      type: 'bankfd',
      bankName: '',
      branchName: '',
      streetAddress: '',
      district: '',
      taluka: '',
      place: '',
      pinCode: '',
      fdAccountNumber: '',
      fdStartDate: '',
      fdMaturityDate: '',
      interestRate: '',
      fdDepositAmount: ''
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
          Add Collateral FD/ तारण एफडी जोडा
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
        <!-- Property Type -->
  
        <!-- FD Bank Details -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            FD Bank Details/ एफडी बँक तपशील
          </h4>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bank Name <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                 बँकचे नाव
               </span>
              </label>
              <input
                type="text"
                bind:value={formData.bankName}
                placeholder="Enter Bank Name"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.bankName ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.bankName}
                <p class="mt-1 text-xs text-red-600">{errors.bankName}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Branch Name <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                 शाखेचे नाव
               </span>
              </label>
              <input
                type="text"
                bind:value={formData.branchName}
                placeholder="Enter Branch Name"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.branchName ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.branchName}
                <p class="mt-1 text-xs text-red-600">{errors.branchName}</p>
              {/if}
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                 रस्त्याचा पत्ता
               </span>
              </label>
              <input
                type="text"
                bind:value={formData.streetAddress}
                placeholder="Enter Bank Address"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.streetAddress ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.streetAddress}
                <p class="mt-1 text-xs text-red-600">{errors.streetAddress}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                District <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                जिल्हा
               </span>
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
                Taluka <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                तालुका
               </span>
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

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Place <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                ठिकाण
               </span>
              </label>
              <input
                type="text"
                bind:value={formData.place}
                placeholder="Enter City/Town/Village of Bank"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.place ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.place}
                <p class="mt-1 text-xs text-red-600">{errors.place}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                PIN code <span class="text-red-500">*</span>
                 <span class="block text-xs text-gray-500">
                पिन कोड
               </span>
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

        <!-- FD Details -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            FD Details / मुदत ठेव तपशील
          </h4>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                FD Account Number <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                मुदत ठेव खाते क्रमांक
               </span>
              </label>
              <input
                type="text"
                bind:value={formData.fdAccountNumber}
                placeholder="Enter FD Account Number"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fdAccountNumber ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fdAccountNumber}
                <p class="mt-1 text-xs text-red-600">{errors.fdAccountNumber}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                FD Start Date <span class="text-red-500">*</span>
                 <span class="block text-xs text-gray-500">
                मुदत ठेवीची सुरुवात तारीख
               </span>
              </label>
              <input
                type="date"
                bind:value={formData.fdStartDate}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fdStartDate ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fdStartDate}
                <p class="mt-1 text-xs text-red-600">{errors.fdStartDate}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                FD Maturity Date <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                मुदत ठेवीची परिपक्वता तारीख
               </span>
              </label>
              <input
                type="date"
                bind:value={formData.fdMaturityDate}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fdMaturityDate ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fdMaturityDate}
                <p class="mt-1 text-xs text-red-600">{errors.fdMaturityDate}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                व्याजाचा दर
               </span>
              </label>
              <input
                type="number"
                bind:value={formData.interestRate}
                placeholder="0"
                step="0.01"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.interestRate ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.interestRate}
                <p class="mt-1 text-xs text-red-600">{errors.interestRate}</p>
              {/if}
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                FD Deposit Amount <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                एफडी जमा रक्कम
               </span>
              </label>
              <input
                type="text"
                bind:value={formData.fdDepositAmount}
                placeholder="Enter FD Deposit Amount"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fdDepositAmount ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fdDepositAmount}
                <p class="mt-1 text-xs text-red-600">{errors.fdDepositAmount}</p>
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