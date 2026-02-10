import { create, test, enforce } from 'vest';

const licCollateralValidation = create((data, t) => {
  // Policy Name
  test('policyName', t?.collateralDetails?.licCollateralModal?.policyNameRequired || 'Policy name is required', () => {
    enforce(data.policyName).isNotEmpty();
  });

  test('policyName', t?.collateralDetails?.licCollateralModal?.policyNameLength || 'Policy name must be at least 3 characters', () => {
    enforce(data.policyName).longerThanOrEquals(3);
  });

  // Policy Type
  test('policyType', t?.collateralDetails?.licCollateralModal?.policyTypeRequired || 'Policy type is required', () => {
    enforce(data.policyType).isNotEmpty();
  });

  // Policy Receipt No
  test('policyReceiptNo', t?.collateralDetails?.licCollateralModal?.policyReceiptNoRequired || 'Policy receipt number is required', () => {
    enforce(data.policyReceiptNo).isNotEmpty();
  });

  // Policy Surrender Value
  test('policySurrenderValue', t?.collateralDetails?.licCollateralModal?.policySurrenderValueRequired || 'Policy surrender value is required', () => {
    enforce(data.policySurrenderValue).isNotEmpty();
  });

  test('policySurrenderValue', t?.collateralDetails?.licCollateralModal?.policySurrenderValueFormat || 'Must be a valid amount', () => {
    enforce(data.policySurrenderValue).matches(/^\d+(\.\d{1,2})?$/);
  });

  // Policy Start Date
  test('policyStartDate', t?.collateralDetails?.licCollateralModal?.policyStartDateRequired || 'Policy start date is required', () => {
    enforce(data.policyStartDate).isNotEmpty();
  });

  // Policy Maturity Date
  test('policyMaturityDate', t?.collateralDetails?.licCollateralModal?.policyMaturityDateRequired || 'Policy maturity date is required', () => {
    enforce(data.policyMaturityDate).isNotEmpty();
  });
});

export default licCollateralValidation;