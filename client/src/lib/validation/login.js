import { create, test, enforce } from 'vest';

const loginValidation = create((data, t) => {
  // Username validation
  test('username', t.errors?.usernameRequired || 'Mobile number is required', () => {
    enforce(data.username).isNotEmpty();
  });

  test('username', t.errors?.usernameInvalidFormat || 'Please enter a valid 10-digit mobile number', () => {
    enforce(data.username).matches(/^[6-9]\d{9}$/);
  });

  // Password validation
  test('password', t.errors?.passwordRequired || 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('password', t.errors?.passwordMinLength || 'Password must be at least 6 characters', () => {
    enforce(data.password).longerThanOrEquals(6);
  });
});

export default loginValidation;