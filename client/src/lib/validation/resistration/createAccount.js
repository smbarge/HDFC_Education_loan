import { create, test, enforce } from 'vest';

const createAccountValidation = create((data, t) => {
  // Password Validation
  test('password', t?.errors?.passwordRequired || 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('password', t?.errors?.passwordMinLength || 'Password must be at least 6 characters', () => {
    enforce(data.password).longerThanOrEquals(6);
  });

  test('password', t?.errors?.passwordSpecial || 'Password must contain at least one special character', () => {
    enforce(data.password).matches(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/);
  });

  test('password', t?.errors?.passwordNumber || 'Password must contain at least one number', () => {
    enforce(data.password).matches(/[0-9]/);
  });

  // Confirm Password Validation
  test('confirmPassword', t?.errors?.confirmPasswordRequired || 'Please confirm your password', () => {
    enforce(data.confirmPassword).isNotEmpty();
  });

  test('confirmPassword', t?.errors?.confirmPasswordMinLength || 'Password must be at least 6 characters', () => {
    enforce(data.confirmPassword).longerThanOrEquals(6);
  });

  test('confirmPassword', t?.errors?.confirmPasswordMatch || 'Passwords do not match', () => {
    enforce(data.confirmPassword).equals(data.password);
  });
});

export default createAccountValidation;