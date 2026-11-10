/** Same minimum the API enforces. */
export const MIN_PASSWORD_LENGTH = 8;

/** Same maximums the API enforces. */
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_EMAIL_LENGTH = 254;

/** Basic email shape and length check; the server validates it again. */
export const isValidEmail = (email: string) => {
  const value = email.trim();
  return (
    value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
};
