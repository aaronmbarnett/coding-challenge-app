import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { getDevSession } from '$lib/server/auth/session';
import { seedDatabase } from '$lib/server/db/seed';

// Track if seeding has been attempted to avoid multiple attempts
let seedingAttempted = false;

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.db = db;
  event.locals.user = getDevSession(event);
  event.locals.session = null;

  // Auto-seed database in development if SEED_DB=true
  if (
    process.env.SEED_DB === 'true' &&
    !seedingAttempted &&
    process.env.NODE_ENV !== 'production'
  ) {
    seedingAttempted = true;
    try {
      console.log('🌱 Auto-seeding database on first request...');
      await seedDatabase();
      console.log('✅ Database seeded successfully! You can now explore the app with test data.');
    } catch (error) {
      console.error('❌ Failed to seed database:', error);
    }
  }

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
