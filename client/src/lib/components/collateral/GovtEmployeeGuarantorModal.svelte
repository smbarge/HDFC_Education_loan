<script>
  export let show = false;
  export let onSave;
  export let onCancel;
  
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

  const relationships = [
    { value: '', labelEn: 'Select Relationship', labelMr: 'नाते निवडा' },
    { value: 'father', labelEn: 'Father', labelMr: 'वडील' },
    { value: 'mother', labelEn: 'Mother', labelMr: 'आई' },
    { value: 'spouse', labelEn: 'Spouse', labelMr: 'जोडीदार' },
    { value: 'brother', labelEn: 'Brother', labelMr: 'भाऊ' },
    { value: 'sister', labelEn: 'Sister', labelMr: 'बहीण' },
    { value: 'uncle', labelEn: 'Uncle', labelMr: 'काका' },
    { value: 'aunt', labelEn: 'Aunt', labelMr: 'काकी' },
    { value: 'friend', labelEn: 'Friend', labelMr: 'मित्र' },
    { value: 'other', labelEn: 'Other', labelMr: 'इतर' }
  ];

  function validate() {
    errors = {};
    
    if (!formData.fullName) errors.fullName = 'Full name is required';
    else if (formData.fullName.length < 3) errors.fullName = 'Full name must be at least 3 characters';
    
    if (!formData.relationship) errors.relationship = 'Relationship is required';
    
    if (!formData.aadharNumber) errors.aadharNumber = 'Aadhar number is required';
    else if (!/^\d{12}$/.test(formData.aadharNumber)) errors.aadharNumber = 'Aadhar must be 12 digits';
    
    if (!formData.mobileNumber) errors.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) errors.mobileNumber = 'Invalid mobile number';
    
    if (!formData.residentialAddress) errors.residentialAddress = 'Residential address is required';
    if (!formData.departmentName) errors.departmentName = 'Department name is required';
    if (!formData.designation) errors.designation = 'Designation is required';
    if (!formData.employeeID) errors.employeeID = 'Employee ID is required';
    if (!formData.retirementDate) errors.retirementDate = 'Retirement date is required (Mandatory)';
    if (!formData.isPermanent) errors.isPermanent = 'Must be permanent employee';
    
    return Object.keys(errors).length === 0;
  }

  function handleAdd() {
    if (validate()) {
      onSave({ ...formData, id: Date.now(), type: 'govt-employee' });
      resetForm();
    }
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
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">
          Add Government Employee Guarantor / शासकीय हमीदार जोडा
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
        <!-- Guarantor Personal Details -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Guarantor Personal Details / हमीदाराचे वैयक्तिक तपशील
          </h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Full Name of Guarantor <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">हमीदाराचे पूर्ण नाव</span>
              </label>
              <input
                type="text"
                bind:value={formData.fullName}
                placeholder="Enter full name..."
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fullName ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fullName}
                <p class="mt-1 text-xs text-red-600">{errors.fullName}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Relationship with Applicant <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">अर्जदाराशी नाते</span>
              </label>
              <select
                bind:value={formData.relationship}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.relationship ? 'border-red-500' : 'border-gray-300'}"
              >
                {#each relationships as rel}
                  <option value={rel.value}>{rel.labelEn} - {rel.labelMr}</option>
                {/each}
              </select>
              {#if errors.relationship}
                <p class="mt-1 text-xs text-red-600">{errors.relationship}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">आधार क्रमांक</span>
              </label>
              <input
                type="text"
                bind:value={formData.aadharNumber}
                placeholder="Enter 12-digit Aadhaar..."
                maxlength="12"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.aadharNumber ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.aadharNumber}
                <p class="mt-1 text-xs text-red-600">{errors.aadharNumber}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">मोबाईल नंबर</span>
              </label>
              <input
                type="text"
                bind:value={formData.mobileNumber}
                placeholder="Enter 10-digit mobile..."
                maxlength="10"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.mobileNumber}
                <p class="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>
              {/if}
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Residential Address <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">निवासी पत्ता</span>
              </label>
              <textarea
                bind:value={formData.residentialAddress}
                placeholder="Enter complete residential address..."
                rows="2"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.residentialAddress ? 'border-red-500' : 'border-gray-300'}"
              ></textarea>
              {#if errors.residentialAddress}
                <p class="mt-1 text-xs text-red-600">{errors.residentialAddress}</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Employment Details -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Employment Details / रोजगार तपशील
          </h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Department / Office Name <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">विभाग / कार्यालयाचे नाव</span>
              </label>
              <input
                type="text"
                bind:value={formData.departmentName}
                placeholder="Enter department/office name..."
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-5000 text-sm {errors.departmentName ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.departmentName}
                <p class="mt-1 text-xs text-red-600">{errors.departmentName}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Designation <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">पदनाम</span>
              </label>
              <input
                type="text"
                bind:value={formData.designation}
                placeholder="Enter designation..."
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.designation ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.designation}
                <p class="mt-1 text-xs text-red-600">{errors.designation}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Employee ID Number <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">कर्मचारी आयडी क्रमांक</span>
              </label>
              <input
                type="text"
                bind:value={formData.employeeID}
                placeholder="Enter employee ID..."
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.employeeID ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.employeeID}
                <p class="mt-1 text-xs text-red-600">{errors.employeeID}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date of Retirement (Mandatory) <span class="text-red-500">*</span>
                <span class="block text-xs text-gray-500">सेवानिवृत्तीची तारीख (अनिवार्य)</span>
              </label>
              <input
                type="date"
                bind:value={formData.retirementDate}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.retirementDate ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.retirementDate}
                <p class="mt-1 text-xs text-red-600">{errors.retirementDate}</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Required Documents Checklist -->
        <div>
  <h4 class="font-semibold text-gray-900 mb-3">
    Required Documents <span class="text-red-500">*</span>
    <span class="block text-xs text-gray-500">आवश्यक कागदपत्रे (सर्व अनिवार्य)</span>
  </h4>

  <div class="space-y-2 bg-gray-50 p-4 rounded-lg">

    <!-- Salary Certificate -->
    <label
      class="flex items-start gap-3 p-2 rounded cursor-pointer
             hover:bg-white border"
      class:border-red-500={errors.isPermanent}
    >
      <input
        type="checkbox"
        bind:checked={formData.isPermanent}
        class="w-4 h-4 mt-1 accen-blue-600"
      />
      <div class="text-sm">
        <p class="font-medium text-gray-900">
          Original Salary Certificate <span class="text-red-500">*</span>
        </p>
        <p class="text-xs text-gray-500">
          मूळ पगार प्रमाणपत्र
        </p>
      </div>
    </label>

    <!-- Identity Card -->
    <label
      class="flex items-start gap-3 p-2 rounded cursor-pointer
             hover:bg-white border"
      class:border-red-500={errors.isPermanent}
    >
      <input
        type="checkbox"
        bind:checked={formData.isPermanent}
        class="w-4 h-4 mt-1 accent-blue-600"
      />
      <div class="text-sm">
        <p class="font-medium text-gray-900">
          Office Identity Card <span class="text-red-500">*</span>
        </p>
        <p class="text-xs text-gray-500">
          कार्यालय ओळखपत्र
        </p>
      </div>
    </label>

    <!-- Form 24(B) -->
    <label
      class="flex items-start gap-3 p-2 rounded cursor-pointer
             hover:bg-white border"
      class:border-red-500={errors.isPermanent}
    >
      <input
        type="checkbox"
        bind:checked={formData.isPermanent}
        class="w-4 h-4 mt-1 accent-blue-600"
      />
      <div class="text-sm">
        <p class="font-medium text-gray-900">
          Form – 24 (B) <span class="text-red-500">*</span>
        </p>
      </div>
    </label>

    <!-- Permanent Employee -->
    <label
      class="flex items-start gap-3 p-2 rounded cursor-pointer
             hover:bg-white border"
      class:border-red-500={errors.isPermanent}
    >
      <input
        type="checkbox"
        bind:checked={formData.isPermanent}
        class="w-4 h-4 mt-1 accent-blue-600"
      />
      <div class="text-sm">
        <p class="font-medium text-gray-900">
          Permanent Government Employee <span class="text-red-500">*</span>
        </p>
        <p class="text-xs text-gray-500">
          कायमस्वरूपी शासकीय कर्मचारी
        </p>
      </div>
    </label>

    {#if errors.isPermanent}
      <p class="text-xs text-red-600 pl-7">
        {errors.isPermanent}
      </p>
    {/if}

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