import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

export function verifyAccessToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  return decoded as JWTPayload;
}
