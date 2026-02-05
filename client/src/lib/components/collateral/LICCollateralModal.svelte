<script>
  export let show = false;
  export let onSave;
  export let onCancel;
  
  let errors = {};
  
  let formData = {
    type: 'licpolicy',
    policyName: '',
    policyType: '',
    policyReceiptNo: '',
    policySurrenderValue: '',
    policyStartDate: '',
    policyMaturityDate: ''
  };

  function validate() {
    errors = {};
    
    if (!formData.policyName) errors.policyName = 'Policy name is required';
    if (!formData.policyType) errors.policyType = 'Policy type is required';
    if (!formData.policyReceiptNo) errors.policyReceiptNo = 'Policy receipt number is required';
    if (!formData.policySurrenderValue) errors.policySurrenderValue = 'Policy surrender value is required';
    if (!formData.policyStartDate) errors.policyStartDate = 'Policy start date is required';
    if (!formData.policyMaturityDate) errors.policyMaturityDate = 'Policy maturity date is required';
    
    return Object.keys(errors).length === 0;
  }

  function handleAdd() {
    if (validate()) {
      onSave({ ...formData, id: Date.now(), type: 'lic' });
      resetForm();
    }
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  function resetForm() {
    formData = {
      type: 'licpolicy',
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
          Add Collateral FD/LIC / एफडी किंवा एलआयसी तारण जोडा
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
            LIC Policy Details / एलआयसी पॉलिसी तपशील
          </h4>
          
          <div class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Policy Name <span class="text-red-500">*</span>
                  <span class="block text-xs text-gray-500">
                    पॉलिसीचे नाव
                  </span>
                </label>
                <input
                  type="text"
                  bind:value={formData.policyName}
                  placeholder="Enter Policy Name"
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyName ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.policyName}
                  <p class="mt-1 text-xs text-red-600">{errors.policyName}</p>
                {/if}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Policy Type <span class="text-red-500">*</span>
                  <span class="block text-xs text-gray-500">
                    पॉलिसीचा प्रकार
                  </span>
                </label>
                <input
                  type="text"
                  bind:value={formData.policyType}
                  placeholder="Enter Policy Type"
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyType ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.policyType}
                  <p class="mt-1 text-xs text-red-600">{errors.policyType}</p>
                {/if}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Policy Receipt No <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                   पॉलिसी पावती क्रमांक
                  </span>
              </label>
              <input
                type="text"
                bind:value={formData.policyReceiptNo}
                placeholder="Enter Policy Receipt No"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyReceiptNo ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.policyReceiptNo}
                <p class="mt-1 text-xs text-red-600">{errors.policyReceiptNo}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Policy Surrender Value <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">
                  पॉलिसीची समर्पण मूल्य
                  </span>
              </label>
              <input
                type="text"
                bind:value={formData.policySurrenderValue}
                placeholder="Enter Policy Surrender Value"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policySurrenderValue ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.policySurrenderValue}
                <p class="mt-1 text-xs text-red-600">{errors.policySurrenderValue}</p>
              {/if}
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Policy Start Date <span class="text-red-500">*</span>
                  <span class="block text-xs text-gray-500">
                  पॉलिसीची सुरूवात तारीख
                  </span>
                </label>
                <input
                  type="date"
                  bind:value={formData.policyStartDate}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyStartDate ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.policyStartDate}
                  <p class="mt-1 text-xs text-red-600">{errors.policyStartDate}</p>
                {/if}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Policy Maturity Date <span class="text-red-500">*</span>
                  <span class="block text-xs text-gray-500">
                  पॉलिसीची परिपक्वता तारीख
                  </span>
                </label>
                <input
                  type="date"
                  bind:value={formData.policyMaturityDate}
                  class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.policyMaturityDate ? 'border-red-500' : 'border-gray-300'}"
                />
                {#if errors.policyMaturityDate}
                  <p class="mt-1 text-xs text-red-600">{errors.policyMaturityDate}</p>
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