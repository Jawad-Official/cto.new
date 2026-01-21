export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidStatus = (status: string): boolean => {
  return ['TODO', 'IN_PROGRESS', 'DONE'].includes(status);
};

export const isValidPriority = (priority: string): boolean => {
  return ['LOW', 'MEDIUM', 'HIGH'].includes(priority);
};

export const isValidRole = (role: string): boolean => {
  return ['ADMIN', 'MEMBER'].includes(role);
};

export const isValidProjectRole = (role: string): boolean => {
  return ['OWNER', 'MEMBER'].includes(role);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};
