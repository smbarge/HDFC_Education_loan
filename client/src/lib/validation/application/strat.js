import { create, test, enforce, skipWhen } from 'vest';

const applicationStartValidation = create((data, t, fieldName) => {
  // Only validate specific field if fieldName is provided
  const only = fieldName ? (field) => field === fieldName : () => true;

  if (only('community')) {
    test('community', t?.applicationStart?.minorityRequired || 'Please select your minority community', () => {
      enforce(data.community).isNotEmpty();
    });
  }

  if (only('isResident')) {
    test('isResident', t?.applicationStart?.residencyRequired || 'Please select your residency status', () => {
      enforce(data.isResident).isNotEmpty();
    });
  }

  skipWhen(data.isResident !== 'Yes', () => {
    if (only('district')) {
      test('district', t?.applicationStart?.districtRequired || 'Please select your district', () => {
        enforce(data.district).isNotEmpty();
      });
    }
  });

  if (only('aadharNumber')) {
    test('aadharNumber', t?.applicationStart?.aadharRequired || 'Aadhar number is required', () => {
      enforce(data.aadharNumber).isNotEmpty();
    });

    test('aadharNumber', t?.applicationStart?.aadharFormat || 'Aadhar number must be 12 digits', () => {
      enforce(data.aadharNumber).matches(/^\d{12}$/);
    });
  }

  if (only('fullName')) {
    test('fullName', t?.applicationStart?.nameRequired || 'Full name is required', () => {
      enforce(data.fullName).isNotEmpty();
    });

    test('fullName', t?.applicationStart?.nameMinLength || 'Name must be at least 3 characters', () => {
      enforce(data.fullName).longerThanOrEquals(3);
    });
  }

  if (only('dateOfBirth')) {
    test('dateOfBirth', t?.applicationStart?.dobRequired || 'Date of birth is required', () => {
      enforce(data.dateOfBirth).isNotEmpty();
    });
  }

  if (only('gender')) {
    test('gender', t?.applicationStart?.genderRequired || 'Please select your gender', () => {
      enforce(data.gender).isNotEmpty();
    });
  }

  if (only('consent')) {
    test('consent', t?.applicationStart?.consentRequired || 'You must provide consent to proceed', () => {
      enforce(data.consent).equals(true);
    });
  }
});

export default applicationStartValidation;