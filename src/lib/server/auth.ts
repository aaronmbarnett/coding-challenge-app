import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

/** Milliseconds in a day, used for session expiration calculations */
const DAY_IN_MS = 1000 * 60 * 60 * 24;

/** Name of the HTTP cookie used to store session tokens */
export const sessionCookieName = 'auth-session';

/**
 * Generates a cryptographically secure session token.
 * Used when creating new user sessions.
 *
 * @returns Base64url-encoded random token string
 */
export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const token = encodeBase64url(bytes);
  return token;
}

/**
 * Creates a new user session in the database.
 * Called after successful authentication to establish a session.
 *
 * @param token Raw session token to be hashed and stored
 * @param userId ID of the authenticated user
 * @returns The created session record
 *
 * @remarks Token is hashed using SHA-256 before storage for security
 */
export async function createSession(token: string, userId: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: table.Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
  };
  await db.insert(table.session).values(session);
  return session;
}

/**
 * Validates a session token and returns associated user data.
 * Used by authentication hooks to verify user sessions.
 *
 * @param token Session token from cookie
 * @returns Object containing session and user data, or nulls if invalid
 *
 * @remarks Automatically renews sessions that are close to expiring.
 * Expired sessions are deleted from the database.
 */
export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const [result] = await db
    .select({
      // Adjust user table here to tweak returned data
      user: { id: table.user.id, email: table.user.email, role: table.user.role },
      session: table.session
    })
    .from(table.session)
    .innerJoin(table.user, eq(table.session.userId, table.user.id))
    .where(eq(table.session.id, sessionId));

  if (!result) {
    return { session: null, user: null };
  }
  const { session, user } = result;

  const sessionExpired = Date.now() >= session.expiresAt.getTime();
  if (sessionExpired) {
    await db.delete(table.session).where(eq(table.session.id, session.id));
    return { session: null, user: null };
  }

  const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
  if (renewSession) {
    session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
    await db
      .update(table.session)
      .set({ expiresAt: session.expiresAt })
      .where(eq(table.session.id, session.id));
  }

  return { session, user };
}

/** Type representing the result of session validation */
export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

/**
 * Invalidates a session by removing it from the database.
 * Called during logout or when cleaning up expired sessions.
 *
 * @param sessionId Hashed session ID to invalidate
 */
export async function invalidateSession(sessionId: string) {
  await db.delete(table.session).where(eq(table.session.id, sessionId));
}

/**
 * Sets the session token as an HTTP cookie.
 * Called after successful authentication to store session client-side.
 *
 * @param event SvelteKit request event
 * @param token Session token to store
 * @param expiresAt When the cookie should expire
 */
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
  event.cookies.set(sessionCookieName, token, {
    expires: expiresAt,
    path: '/'
  });
}

/**
 * Deletes the session token cookie.
 * Called during logout to remove session from client.
 *
 * @param event SvelteKit request event
 */
export function deleteSessionTokenCookie(event: RequestEvent) {
  event.cookies.delete(sessionCookieName, {
    path: '/'
  });
}
