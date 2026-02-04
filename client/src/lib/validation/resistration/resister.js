import { create, test, enforce } from 'vest';

const registrationStartValidation = create((data, t) => {
  /* =======================
     Full Name Validation
  ======================== */

  // Required
  test('name', t?.errors?.nameRequired || 'Full name is required', () => {
    enforce(data.name).isNotEmpty();
  });

  // Minimum length
  test(
    'name',
    t?.errors?.nameMinLength || 'Name must be at least 3 characters',
    () => {
      enforce(data.name).longerThanOrEquals(3);
    }
  );

  // Only letters and spaces
  test(
    'name',
    t?.errors?.nameOnlyCharacters || 'Name must contain only letters',
    () => {
      enforce(data.name).matches(/^[A-Za-z\s]+$/);
    }
  );

  /* =======================
     Mobile Number Validation
  ======================== */

  // Required
  test('mobile', t?.errors?.mobileRequired || 'Mobile number is required', () => {
    enforce(data.mobile).isNotEmpty();
  });

  // Digits only
  test(
    'mobile',
    t?.errors?.mobileDigits || 'Mobile number must contain only digits',
    () => {
      enforce(data.mobile).matches(/^[0-9]+$/);
    }
  );

  // Must start with 6–9
  test(
    'mobile',
    t?.errors?.mobileStart || 'Mobile number must start with 6-9',
    () => {
      enforce(data.mobile).matches(/^[6-9]/);
    }
  );

  // Exactly 10 digits
  test(
    'mobile',
    t?.errors?.mobileLength || 'Mobile number must be 10 digits',
    () => {
      enforce(data.mobile).lengthEquals(10);
    }
  );
});

export default registrationStartValidation;
