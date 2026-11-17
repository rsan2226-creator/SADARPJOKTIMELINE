import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE_NAME = 'sadarpjok_session';

const getSessionSecret = () =>
  process.env.AUTH_SESSION_SECRET || 'sadarpjok-pjok-session-secret-2026';

export function createSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      u: username,
      iat: Date.now(),
    })
  ).toString('base64url');

  const sig = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');

  return `${payload}.${sig}`;
}

export function verifySessionToken(token?: string | null): { valid: boolean; username?: string } {
  if (!token || !token.includes('.')) {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payload, sig] = parts;
  if (!payload || !sig) {
    return { valid: false };
  }

  const expectedSig = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false };
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      u?: string;
      iat?: number;
    };
    if (!decoded.u) return { valid: false };
    return { valid: true, username: decoded.u };
  } catch {
    return { valid: false };
  }
}
