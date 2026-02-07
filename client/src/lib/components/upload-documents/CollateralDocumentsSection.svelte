<script>
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n';
  import DocumentUploadRow from './DocumentUploadRow.svelte';
  
  $: locale = $page.params.locale || 'en';
  $: t = i18n[locale];

  export let collateralItems = []; 
  export let onUpload = () => {};
  export let onView = () => {};
  export let onDelete = () => {};
  export let uploadedDocs = {};
  export let uploadErrors = {};


  const documentsMap = {
    property: [
      { id: 'aadharCard', key: 'propertyAadharCard', required: true },
      { id: 'propertyOwnership', key: 'propertyOwnership', required: true },
      { id: 'extract712', key: 'extract712', required: true },
      { id: 'prCard', key: 'prCard', required: true },
      { id: 'valuationCert', key: 'valuationCert', required: true },
      { id: 'form24A', key: 'form24A', required: true }
    ],
    'govt-employee': [
      { id: 'aadharCard', key: 'govtAadharCard', required: true },
      { id: 'govtIdCard', key: 'govtIdCard', required: true },
      { id: 'salaryCert', key: 'salaryCert', required: true },
      { id: 'officeCert', key: 'officeCert', required: true },
      { id: 'retirementProof', key: 'retirementProof', required: true },
      { id: 'form24B', key: 'form24B', required: true }
    ],
    lic: [
      { id: 'photoWithSign', key: 'licPhotoWithSign', required: true, showNote: true },
      { id: 'aadharCard', key: 'licAadharCard', required: true },
      { id: 'licPolicyOriginal', key: 'licPolicyOriginal', required: true },
      { id: 'premiumReceipts', key: 'premiumReceipts', required: true },
      { id: 'policyBond', key: 'policyBond', required: true },
      { id: 'policyStatus', key: 'policyStatus', required: true }
    ],
    fd: [
      { id: 'photoWithSign', key: 'fdPhotoWithSign', required: true, showNote: true },
      { id: 'aadharCardXerox', key: 'aadharCardXerox', required: true },
      { id: 'fdReceipt', key: 'fdReceipt', required: true },
      { id: 'bankConfirmation', key: 'bankConfirmation', required: true },
      { id: 'fdStatement', key: 'fdStatement', required: true }
    ]
  };

 
  $: collateralTypesWithIndex = collateralItems.map((item, index) => ({
    type: item.type,
    index: index,
    itemData: item
  }));
</script>

{#if collateralTypesWithIndex.length > 0}
  {#each collateralTypesWithIndex as { type, index, itemData }}
    <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <!-- Header -->
      <div class="bg-purple-500 text-white px-6 py-3">
        <h3 class="text-lg font-bold">{t.uploadDocuments?.CollateralDocuments?.sectionTitle}</h3>
        <p class="text-sm opacity-90 mt-1">
          {type === 'property' ? t.uploadDocuments?.CollateralDocuments?.propertyCollateral :
           type === 'govt-employee' ? t.uploadDocuments?.CollateralDocuments?.govtEmployeeCollateral :
           type === 'lic' ? t.uploadDocuments?.CollateralDocuments?.licCollateral :
           type === 'fd' ? t.uploadDocuments?.CollateralDocuments?.fdCollateral : type}
        </p>
        {#if type === 'property'}
          <p class="text-xs opacity-75 mt-1">
            {t.uploadDocuments?.CollateralDocuments?.surveyNo}: {itemData.surveyNo} | 
            {t.uploadDocuments?.CollateralDocuments?.village}: {itemData.village}
          </p>
        {:else if type === 'fd'}
          <p class="text-xs opacity-75 mt-1">
            {t.uploadDocuments?.CollateralDocuments?.bank}: {itemData.bankName} | 
            {t.uploadDocuments?.CollateralDocuments?.branch}: {itemData.branchName}
          </p>
        {:else if type === 'lic'}
          <p class="text-xs opacity-75 mt-1">
            {t.uploadDocuments?.CollateralDocuments?.policy}: {itemData.policyName} | 
            {t.uploadDocuments?.CollateralDocuments?.receiptNo}: {itemData.policyReceiptNo}
          </p>
        {:else if type === 'govt-employee'}
          <p class="text-xs opacity-75 mt-1">
            {t.uploadDocuments?.CollateralDocuments?.name}: {itemData.fullName} | 
            {t.uploadDocuments?.CollateralDocuments?.employeeID}: {itemData.employeeID}
          </p>
        {/if}
      </div>

      <!-- Table Header -->
      <div class="grid grid-cols-12 gap-4 bg-gray-100 px-6 py-3 border-b border-gray-200">
        <div class="col-span-12 md:col-span-6">
          <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.CollateralDocuments?.documentsName}</p>
        </div>
        <div class="col-span-12 md:col-span-4 text-center">
          <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.CollateralDocuments?.uploadView}</p>
        </div>
        <div class="col-span-12 md:col-span-2 text-center">
          <p class="text-sm font-bold text-gray-700">{t.uploadDocuments?.CollateralDocuments?.delete}</p>
        </div>
      </div>

      <!-- Documents -->
      <div class="px-6 py-2">
        {#each (documentsMap[type] || []) as doc}
          <div>
            <DocumentUploadRow
              documentName={t.uploadDocuments?.CollateralDocuments?.[doc.key]}
              required={doc.required}
              uploaded={uploadedDocs[`collateral_${type}_${index}_${doc.id}`]?.uploaded || false}
              fileUrl={uploadedDocs[`collateral_${type}_${index}_${doc.id}`]?.url || ''}
              onUpload={(file) => onUpload(`collateral_${type}_${index}_${doc.id}`, file)}
              onView={() => onView(`collateral_${type}_${index}_${doc.id}`)}
              onDelete={() => onDelete(`collateral_${type}_${index}_${doc.id}`)}
              error={uploadErrors[`collateral_${type}_${index}_${doc.id}`] || ''}
              docId={`collateral_${type}_${index}_${doc.id}`}
            />
            {#if doc.showNote}
              <p class="text-xs text-orange-600 italic ml-4 mb-2">
                {t.uploadDocuments?.CollateralDocuments?.note}: {t.uploadDocuments?.CollateralDocuments?.photoNote}
              </p>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
{:else}
  <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-8 text-center">
    <p class="text-gray-500">{t.uploadDocuments?.CollateralDocuments?.noCollateralAdded}</p>
  </div>
{/if}