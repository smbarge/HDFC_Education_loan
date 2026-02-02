import { create, test, enforce } from 'vest';

const loginValidation = create((data, t) => {
  test('username', t.errors.usernameRequired, () => {
    enforce(data.username).isNotEmpty();
  });

  test('password', t.errors.passwordRequired, () => {
    enforce(data.password).isNotEmpty();
  });

  test('password', t.errors.passwordMinLength, () => {
    enforce(data.password).longerThanOrEquals(6);
  });
});

export default loginValidation;
