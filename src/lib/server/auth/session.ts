import { dev } from '$app/environment';
import crypto from 'node:crypto';
import { parse, serialize } from 'cookie';
import type { RequestEvent } from '@sveltejs/kit';

const SECRET = process.env.SESSION_SECRET ?? 'dev-only-not-secret';
const COOKIE_NAME = 'sid';
const SESSION_COOKIE = 'dev-session';
const ONE_WEEK = 60 * 60 * 24 * 7;

export type SessionUser = { id: string; email: string; role: 'admin' | 'candidate' };

export function setDevSession(event: RequestEvent, user: SessionUser) {
  const userJson = JSON.stringify(user);
  event.cookies.set(SESSION_COOKIE, userJson, {
    path: '/',
    httpOnly: true,
    maxAge: ONE_WEEK
  });
}

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

export function clearDevSessions(event: RequestEvent) {
  event.cookies.delete(SESSION_COOKIE, { path: '/' });
}

function sign(data: string): string {
  const mac = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${mac}`;
}

function verify(signed: string): string | null {
  const [data, mac] = signed.split('.');
  if (!data || !mac) {
    return null;
  }
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected)) ? data : null;
}

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
