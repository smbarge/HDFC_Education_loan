import { create, test, enforce } from 'vest';

const academicInfoValidation = create((data, t) => {
  // Student Details
  test('studentName', t?.academicInfo?.studentNameRequired || 'Student name is required', () => {
    enforce(data.studentName).isNotEmpty();
  });

  test('studentName', t?.academicInfo?.studentNameLength || 'Student name must be at least 3 characters', () => {
    enforce(data.studentName).longerThanOrEquals(3);
  });

  test('courseName', t?.academicInfo?.courseNameRequired || 'Course name is required', () => {
    enforce(data.courseName).isNotEmpty();
  });

  test('courseType', t?.academicInfo?.courseTypeRequired || 'Course type is required', () => {
    enforce(data.courseType).isNotEmpty();
  });

  test('streamSpecialization', t?.academicInfo?.streamRequired || 'Stream/Specialization is required', () => {
    enforce(data.streamSpecialization).isNotEmpty();
  });

  test('courseDuration', t?.academicInfo?.courseDurationRequired || 'Course duration is required', () => {
    enforce(data.courseDuration).isNotEmpty();
  });

  test('courseDuration', t?.academicInfo?.courseDurationFormat || 'Course duration must be a valid number', () => {
    enforce(data.courseDuration).matches(/^\d+$/);
  });

  test('modeOfStudy', t?.academicInfo?.modeOfStudyRequired || 'Mode of study is required', () => {
    enforce(data.modeOfStudy).isNotEmpty();
  });

  // Institution Details
  test('instituteName', t?.academicInfo?.instituteNameRequired || 'Institute/College name is required', () => {
    enforce(data.instituteName).isNotEmpty();
  });

  test('universityName', t?.academicInfo?.universityNameRequired || 'University/Board name is required', () => {
    enforce(data.universityName).isNotEmpty();
  });

  test('instituteAddress', t?.academicInfo?.instituteAddressRequired || 'Institute address is required', () => {
    enforce(data.instituteAddress).isNotEmpty();
  });

  test('currentDistrict', t?.academicInfo?.districtRequired || 'District is required', () => {
    enforce(data.currentDistrict).isNotEmpty();
  });

  test('currentTaluka', t?.academicInfo?.talukaRequired || 'Taluka is required', () => {
    enforce(data.currentTaluka).isNotEmpty();
  });

  test('place', t?.academicInfo?.placeRequired || 'Place is required', () => {
    enforce(data.place).isNotEmpty();
  });

  test('pinCode', t?.academicInfo?.pinCodeRequired || 'Pin code is required', () => {
    enforce(data.pinCode).isNotEmpty();
  });

  test('pinCode', t?.academicInfo?.pinCodeFormat || 'Pin code must be 6 digits', () => {
    enforce(data.pinCode).matches(/^\d{6}$/);
  });

  // Admission & Fee Details
  test('admissionStatus', t?.academicInfo?.admissionStatusRequired || 'Admission status is required', () => {
    enforce(data.admissionStatus).isNotEmpty();
  });

  test('admissionYear', t?.academicInfo?.admissionYearRequired || 'Admission year is required', () => {
    enforce(data.admissionYear).isNotEmpty();
  });

  test('totalCourseFee', t?.academicInfo?.totalCourseFeeRequired || 'Total course fee is required', () => {
    enforce(data.totalCourseFee).isNotEmpty();
  });

  test('totalCourseFee', t?.academicInfo?.totalCourseFeeFormat || 'Total course fee must be a valid amount', () => {
    enforce(data.totalCourseFee).matches(/^\d+(\.\d{1,2})?$/);
  });

  if (data.feePaid) {
    test('feePaid', t?.academicInfo?.feePaidFormat || 'Fee paid must be a valid amount', () => {
      enforce(data.feePaid).matches(/^\d+(\.\d{1,2})?$/);
    });
  }

  test('remainingFee', t?.academicInfo?.remainingFeeRequired || 'Remaining fee is required', () => {
    enforce(data.remainingFee).isNotEmpty();
  });

  // Loan Requirement Details
  test('loanRequired', t?.academicInfo?.loanRequiredRequired || 'Loan required amount is required', () => {
    enforce(data.loanRequired).isNotEmpty();
  });

  test('loanRequired', t?.academicInfo?.loanRequiredFormat || 'Loan required must be a valid amount', () => {
    enforce(data.loanRequired).matches(/^\d+(\.\d{1,2})?$/);
  });

  test('purposeOfLoan', t?.academicInfo?.purposeOfLoanRequired || 'Purpose of loan is required', () => {
    enforce(data.purposeOfLoan).isNotEmpty();
  });

  // GST Number - Optional but validate if provided
  if (data.gstNumber) {
    test('gstNumber', t?.academicInfo?.gstNumberFormat || 'Please enter a valid GST number', () => {
      enforce(data.gstNumber).matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/);
    });
  }

  // Bank Details
  test('bankName', t?.academicInfo?.bankNameRequired || 'Bank name is required', () => {
    enforce(data.bankName).isNotEmpty();
  });

  test('ifscCode', t?.academicInfo?.ifscCodeRequired || 'IFSC code is required', () => {
    enforce(data.ifscCode).isNotEmpty();
  });

  test('ifscCode', t?.academicInfo?.ifscCodeFormat || 'Please enter a valid IFSC code', () => {
    enforce(data.ifscCode).matches(/^[A-Z]{4}0[A-Z0-9]{6}$/);
  });

  test('branchName', t?.academicInfo?.branchNameRequired || 'Branch name is required', () => {
    enforce(data.branchName).isNotEmpty();
  });

  test('accountNumber', t?.academicInfo?.accountNumberRequired || 'Account number is required', () => {
    enforce(data.accountNumber).isNotEmpty();
  });

  test('accountNumber', t?.academicInfo?.accountNumberFormat || 'Account number must be 9-18 digits', () => {
    enforce(data.accountNumber).matches(/^\d{9,18}$/);
  });

  test('bankAddress', t?.academicInfo?.bankAddressRequired || 'Bank address is required', () => {
    enforce(data.bankAddress).isNotEmpty();
  });
});

export default academicInfoValidation;