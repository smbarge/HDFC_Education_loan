import { create, test, enforce } from 'vest';

const propertyCollateralValidation = create((data, t) => {
  // Property Type
  test('propertyType', t?.collateralDetails?.propertyCollateralModal?.propertyTypeRequired || 'Property type is required', () => {
    enforce(data.propertyType).isNotEmpty();
  });

  // Document Type
  test('documentType', t?.collateralDetails?.propertyCollateralModal?.documentTypeRequired || 'Document type is required', () => {
    enforce(data.documentType).isNotEmpty();
  });

  // Survey Number
  test('surveyNo', t?.collateralDetails?.propertyCollateralModal?.surveyNoRequired || 'Survey number is required', () => {
    enforce(data.surveyNo).isNotEmpty();
  });

  // District
  test('district', t?.collateralDetails?.propertyCollateralModal?.districtRequired || 'District is required', () => {
    enforce(data.district).isNotEmpty();
  });

  // Taluka
  test('taluka', t?.collateralDetails?.propertyCollateralModal?.talukaRequired || 'Taluka is required', () => {
    enforce(data.taluka).isNotEmpty();
  });

  // Village
  test('village', t?.collateralDetails?.propertyCollateralModal?.villageRequired || 'Village is required', () => {
    enforce(data.village).isNotEmpty();
  });

  // PIN Code
  test('pinCode', t?.collateralDetails?.propertyCollateralModal?.pinCodeRequired || 'PIN code is required', () => {
    enforce(data.pinCode).isNotEmpty();
  });

  test('pinCode', t?.collateralDetails?.propertyCollateralModal?.pinCodeInvalid || 'PIN code must be 6 digits', () => {
    enforce(data.pinCode).matches(/^\d{6}$/);
  });

  // Units
  test('units', t?.collateralDetails?.propertyCollateralModal?.unitsRequired || 'Units is required', () => {
    enforce(data.units).isNotEmpty();
  });

  // Hectares/Acres
  test('hectares', t?.collateralDetails?.propertyCollateralModal?.hectaresRequired || 'Hectares/Acres is required', () => {
    enforce(data.hectares).isNotEmpty();
  });

  test('hectares', t?.collateralDetails?.propertyCollateralModal?.hectaresFormat || 'Must be a valid number', () => {
    enforce(data.hectares).matches(/^\d+(\.\d{1,2})?$/);
  });

  // R/Guntha
  test('rGuntha', t?.collateralDetails?.propertyCollateralModal?.rGunthaRequired || 'R/Guntha is required', () => {
    enforce(data.rGuntha).isNotEmpty();
  });

  test('rGuntha', t?.collateralDetails?.propertyCollateralModal?.rGunthaFormat || 'Must be a valid number', () => {
    enforce(data.rGuntha).matches(/^\d+(\.\d{1,2})?$/);
  });

  // Property Value
  test('propertyValue', t?.collateralDetails?.propertyCollateralModal?.propertyValueRequired || 'Property value is required', () => {
    enforce(data.propertyValue).isNotEmpty();
  });

  test('propertyValue', t?.collateralDetails?.propertyCollateralModal?.propertyValueFormat || 'Must be a valid amount', () => {
    enforce(data.propertyValue).matches(/^\d+(\.\d{1,2})?$/);
  });
});

export default propertyCollateralValidation;