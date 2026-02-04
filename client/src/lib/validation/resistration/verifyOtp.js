// src/lib/validation/registration/verifyOtp.validation.js

export function validateOtp(otp, t) {
  if (!otp) {
    return t?.errors?.otpRequired || 'OTP is required';
  }

  if (!/^\d+$/.test(otp)) {
    return t?.errors?.otpDigits || 'OTP must contain only numbers';
  }

  if (otp.length !== 6) {
    return t?.errors?.otpLength || 'OTP must be 6 digits';
  }

  return '';
}
