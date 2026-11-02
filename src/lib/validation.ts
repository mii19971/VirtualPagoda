const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Vui lòng nhập email.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Email không hợp lệ.';
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
