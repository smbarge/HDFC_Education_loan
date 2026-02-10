import { create, test, enforce } from 'vest';

const govtEmployeeValidation = create((data, t) => {
  // Department Name
  test('departmentName', t?.collateralDetails?.govtEmployeeModal?.departmentNameRequired || 'Department name is required', () => {
    enforce(data.departmentName).isNotEmpty();
  });

  // Designation
  test('designation', t?.collateralDetails?.govtEmployeeModal?.designationRequired || 'Designation is required', () => {
    enforce(data.designation).isNotEmpty();
  });

  // Employee ID
  test('employeeID', t?.collateralDetails?.govtEmployeeModal?.employeeIDRequired || 'Employee ID is required', () => {
    enforce(data.employeeID).isNotEmpty();
  });

  // Retirement Date
  test('retirementDate', t?.collateralDetails?.govtEmployeeModal?.retirementDateRequired || 'Retirement date is required (Mandatory)', () => {
    enforce(data.retirementDate).isNotEmpty();
  });

  // Is Permanent Employee (must be checked)
  test('isPermanent', t?.collateralDetails?.govtEmployeeModal?.permanentEmployeeRequired || 'Must be permanent employee', () => {
    enforce(data.isPermanent).isTruthy();
  });
});

export default govtEmployeeValidation;