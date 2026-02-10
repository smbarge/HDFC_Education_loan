import { create, test, enforce } from 'vest';

const fdCollateralValidation = create((data, t) => {
  // Bank Name
  test('bankName', t?.collateralDetails?.fdCollateralModal?.bankNameRequired || 'Bank name is required', () => {
    enforce(data.bankName).isNotEmpty();
  });

  test('bankName', t?.collateralDetails?.fdCollateralModal?.bankNameLength || 'Bank name must be at least 3 characters', () => {
    enforce(data.bankName).longerThanOrEquals(3);
  });

  // Branch Name
  test('branchName', t?.collateralDetails?.fdCollateralModal?.branchNameRequired || 'Branch name is required', () => {
    enforce(data.branchName).isNotEmpty();
  });

  // Street Address
  test('streetAddress', t?.collateralDetails?.fdCollateralModal?.streetAddressRequired || 'Street address is required', () => {
    enforce(data.streetAddress).isNotEmpty();
  });

  // District
  test('district', t?.collateralDetails?.fdCollateralModal?.districtRequired || 'District is required', () => {
    enforce(data.district).isNotEmpty();
  });

  // Taluka
  test('taluka', t?.collateralDetails?.fdCollateralModal?.talukaRequired || 'Taluka is required', () => {
    enforce(data.taluka).isNotEmpty();
  });

  // Place
  test('place', t?.collateralDetails?.fdCollateralModal?.placeRequired || 'Place is required', () => {
    enforce(data.place).isNotEmpty();
  });

  // PIN Code
  test('pinCode', t?.collateralDetails?.fdCollateralModal?.pinCodeRequired || 'PIN code is required', () => {
    enforce(data.pinCode).isNotEmpty();
  });

  test('pinCode', t?.collateralDetails?.fdCollateralModal?.pinCodeInvalid || 'PIN code must be 6 digits', () => {
    enforce(data.pinCode).matches(/^\d{6}$/);
  });

  // FD Account Number
  test('fdAccountNumber', t?.collateralDetails?.fdCollateralModal?.fdAccountNumberRequired || 'FD account number is required', () => {
    enforce(data.fdAccountNumber).isNotEmpty();
  });

  // FD Start Date
  test('fdStartDate', t?.collateralDetails?.fdCollateralModal?.fdStartDateRequired || 'FD start date is required', () => {
    enforce(data.fdStartDate).isNotEmpty();
  });

  // FD Maturity Date
  test('fdMaturityDate', t?.collateralDetails?.fdCollateralModal?.fdMaturityDateRequired || 'FD maturity date is required', () => {
    enforce(data.fdMaturityDate).isNotEmpty();
  });

  // Interest Rate
  test('interestRate', t?.collateralDetails?.fdCollateralModal?.interestRateRequired || 'Interest rate is required', () => {
    enforce(data.interestRate).isNotEmpty();
  });

  test('interestRate', t?.collateralDetails?.fdCollateralModal?.interestRateFormat || 'Interest rate must be a valid number', () => {
    enforce(data.interestRate).matches(/^\d+(\.\d{1,2})?$/);
  });

  // FD Deposit Amount
  test('fdDepositAmount', t?.collateralDetails?.fdCollateralModal?.fdDepositAmountRequired || 'FD deposit amount is required', () => {
    enforce(data.fdDepositAmount).isNotEmpty();
  });

  test('fdDepositAmount', t?.collateralDetails?.fdCollateralModal?.fdDepositAmountFormat || 'FD deposit amount must be a valid amount', () => {
    enforce(data.fdDepositAmount).matches(/^\d+(\.\d{1,2})?$/);
  });
});

export default fdCollateralValidation;