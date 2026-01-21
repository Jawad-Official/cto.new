export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateLoginForm = (email: string, password: string): string | null => {
  if (!email) return 'Email is required';
  if (!isValidEmail(email)) return 'Invalid email format';
  if (!password) return 'Password is required';
  if (!isValidPassword(password)) return 'Password must be at least 6 characters';
  return null;
};

export const validateRegisterForm = (
  email: string,
  password: string,
  name: string
): string | null => {
  if (!name) return 'Name is required';
  if (!email) return 'Email is required';
  if (!isValidEmail(email)) return 'Invalid email format';
  if (!password) return 'Password is required';
  if (!isValidPassword(password)) return 'Password must be at least 6 characters';
  return null;
};
