export const emailRules = {
  required: 'Email is required',
  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
  maxLength: { value: 120, message: 'Email is too long' },
};

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Use at least 8 characters';
  if (value.length > 72) return 'Use at most 72 characters';
  if (!/[a-z]/.test(value)) return 'Add a lowercase letter';
  if (!/[A-Z]/.test(value)) return 'Add an uppercase letter';
  if (!/\d/.test(value)) return 'Add a number';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Add a special character (e.g. @ # !)';
  return true;
}

export const SKILL_NAME_PATTERN = /^[\p{L}\p{N} .,+#&'’\-/()]+$/u;
export const normalizeSkill = (value) => value.trim().replace(/\s+/g, ' ').toLowerCase();
