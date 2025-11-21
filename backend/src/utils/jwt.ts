// src/auth/jwt.ts
import * as jwt from 'jsonwebtoken';

/**
 * Fail-fast runtime checks so TypeScript can treat these as `string`.
 */
if (!process.env.JWT_SECRET) {
  throw new Error('Missing env var: JWT_SECRET');
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('Missing env var: JWT_REFRESH_SECRET');
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET;

/**
 * Use the library's SignOptions['expiresIn'] type to avoid typing friction.
 */
const JWT_EXPIRES_IN: jwt.SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '15m';

const JWT_REFRESH_EXPIRES_IN: jwt.SignOptions['expiresIn'] =
  (process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '7d';

/**
 * Payload contract — keep it minimal and extendable.
 */
export interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
  [k: string]: unknown;
}

/**
 * Generate an access token (synchronous).
 * Payload must be an object when using expiresIn.
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate a refresh token (synchronous).
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verify access token and return typed payload.
 * Throws on invalid/expired tokens.
 */
export function verifyAccessToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === 'string' || decoded == null) {
    throw new Error('Invalid token payload');
  }

  return decoded as JWTPayload;
}

/**
 * Verify refresh token and return typed payload.
 * Throws on invalid/expired tokens.
 */
export function verifyRefreshToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

  if (typeof decoded === 'string' || decoded == null) {
    throw new Error('Invalid token payload');
  }

  return decoded as JWTPayload;
}
