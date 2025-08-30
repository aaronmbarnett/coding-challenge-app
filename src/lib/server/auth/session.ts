import { dev } from '$app/environment';
import crypto from 'node:crypto';
import { parse, serialize } from 'cookie';
import type { RequestEvent } from '@sveltejs/kit';

const SECRET = process.env.SESSION_SECRET ?? 'dev-only-not-secret';
const COOKIE_NAME = 'sid';
const SESSION_COOKIE = 'dev-session';
const ONE_WEEK = 60 * 60 * 24 * 7;

/** User data stored in session cookies */
export type SessionUser = { id: string; email: string; role: 'admin' | 'candidate' };

/**
 * Sets a development session cookie with user data.
 * Used in development for simple authentication without signing.
 *
 * @param event SvelteKit request event
 * @param user User data to store in session
 */
export function setDevSession(event: RequestEvent, user: SessionUser) {
  const userJson = JSON.stringify(user);
  event.cookies.set(SESSION_COOKIE, userJson, {
    path: '/',
    httpOnly: true,
    maxAge: ONE_WEEK
  });
}

/**
 * Retrieves user data from development session cookie.
 * Used in development for simple authentication.
 *
 * @param event SvelteKit request event
 * @returns User data if session exists and is valid, null otherwise
 */
export function getDevSession(event: RequestEvent): SessionUser | null {
  const cookie = event.cookies.get(SESSION_COOKIE);
  if (!cookie) {
    return null;
  }
  try {
    return JSON.parse(cookie) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Clears development session cookie.
 * Used during logout in development environment.
 *
 * @param event SvelteKit request event
 */
export function clearDevSessions(event: RequestEvent) {
  event.cookies.delete(SESSION_COOKIE, { path: '/' });
}

/**
 * Signs data with HMAC for tamper-proof cookies.
 * @internal Used internally for session security
 *
 * @param data Data to sign
 * @returns Signed data with MAC appended
 */
function sign(data: string): string {
  const mac = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${mac}`;
}

/**
 * Verifies signed data and returns original data if valid.
 * @internal Used internally for session security
 *
 * @param signed Signed data string
 * @returns Original data if signature is valid, null otherwise
 */
function verify(signed: string): string | null {
  const [data, mac] = signed.split('.');
  if (!data || !mac) {
    return null;
  }
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected)) ? data : null;
}

/**
 * Extracts user data from a signed session cookie in request.
 * Used by authentication hooks to verify user sessions.
 *
 * @param req HTTP request object
 * @returns User data if session is valid, null otherwise
 */
export function getSessionUserFromRequest(req: Request) {
  const jar = parse(req.headers.get('cookie') ?? '');
  const raw = jar[COOKIE_NAME];
  if (!raw) {
    return null;
  }

  const data = verify(raw);
  if (!data) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString()) satisfies SessionUser;
  } catch {
    return null;
  }
}

/**
 * Sets a signed session cookie with user data.
 * Used after successful authentication in production.
 *
 * @param headers HTTP response headers to modify
 * @param user User data to store in signed session
 */
export function setSessionUser(headers: Headers, user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const value = sign(payload);

  headers.append(
    'set-cookie',
    serialize(COOKIE_NAME, value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !dev,
      path: '/',
      maxAge: ONE_WEEK
    })
  );
}

/**
 * Clears the session cookie by setting it to expire.
 * Used during logout to remove user session.
 *
 * @param headers HTTP response headers to modify
 */
export function clearSession(headers: Headers) {
  headers.append(
    'set-cookie',
    serialize(COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: !dev,
      path: '/',
      maxAge: 0
    })
  );
}
