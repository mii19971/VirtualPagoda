import { COUNTRIES, DEFAULT_COUNTRY, type Country } from '@/constants/countries';

// Vietnamese mobile numbers without the trunk 0: 9 digits starting with 3, 5, 7, 8 or 9.
const VN_MOBILE_PATTERN = /^[35789]\d{8}$/;
// E.164 allows at most 15 digits including the country code.
const MAX_E164_DIGITS = 15;
const MIN_NATIONAL_DIGITS = 4;

export const MIN_PASSWORD_LENGTH = 6;

/**
 * Digits of the national number, without separators or the trunk prefix 0
 * (Italy keeps its leading 0 in international format).
 */
function nationalDigits(country: Country, phone: string): string {
  let digits = phone.replace(/\D/g, '');
  // A pasted international number ("+84 912 345 678") already carries the country code.
  if (phone.trim().startsWith('+') && digits.startsWith(country.dialCode)) {
    digits = digits.slice(country.dialCode.length);
  }
  return country.code === 'IT' ? digits : digits.replace(/^0/, '');
}

/** Full number in E.164 format, e.g. "+84912345678". */
export function toE164(country: Country, phone: string): string {
  return `+${country.dialCode}${nationalDigits(country, phone)}`;
}

/**
 * "+84912345678" → { country: Việt Nam, national: "912345678" }.
 * Longest dial code wins; countries sharing a code (US/CA) resolve to the first listed.
 */
export function splitE164(phone: string): { country: Country; national: string } {
  const digits = phone.replace(/\D/g, '');
  const country = [...COUNTRIES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => digits.startsWith(c.dialCode));
  return country
    ? { country, national: digits.slice(country.dialCode.length) }
    : { country: DEFAULT_COUNTRY, national: digits };
}

/**
 * Display form of an E.164 number: Vietnamese numbers in local form ("+84912345678" → "0912345678");
 * other countries keep E.164 since their trunk prefixes differ.
 */
export function toLocalPhone(phone: string): string {
  const { country, national } = splitE164(phone);
  return country.code === 'VN' ? `0${national}` : phone;
}

export function validatePhone(country: Country, phone: string): string | undefined {
  if (!phone.trim()) return 'Vui lòng nhập số điện thoại.';

  const national = nationalDigits(country, phone);
  const isValid =
    country.code === 'VN'
      ? VN_MOBILE_PATTERN.test(national)
      : national.length >= MIN_NATIONAL_DIGITS &&
        country.dialCode.length + national.length <= MAX_E164_DIGITS;
  if (!isValid) return 'Số điện thoại không hợp lệ.';
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Vui lòng nhập mật khẩu.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
  }
}

export function validateName(name: string): string | undefined {
  if (name.trim().length < 2) return 'Vui lòng nhập họ tên (ít nhất 2 ký tự).';
}
