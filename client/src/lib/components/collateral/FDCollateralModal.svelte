<script>
  import fdCollateralValidation from '$lib/validation/collateral/fdCollateral';
  import { fetchMasters, fetchTalukas } from '$lib/api/auth';
  import { onMount } from 'svelte';

  export let show = false;
  export let onSave;
  export let onCancel;
  export let locale = 'en';
  export let t = {};
  
  let errors = {};
  let districts = [];
  let talukas = [];

  let isLoadingTalukas = false;

  let isLoadingDistricts = false;
  let districtError = null;
  
  let formData = {
    type: '',
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

  onMount(async () => {
    await loadMasters();
  });


async function loadMasters() {
  isLoadingDistricts = true;
  districtError = null;

  try {
    const result = await fetchMasters();

    if (result.error === 0) {
      districts = result.masters.m_district.map(row => ({
        value: row.dist_id,
        label: `${row.eng_name} - ${row.dev_name}`,
        state_id: row.state_id,
        country_id: row.country_id
      }));
    
    } else {
      districtError = 'Failed to load masters';
    }

  } catch (error) {
    console.error('Failed to load masters:', error);
    districtError = 'Failed to load masters';
  } finally {
    isLoadingDistricts = false;
  }
}


async function loadTalukasForDistrict(districtId) {
  const district = districts.find(d => d.value == districtId);
  if (!district) return;

  isLoadingTalukas = true;
  talukas = [];

  try {
    const result = await fetchTalukas({
      district_id: district.value,
      state_id: district.state_id,
      country_id: district.country_id
    });

    if (result.error === 0 && Array.isArray(result.talukas)) {
      talukas = result.talukas.map(row => ({
        value: row.taluka_id,
        label: `${row.eng_name} - ${row.dev_name}`
      }));
    }
  } catch (error) {
    console.error('Failed to load talukas:', error);
  } finally {
    isLoadingTalukas = false;
  }
}


  function validateField(fieldName) {
    const result = fdCollateralValidation(formData, t);
    const fieldErrors = result.getErrors();
    
    if (fieldErrors[fieldName]) {
      errors = { ...errors, [fieldName]: fieldErrors[fieldName] };
    } else {
      const { [fieldName]: _, ...rest } = errors;
      errors = rest;
    }
  }

  function validateForm() {
    const result = fdCollateralValidation(formData, t);
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

    onSave({ ...formData, id: Date.now(), type: 'fd' });
    resetForm();
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  function resetForm() {
    formData = {
      type: '',
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
          {t.collateralDetails?.fdCollateralModal?.modalTitle || 'Add Collateral FD'}
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
        <!-- FD Bank Details -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            {t.collateralDetails?.fdCollateralModal?.fdBankDetailsTitle || 'FD Bank Details'}
          </h4>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.bankName || 'Bank Name'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.bankName}
                on:input={() => validateField('bankName')}
                placeholder={t.collateralDetails?.fdCollateralModal?.bankNamePlaceholder || 'Enter Bank Name'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.bankName ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.bankName}
              <p class="error-message mt-1 text-xs text-red-600">{errors.bankName}</p>
            {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.branchName || 'Branch Name'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.branchName}
                on:input={() => validateField('branchName')}
                placeholder={t.collateralDetails?.fdCollateralModal?.branchNamePlaceholder || 'Enter Branch Name'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.branchName ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.branchName}
              <p class="error-message mt-1 text-xs text-red-600">{errors.branchName}</p>
            {/if}
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.streetAddress || 'Street Address'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.streetAddress}
                on:input={() => validateField('streetAddress')}
                placeholder={t.collateralDetails?.fdCollateralModal?.streetAddressPlaceholder || 'Enter Bank Address'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.streetAddress ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.streetAddress}
                <p class="error-message mt-1 text-xs text-red-600">{errors.streetAddress}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.district || 'District'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              
              <select
                    bind:value={formData.district}
                    on:change={() => {
                      validateField('district');
                      loadTalukasForDistrict(formData.district);
                      formData.taluka = '';
                    }}
                    class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">{t?.collateralDetails?.fdCollateralModal?.districtPlaceholder || 'Select District'}</option>
                    {#each districts as district}
                      <option value={district.value}>{district.label}</option>
                    {/each}
                  </select>
              {#if errors.district}
              <p class="error-message mt-1 text-xs text-red-600">{errors.district}</p>
            {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.taluka || 'Taluka'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              
              <select
                    bind:value={formData.taluka}
                    on:change={() => validateField('taluka')}
                    disabled={!formData.district || isLoadingTalukas}
                    class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm
                    {errors.taluka ? 'border-red-500' : 'border-gray-300'}
                    {!formData.district || isLoadingTalukas ? 'bg-gray-100 cursor-not-allowed' : ''}"
                  >
                    <option value="">
                      {isLoadingTalukas ? 'Loading...' : (t?.collateralDetails?.fdCollateralModal?.talukaPlaceholder || 'Select Taluka')}
                    </option>
                    {#each talukas as taluka}
                      <option value={taluka.value}>{taluka.label}</option>
                    {/each}
              </select>


              {#if errors.taluka}
              <p class="error-message mt-1 text-xs text-red-600">{errors.taluka}</p>
            {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.place || 'Place'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.place}
                on:input={() => validateField('place')}
                placeholder={t.collateralDetails?.fdCollateralModal?.placePlaceholder || 'Enter City/Town/Village of Bank'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.place ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.place}
              <p class="error-message mt-1 text-xs text-red-600">{errors.place}</p>
            {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.pinCode || 'PIN code'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.pinCode}
                on:input={() => validateField('pinCode')}
                placeholder={t.collateralDetails?.fdCollateralModal?.pinCodePlaceholder || 'Enter PIN code'}
                maxlength="6"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.pinCode ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.pinCode}
              <p class="error-message mt-1 text-xs text-red-600">{errors.pinCode}</p>
            {/if}
            </div>
          </div>
        </div>

        <!-- FD Details -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
            {t.collateralDetails?.fdCollateralModal?.fdDetailsTitle || 'FD Details'}
          </h4>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.fdAccountNumber || 'FD Account Number'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.fdAccountNumber}
                on:input={() => validateField('fdAccountNumber')}
                placeholder={t.collateralDetails?.fdCollateralModal?.fdAccountNumberPlaceholder || 'Enter FD Account Number'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fdAccountNumber ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fdAccountNumber}
                <p class="error-message mt-1 text-xs text-red-600">{errors.fdAccountNumber}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.fdStartDate || 'FD Start Date'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="date"
                bind:value={formData.fdStartDate}
                on:change={() => validateField('fdStartDate')} 
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fdStartDate ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fdStartDate}
                <p class="error-message mt-1 text-xs text-red-600">{errors.fdStartDate}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.fdMaturityDate || 'FD Maturity Date'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="date"
                bind:value={formData.fdMaturityDate}
                on:change={() => validateField('fdMaturityDate')}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fdMaturityDate ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fdMaturityDate}
                <p class="error-message mt-1 text-xs text-red-600">{errors.fdMaturityDate}</p>
              {/if}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.interestRate || 'Interest Rate'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="number"
                bind:value={formData.interestRate}
                on:input={() => validateField('interestRate')}
                placeholder={t.collateralDetails?.fdCollateralModal?.interestRatePlaceholder || '0'}
                step="0.01"
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.interestRate ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.interestRate}
              <p class="error-message mt-1 text-xs text-red-600">{errors.interestRate}</p>
            {/if}
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {t.collateralDetails?.fdCollateralModal?.fdDepositAmount || 'FD Deposit Amount'} <span class="text-red-500">{t.collateralDetails?.fdCollateralModal?.required || '*'}</span>
              </label>
              <input
                type="text"
                bind:value={formData.fdDepositAmount}
                on:input={() => validateField('fdDepositAmount')}
                placeholder={t.collateralDetails?.fdCollateralModal?.fdDepositAmountPlaceholder || 'Enter FD Deposit Amount'}
                class="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm {errors.fdDepositAmount ? 'border-red-500' : 'border-gray-300'}"
              />
              {#if errors.fdDepositAmount}
                <p class="error-message mt-1 text-xs text-red-600">{errors.fdDepositAmount}</p>
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
            {t.collateralDetails?.fdCollateralModal?.cancelButton || 'Cancel'}
          </button>
          <button
            on:click={handleAdd}
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {t.collateralDetails?.fdCollateralModal?.addButton || 'Add'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}