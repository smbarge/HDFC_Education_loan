import { create, test, enforce } from 'vest';

const personalDetailsValidation = create((data, t) => {
  // Mobile Number - REQUIRED
  test('mobileNumber', t?.personalDetails?.mobileRequired || 'Mobile number is required', () => {
    enforce(data.mobileNumber).isNotEmpty();
  });

  test('mobileNumber', t?.personalDetails?.mobileFormat || 'Please enter a valid 10-digit mobile number', () => {
    enforce(data.mobileNumber).matches(/^[6-9]\d{9}$/);
  });

  test('emailId', t?.personalDetails?.emailFormat || 'Email id is required', () => {
    enforce(data.emailId).isNotEmpty();
  });

  // Email - OPTIONAL
  if (data.emailId) {
    test('emailId', t?.personalDetails?.emailFormat || 'Please enter a valid email address', () => {
      enforce(data.emailId).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  }

  // PAN Card - OPTIONAL
  if (data.panCard) {
    test('panCard', t?.personalDetails?.panFormat || 'Please enter a valid PAN card number (e.g., ABCDE1234F)', () => {
      enforce(data.panCard).matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/);
    });
  }

  // Current Address Fields - ALL REQUIRED
  test('currentStreetAddress', t?.personalDetails?.streetRequired || 'Current street address is required', () => {
    enforce(data.currentStreetAddress).isNotEmpty();
  });

  test('currentDistrict', t?.personalDetails?.districtRequired || 'District is required', () => {
    enforce(data.currentDistrict).isNotEmpty();
  });

  test('currentTaluka', t?.personalDetails?.talukaRequired || 'Taluka is required', () => {
    enforce(data.currentTaluka).isNotEmpty();
  });

  test('currentPlace', t?.personalDetails?.placeRequired || 'Place is required', () => {
    enforce(data.currentPlace).isNotEmpty();
  });

  test('currentArea', t?.personalDetails?.areaRequired || 'Area is required', () => {
    enforce(data.currentArea).isNotEmpty();
  });

  test('currentPinCode', t?.personalDetails?.pinCodeRequired || 'Pin code is required', () => {
    enforce(data.currentPinCode).isNotEmpty();
  });

  test('currentPinCode', t?.personalDetails?.pinCodeFormat || 'Pin code must be 6 digits', () => {
    enforce(data.currentPinCode).matches(/^\d{6}$/);
  });

  // Permanent Address Fields - ONLY validate if NOT same as current
  // Skip ALL permanent address validation when sameAsCurrentAddress is true

  if (!data.sameAsCurrentAddress) {
    test('permanentStreetAddress', t?.personalDetails?.streetRequired || 'Permanent street address is required', () => {
      enforce(data.permanentStreetAddress).isNotEmpty();
    });

    test('permanentDistrict', t?.personalDetails?.districtRequired || 'District is required', () => {
      enforce(data.permanentDistrict).isNotEmpty();
    });

    test('permanentTaluka', t?.personalDetails?.talukaRequired || 'Taluka is required', () => {
      enforce(data.permanentTaluka).isNotEmpty();
    });

    test('permanentPlace', t?.personalDetails?.placeRequired || 'Place is required', () => {
      enforce(data.permanentPlace).isNotEmpty();
    });

    test('permanentArea', t?.personalDetails?.areaRequired || 'Area is required', () => {
      enforce(data.permanentArea).isNotEmpty();
    });

    test('permanentPinCode', t?.personalDetails?.pinCodeRequired || 'Pin code is required', () => {
      enforce(data.permanentPinCode).isNotEmpty();
    });

    test('permanentPinCode', t?.personalDetails?.pinCodeFormat || 'Pin code must be 6 digits', () => {
      enforce(data.permanentPinCode).matches(/^\d{6}$/);
    });
  }

  // Marital Status - REQUIRED
  test('maritalStatus', t?.personalDetails?.maritalRequired || 'Marital status is required', () => {
    enforce(data.maritalStatus).isNotEmpty();
  });

  // Educational Qualification - REQUIRED
  test('educationalQualification', t?.personalDetails?.educationRequired || 'Educational qualification is required', () => {
    enforce(data.educationalQualification).isNotEmpty();
  });

  // Parent/Guardian Fields - ALL REQUIRED
  test('parentName', t?.personalDetails?.parentNameRequired || 'Parent/Guardian name is required', () => {
    enforce(data.parentName).isNotEmpty();
  });

  test('relationship', t?.personalDetails?.relationshipRequired || 'Relationship is required', () => {
    enforce(data.relationship).isNotEmpty();
  });

  test('occupation', t?.personalDetails?.occupationRequired || 'Occupation is required', () => {
    enforce(data.occupation).isNotEmpty();
  });

  test('annualIncome', t?.personalDetails?.incomeRequired || 'Annual income is required', () => {
    enforce(data.annualIncome).isNotEmpty();
  });

  test('annualIncome', t?.personalDetails?.incomeFormat || 'Annual income must be a valid number', () => {
    enforce(data.annualIncome).matches(/^\d+$/);
  });

  test('annualIncome', t?.personalDetails?.incomeMaxLimit || 'Annual income must not exceed ₹8,00,000', () => {
    const income = parseInt(data.annualIncome);
    enforce(income).lessThanOrEquals(800000);
  });


  // Surety Declaration - REQUIRED
  test('previousSurety', t?.personalDetails?.suretyRequired || 'Please select surety status', () => {
    enforce(data.previousSurety).isNotEmpty();
  });

  // Surety Details - REQUIRED only if previousSurety is 'Yes'
  if (data.previousSurety === 'Yes') {
    test('suretyDetails', t?.personalDetails?.suretyDetailsRequired || 'Please provide surety details', () => {
      enforce(data.suretyDetails).isNotEmpty();
    });
  }
});

export default personalDetailsValidation;