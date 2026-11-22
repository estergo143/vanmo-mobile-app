export const DEFAULT_COUNTRY_CODE = '+63';
export const DEFAULT_COUNTRY_NAME = 'Philippines';
export const DEFAULT_COUNTRY_FLAG = '🇵🇭';

/**
 * Sanitizes input into a clean 10-digit Philippine mobile number:
 * - Strips all non-digit characters.
 * - Strips leading 0 if the user enters 11 digits (e.g. 09201234567 -> 9201234567).
 * - Strips leading 63 if the user enters 12 digits (e.g. 639201234567 -> 9201234567).
 * - Caps at 10 digits.
 */
export function sanitizeMobileNumber(input: string): string {
  const digitsOnly = input.replace(/\D/g, '');

  if (digitsOnly.startsWith('63') && digitsOnly.length > 10) {
    return digitsOnly.slice(2, 12);
  }

  if (digitsOnly.startsWith('0') && digitsOnly.length > 10) {
    return digitsOnly.slice(1, 11);
  }

  return digitsOnly.slice(0, 10);
}

/**
 * Validates whether the mobile number is a valid 10-digit Philippine mobile number starting with 9.
 * Example: 9201234567
 */
export function isValidMobileNumber(mobileNumber: string): boolean {
  return /^9\d{9}$/.test(mobileNumber);
}

/**
 * Formats 10-digit mobile number to full E.164 format.
 * Example: 9201234567 -> +639201234567
 */
export function toE164(
  mobileNumber: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  return `${countryCode}${mobileNumber}`;
}

/**
 * Masks mobile number for privacy while displaying country code and last 4 digits.
 * Example: 9201234567 -> +63 *** *** 4567
 */
export function maskMobileNumber(
  mobileNumber?: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  if (!mobileNumber || mobileNumber.length < 4) {
    return `${countryCode} *** *** ****`;
  }
  const lastFour = mobileNumber.slice(-4);
  return `${countryCode} *** *** ${lastFour}`;
}

/**
 * Validates whether the OTP verification code consists of 6 digits.
 */
export function isValidOtp(token: string): boolean {
  return /^\d{6}$/.test(token);
}
