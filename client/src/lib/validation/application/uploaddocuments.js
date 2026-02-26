import { create, test, enforce, skipWhen } from 'vest';

/**
 * Get document type requirements
 */
export function getDocumentTypeRequirement(docId) {
  // Documents that must be images only
  const imageOnlyDocs = [
    'aadharCard', 'panCard', 'photo', 'signature',
    'coAadhar', 'coPanCard',
    'photoWithSign', 'aadharCardXerox'
  ];

  // Check if docId matches any image-only document
  const requiresImage = imageOnlyDocs.some(prefix => {
    if (docId === prefix) return true;
    if (docId.includes('aadharCard') || docId.includes('aadharCardXerox') ||
        docId.includes('panCard') || docId.includes('photo') || 
        docId.includes('signature') || docId.includes('photoWithSign')) {
      return true;
    }
    return false;
  });

  return {
    requiresImage,
    requiresPDF: false,
    allowsBoth: !requiresImage
  };
}

// File size validation

export function validateFileSize(file) {
  const MAX_SIZE = 5 * 1024 * 1024; 
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File size must be less than 5MB / फाइलचा आकार 5MB पेक्षा कमी असावा / फ़ाइल का आकार 5MB से कम होना चाहिए'
    };
  }
  return { valid: true };
}

// Image file type validation
export function validateImageType(file) {
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, JPEG, PNG image files are allowed / फक्त JPG, JPEG, PNG प्रतिमा फाइल्स स्वीकारल्या जातात / केवल JPG, JPEG, PNG छवि फ़ाइलें स्वीकार की जाती हैं'
    };
  }
  return { valid: true };
}

// PDF file type validation
export function validateFileType(file) {
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF, JPG, JPEG, PNG files are allowed / फक्त PDF, JPG, JPEG, PNG फाइल्स स्वीकारल्या जातात / केवल PDF, JPG, JPEG, PNG फ़ाइलें स्वीकार की जाती हैं'
    };
  }
  return { valid: true };
}

// Validate file based on document type
export function validateDocumentFile(file, docId) {
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  const typeReq = getDocumentTypeRequirement(docId);
  if (typeReq.requiresImage) {
    return validateImageType(file);
  } else {
    return validateFileType(file);
  }
}

// Get required document IDs for applicant
export function getRequiredApplicantDocs() {
  return [
    'aadharCard',
    'photo',
    'signature',
    'admissionLetter',
    'bonafide',
    'feeStructure',
    'markSheets',
    'domicile',
    'minorityCert',
    'incomeCert',
    'passbook',
    'cancelledCheque'
  ];
}

// Get required co-applicant documents
export function getRequiredCoApplicantDocs() {
  return [
    'coAadhar',
    'coIncomeCert'
  ];
}


// Get required guarantor documents
export function getRequiredGuarantorDocs() {
  return [
    'guarantor_aadharCard',
    'guarantor_guarantorAffidavit',
    'guarantor_addressProof'
  ];
}

//get required study Abroad docs
export function getRequiredStudyAbroadDocs() {
  return [
    'passport_abroad',
    'visa_abroad'
  ];
}

//  Get required collateral documents based on type
export function getRequiredCollateralDocs(type, index) {
  const prefix = `collateral_${type}_${index}_`;
  
  const docsMap = {
    property: ['aadharCard', 'propertyOwnership', 'extract712', 'prCard', 'valuationCert', 'form24A'],
    'govt-employee': ['aadharCard', 'govtIdCard', 'salaryCert', 'officeCert', 'retirementProof', 'form24B'],
    lic: ['photoWithSign', 'aadharCard', 'licPolicyOriginal', 'premiumReceipts', 'policyBond', 'policyStatus'],
    fd: ['photoWithSign', 'aadharCardXerox', 'fdReceipt', 'bankConfirmation', 'fdStatement']
  };

  const docs = docsMap[type] || [];
  return docs.map(doc => prefix + doc);
}

