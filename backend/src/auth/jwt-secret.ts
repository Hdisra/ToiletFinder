const MIN_SECRET_LENGTH = 32;

/**
 * Stops the app from starting with a secret that anyone could guess.
 * Whoever knows JWT_SECRET can forge login tokens for any user, admin included.
 */
export function assertStrongSecret(secret: string) {
  if (secret.length < MIN_SECRET_LENGTH || secret === 'change-me') {
    throw new Error(
      `JWT_SECRET must be a random value of at least ${MIN_SECRET_LENGTH} characters. ` +
        'Generate one with: openssl rand -base64 48',
    );
  }
  return secret;
}
