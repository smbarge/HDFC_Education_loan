import { create, test, enforce } from 'vest';

const guarantorDetailsValidation = create((data, t) => {

  // Full Name
  test('guarantorFullName', t?.guarantorDetails?.guarantorFullNameRequired || 'Full name is required', () => {
    enforce(data.guarantorFullName).isNotEmpty();
  });

  test('guarantorFullName', t?.guarantorDetails?.guarantorFullNameLength || 'Full name must be at least 3 characters', () => {
    enforce(data.guarantorFullName).longerThanOrEquals(3);
  });

  // Date of Birth
  test('guarantorDOB', t?.guarantorDetails?.guarantorDOBRequired || 'Date of birth is required', () => {
    enforce(data.guarantorDOB).isNotEmpty();
  });

  // Gender
  test('guarantorGender', t?.guarantorDetails?.guarantorGenderRequired || 'Gender is required', () => {
    enforce(data.guarantorGender).isNotEmpty();
  });

  // Aadhar - Optional but validate if provided
  if (data.guarantorAadhar) {
    test('guarantorAadhar', t?.guarantorDetails?.guarantorAadharFormat || 'Aadhar must be 12 digits', () => {
      enforce(data.guarantorAadhar).matches(/^\d{12}$/);
    });
  }

  // PAN - Optional but validate if provided
  if (data.guarantorPAN) {
    test('guarantorPAN', t?.guarantorDetails?.guarantorPANFormat || 'Invalid PAN format', () => {
      enforce(data.guarantorPAN).matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/);
    });
  }

  // Mobile
  test('guarantorMobile', t?.guarantorDetails?.guarantorMobileRequired || 'Mobile number is required', () => {
    enforce(data.guarantorMobile).isNotEmpty();
  });

  test('guarantorMobile', t?.guarantorDetails?.guarantorMobileFormat || 'Invalid mobile number', () => {
    enforce(data.guarantorMobile).matches(/^[6-9]\d{9}$/);
  });

  // Email - Optional but validate if provided
  if (data.guarantorEmail) {
    test('guarantorEmail', t?.guarantorDetails?.guarantorEmailFormat || 'Invalid email address', () => {
      enforce(data.guarantorEmail).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  }

  // Current Address
  test('currentStreetAddress', t?.guarantorDetails?.currentStreetAddressRequired || 'Street address is required', () => {
    enforce(data.currentStreetAddress).isNotEmpty();
  });

  test('currentDistrict', t?.guarantorDetails?.currentDistrictRequired || 'District is required', () => {
    enforce(data.currentDistrict).isNotEmpty();
  });

  test('currentTaluka', t?.guarantorDetails?.currentTalukaRequired || 'Taluka is required', () => {
    enforce(data.currentTaluka).isNotEmpty();
  });

  test('currentPlace', t?.guarantorDetails?.currentPlaceRequired || 'Place is required', () => {
    enforce(data.currentPlace).isNotEmpty();
  });

  test('currentArea', t?.guarantorDetails?.currentAreaRequired || 'Area is required', () => {
    enforce(data.currentArea).isNotEmpty();
  });

  test('currentPinCode', t?.guarantorDetails?.currentPinCodeRequired || 'Pin code is required', () => {
    enforce(data.currentPinCode).isNotEmpty();
  });

  test('currentPinCode', t?.guarantorDetails?.currentPinCodeFormat || 'Pin code must be 6 digits', () => {
    enforce(data.currentPinCode).matches(/^\d{6}$/);
  });

  // Permanent Address
  if (!data.sameAsCurrentAddress) {

  test('permanentStreetAddress', t?.guarantorDetails?.permanentStreetAddressRequired || 'Street address is required', () => {
    enforce(data.permanentStreetAddress).isNotEmpty();
  });

  test('permanentDistrict', t?.guarantorDetails?.permanentDistrictRequired || 'District is required', () => {
    enforce(data.permanentDistrict).isNotEmpty();
  });

  test('permanentTaluka', t?.guarantorDetails?.permanentTalukaRequired || 'Taluka is required', () => {
    enforce(data.permanentTaluka).isNotEmpty();
  });

  test('permanentPlace', t?.guarantorDetails?.permanentPlaceRequired || 'Place is required', () => {
    enforce(data.permanentPlace).isNotEmpty();
  });

  test('permanentArea', t?.guarantorDetails?.permanentAreaRequired || 'Area is required', () => {
    enforce(data.permanentArea).isNotEmpty();
  });

  test('permanentPinCode', t?.guarantorDetails?.permanentPinCodeRequired || 'Pin code is required', () => {
    enforce(data.permanentPinCode).isNotEmpty();
  });

  test('permanentPinCode', t?.guarantorDetails?.permanentPinCodeFormat || 'Pin code must be 6 digits', () => {
    enforce(data.permanentPinCode).matches(/^\d{6}$/);
  });

}
  // Marital Status
  test('maritalStatus', t?.guarantorDetails?.maritalStatusRequired || 'Marital status is required', () => {
    enforce(data.maritalStatus).isNotEmpty();
  });

  // Educational Qualification
  test('educationalQualification', t?.guarantorDetails?.educationalQualificationRequired || 'Educational qualification is required', () => {
    enforce(data.educationalQualification).isNotEmpty();
  });

  // Guardian Occupation
  test('guardianOccupation', t?.guarantorDetails?.guardianOccupationRequired || 'Occupation is required', () => {
    enforce(data.guardianOccupation).isNotEmpty();
  });

  // Annual Income
  test('annualIncome', t?.guarantorDetails?.annualIncomeRequired || 'Annual income is required', () => {
    enforce(data.annualIncome).isNotEmpty();
  });

  test('annualIncome', t?.guarantorDetails?.annualIncomeFormat || 'Annual income must be a valid number', () => {
    enforce(data.annualIncome).matches(/^\d+$/);
  });

  // Previous Surety
  test('previousSurety', t?.guarantorDetails?.previousSuretyRequired || 'Please select an option', () => {
    enforce(data.previousSurety).isNotEmpty();
  });

  // Surety Details - Required only if previousSurety is 'Yes'
  if (data.previousSurety === 'Yes') {
    test('suretyDetails', t?.guarantorDetails?.suretyDetailsRequired || 'Please provide details', () => {
      enforce(data.suretyDetails).isNotEmpty();
    });
  }
});

export default guarantorDetailsValidation;