// Format document name for display
function formatDocumentName(docId) {
  let name = docId
    .replace('guarantor_', '')
    .replace('collateral_', '')
    .replace(/^(property|govt-employee|lic|fd)_\d+_/, '');
  
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Vest validation suite for document uploads
const documentUploadValidation = create((data, t, collateralItems = []) => {
  
 
  // APPLICANT DOCUMENTS VALIDATION
  const requiredApplicant = getRequiredApplicantDocs();
  
  requiredApplicant.forEach(docId => {
    test(docId, t?.uploadDocuments?.validationMessages?.documentRequired || 'Document is required', () => {
      enforce(data.uploadedDocs?.[docId]?.uploaded).isTruthy();
    });

   
    skipWhen(!data.uploadedDocs?.[docId]?.file, () => {
      test(docId, t?.uploadDocuments?.validationMessages?.fileSizeError || 'File size must be less than 5MB', () => {
        const MAX_SIZE = 5 * 1024 * 1024;
        enforce(data.uploadedDocs[docId].file.size).lessThanOrEquals(MAX_SIZE);
      });

      
      test(docId, t?.uploadDocuments?.validationMessages?.fileTypeError || 'Invalid file type', () => {
        const file = data.uploadedDocs[docId].file;
        const typeReq = getDocumentTypeRequirement(docId);
        
        if (typeReq.requiresImage) {
          const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
          enforce(file.type).inside(ALLOWED_IMAGE_TYPES);
        } else {
          const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
          enforce(file.type).inside(ALLOWED_TYPES);
        }
      });
    });
  });

  
  // CO-APPLICANT DOCUMENTS VALIDATION

  const requiredCoApplicant = getRequiredCoApplicantDocs();
  
  requiredCoApplicant.forEach(docId => {
    test(docId, t?.uploadDocuments?.validationMessages?.documentRequired || 'Document is required', () => {
      enforce(data.uploadedDocs?.[docId]?.uploaded).isTruthy();
    });

    skipWhen(!data.uploadedDocs?.[docId]?.file, () => {
      test(docId, t?.uploadDocuments?.validationMessages?.fileSizeError || 'File size must be less than 5MB', () => {
        const MAX_SIZE = 5 * 1024 * 1024;
        enforce(data.uploadedDocs[docId].file.size).lessThanOrEquals(MAX_SIZE);
      });

      test(docId, t?.uploadDocuments?.validationMessages?.fileTypeError || 'Invalid file type', () => {
        const file = data.uploadedDocs[docId].file;
        const typeReq = getDocumentTypeRequirement(docId);
        
        if (typeReq.requiresImage) {
          const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
          enforce(file.type).inside(ALLOWED_IMAGE_TYPES);
        } else {
          const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
          enforce(file.type).inside(ALLOWED_TYPES);
        }
      });
    });
  });


  skipWhen(!data.purposeOfLoan, () => {
  const requiredStudyAbroad = getRequiredStudyAbroadDocs();

  requiredStudyAbroad.forEach(docId => {
    test(docId, t?.uploadDocuments?.validationMessages?.documentRequired || 'Document is required', () => {
      enforce(data.uploadedDocs?.[docId]?.uploaded).isTruthy();
    });

    skipWhen(!data.uploadedDocs?.[docId]?.file, () => {
      test(docId, t?.uploadDocuments?.validationMessages?.fileSizeError || 'File size must be less than 5MB', () => {
        const MAX_SIZE = 5 * 1024 * 1024;
        enforce(data.uploadedDocs[docId].file.size).lessThanOrEquals(MAX_SIZE);
      });

      test(docId, t?.uploadDocuments?.validationMessages?.fileTypeError || 'Invalid file type', () => {
        const file = data.uploadedDocs[docId].file;
        const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        enforce(file.type).inside(ALLOWED_TYPES);
      });
    });
  });
});


 
  // GUARANTOR DOCUMENTS VALIDATION

  const requiredGuarantor = getRequiredGuarantorDocs();
  
  requiredGuarantor.forEach(docId => {
    test(docId, t?.uploadDocuments?.validationMessages?.documentRequired || 'Document is required', () => {
      enforce(data.uploadedDocs?.[docId]?.uploaded).isTruthy();
    });

    skipWhen(!data.uploadedDocs?.[docId]?.file, () => {
      test(docId, t?.uploadDocuments?.validationMessages?.fileSizeError || 'File size must be less than 5MB', () => {
        const MAX_SIZE = 5 * 1024 * 1024;
        enforce(data.uploadedDocs[docId].file.size).lessThanOrEquals(MAX_SIZE);
      });

      test(docId, t?.uploadDocuments?.validationMessages?.fileTypeError || 'Invalid file type', () => {
        const file = data.uploadedDocs[docId].file;
        const typeReq = getDocumentTypeRequirement(docId);
        
        if (typeReq.requiresImage) {
          const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
          enforce(file.type).inside(ALLOWED_IMAGE_TYPES);
        } else {
          const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
          enforce(file.type).inside(ALLOWED_TYPES);
        }
      });
    });
  });

  // COLLATERAL DOCUMENTS VALIDATION

  collateralItems.forEach((item, index) => {
    const requiredCollateral = getRequiredCollateralDocs(item.type, index);
    
    requiredCollateral.forEach(docId => {
      test(docId, t?.uploadDocuments?.validationMessages?.documentRequired || 'Document is required', () => {
        enforce(data.uploadedDocs?.[docId]?.uploaded).isTruthy();
      });

      skipWhen(!data.uploadedDocs?.[docId]?.file, () => {
        test(docId, t?.uploadDocuments?.validationMessages?.fileSizeError || 'File size must be less than 5MB', () => {
          const MAX_SIZE = 5 * 1024 * 1024;
          enforce(data.uploadedDocs[docId].file.size).lessThanOrEquals(MAX_SIZE);
        });

        test(docId, t?.uploadDocuments?.validationMessages?.fileTypeError || 'Invalid file type', () => {
          const file = data.uploadedDocs[docId].file;
          const typeReq = getDocumentTypeRequirement(docId);
          
          if (typeReq.requiresImage) {
            const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
            enforce(file.type).inside(ALLOWED_IMAGE_TYPES);
          } else {
            const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            enforce(file.type).inside(ALLOWED_TYPES);
          }
        });
      });
    });
  });
});

// Validate all required documents are uploaded
export function validateAllRequiredDocuments(uploadedDocs, collateralItems,purposeOfLoan = null) {
  const missing = [];

  // Check applicant documents
  const requiredApplicant = getRequiredApplicantDocs();
  requiredApplicant.forEach(docId => {
    if (!uploadedDocs[docId]?.uploaded) {
      missing.push({
        section: 'Applicant Documents',
        docId: docId,
        displayName: formatDocumentName(docId)
      });
    }
  });

  // Check co-applicant documents
  const requiredCoApplicant = getRequiredCoApplicantDocs();
  requiredCoApplicant.forEach(docId => {
    if (!uploadedDocs[docId]?.uploaded) {
      missing.push({
        section: 'Co-Applicant Documents',
        docId: docId,
        displayName: formatDocumentName(docId)
      });
    }
  });

  // Check study abroad documents (only if purposeOfLoan is study abroad)
    if (purposeOfLoan) {
      const requiredStudyAbroad = getRequiredStudyAbroadDocs();
      requiredStudyAbroad.forEach(docId => {
        if (!uploadedDocs[docId]?.uploaded) {
          missing.push({
            section: 'Study Abroad Documents',
            docId: docId,
            displayName: formatDocumentName(docId)
          });
        }
      });
    }

  // Check guarantor documents
  const requiredGuarantor = getRequiredGuarantorDocs();
  requiredGuarantor.forEach(docId => {
    if (!uploadedDocs[docId]?.uploaded) {
      missing.push({
        section: 'Guarantor Documents',
        docId: docId,
        displayName:''
      });
    }
  });

  // Check collateral documents
collateralItems.forEach((item, index) => {
  const requiredCollateral = getRequiredCollateralDocs(item.type, index);
  requiredCollateral.forEach(docId => {
    if (!uploadedDocs[docId]?.uploaded) {
      missing.push({
        section: `Collateral Documents (${item.type} - ${index + 1})`,
        docId: docId,
        displayName: item.displayName || '' 
      });
    }
  });
});

  return {
    valid: missing.length === 0,
    missing: missing,
    totalMissing: missing.length
  };
}

export default documentUploadValidation;