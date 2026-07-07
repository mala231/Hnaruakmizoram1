import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "mizoram-jobboard-default-secret-key-2026"
);

export interface TokenPayload {
  userId: string;
  role: "employer" | "admin";
}

/**
 * Signs a JWT session token for an employer or admin.
 */
export async function signJWT(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT session token. Returns the decoded payload or null if invalid/expired.
 */
export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

export interface PendingRegisterPayload {
  username: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
  logoUrl: string;
  otpHash: string;
  otpCreatedAt: number;
}

/**
 * Signs a short-lived pending registration token (1-hour validation window).
 */
export async function signPendingRegisterJWT(payload: PendingRegisterPayload): Promise<string> {
  return new SignJWT({ ...payload as any })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h") // Token is active for 1 hr to allow resends
    .sign(JWT_SECRET);
}

/**
 * Verifies a pending registration token. Returns payload or null if invalid/expired.
 */
export async function verifyPendingRegisterJWT(token: string): Promise<PendingRegisterPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as PendingRegisterPayload;
  } catch (error) {
    return null;
  }
}

export interface PendingContactPayload {
  name: string;
  email: string;
  message: string;
  otpHash: string;
  otpCreatedAt: number;
}

/**
 * Signs a short-lived pending contact message verification token (10-minute validity window).
 */
export async function signPendingContactJWT(payload: PendingContactPayload): Promise<string> {
  return new SignJWT({ ...payload as any })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m") // Token is active for 10 minutes
    .sign(JWT_SECRET);
}

/**
 * Verifies a pending contact token. Returns payload or null if invalid/expired.
 */
export async function verifyPendingContactJWT(token: string): Promise<PendingContactPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as PendingContactPayload;
  } catch (error) {
    return null;
  }
}

export interface ResetPasswordPayload {
  email: string;
  otpHash: string;
  otpCreatedAt: number;
}

/**
 * Signs a short-lived pending reset password token (15-minute validity window).
 */
export async function signResetPasswordJWT(payload: ResetPasswordPayload): Promise<string> {
  return new SignJWT({ ...payload as any })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m") // Token is active for 15 minutes
    .sign(JWT_SECRET);
}

/**
 * Verifies a reset password token. Returns payload or null if invalid/expired.
 */
export async function verifyResetPasswordJWT(token: string): Promise<ResetPasswordPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as ResetPasswordPayload;
  } catch (error) {
    return null;
  }
}

export interface CaptchaPayload {
  answer: number;
}

/**
 * Signs a short-lived captcha token (5-minute validity window).
 */
export async function signCaptchaJWT(payload: CaptchaPayload): Promise<string> {
  return new SignJWT({ ...payload as any })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m") // Challenge is active for 5 minutes
    .sign(JWT_SECRET);
}

/**
 * Verifies a captcha token. Returns payload or null if invalid/expired.
 */
export async function verifyCaptchaJWT(token: string): Promise<CaptchaPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as CaptchaPayload;
  } catch (error) {
    return null;
  }
}

