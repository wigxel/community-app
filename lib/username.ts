export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const USERNAME_REGEX = /^[a-z0-9_-]+$/;

export function validateUsernameFormat(username: string): string | null {
  const value = username.trim().toLowerCase();

  if (value.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
  }

  if (value.length > USERNAME_MAX_LENGTH) {
    return `Username must be at most ${USERNAME_MAX_LENGTH} characters`;
  }

  if (!USERNAME_REGEX.test(value)) {
    return "Only lowercase letters, numbers, - and _ allowed";
  }

  return null;
}
