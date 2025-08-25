import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { getDevSession, getSessionUserFromRequest } from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.db = db;
  event.locals.user = getDevSession(event);
  event.locals.session = null;
  return resolve(event);
};
// const handleAuth: Handle = async ({ event, resolve }) => {
//   // Attach DB to locals
//   event.locals.db = db;
//   event.locals.user = getSessionUserFromRequest(event.request);
//
//   const sessionToken = event.cookies.get(auth.sessionCookieName);
//
//   if (!sessionToken) {
//     event.locals.user = null;
//     event.locals.session = null;
//     return resolve(event);
//   }
//
//   const { session, user } = await auth.validateSessionToken(sessionToken);
//
//   if (session) {
//     auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
//   } else {
//     auth.deleteSessionTokenCookie(event);
//   }
//
//   event.locals.user = user;
//   event.locals.session = session;
//   return resolve(event);
// };
//
// export const handle: Handle = handleAuth;
