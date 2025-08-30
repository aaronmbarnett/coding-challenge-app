import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { startSession, stopSession } from '$lib/server/sessions';

export const load: PageServerLoad = async ({ params, locals }) => {
  const sessionId = params.id;

  // get session with candidate info
  const [sessionData] = await locals.db
    .select({
      session: table.sessions,
      candidate: { id: table.user.id, email: table.user.email }
    })
    .from(table.sessions)
    .leftJoin(table.user, eq(table.sessions.candidateId, table.user.id))
    .where(eq(table.sessions.id, sessionId));

  if (sessionData == null) {
    throw error(404, 'Session not found');
  }

  // get attempts for this session with challenge info
  const attempts = await locals.db
    .select({
      attempt: table.attempts,
      challenge: {
        id: table.challenges.id,
        title: table.challenges.title,
        timeLimitSec: table.challenges.timeLimitSec
      }
    })
    .from(table.attempts)
    .leftJoin(table.challenges, eq(table.attempts.challengeId, table.challenges.id))
    .where(eq(table.attempts.sessionId, sessionId))
    .orderBy(table.challenges.title);

  return {
    session: sessionData.session,
    candidate: sessionData.candidate,
    attempts
  };
};

export const actions: Actions = {
  startSession: async ({ params, locals }) => {
    const sessionId = params.id;

    try {
      await startSession(locals.db, sessionId);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Session not found') {
          return fail(404, { message: error.message });
        }
        if (error.message === 'Session cannot be started') {
          return fail(400, { message: error.message });
        }
        return fail(400, { message: error.message });
      }
      console.error('Database error:', error);
      return fail(500, { message: 'Failed to start session' });
    }
  },

  stopSession: async ({ params, locals }) => {
    const sessionId = params.id;

    try {
      await stopSession(locals.db, sessionId);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Session not found') {
          return fail(404, { message: error.message });
        }
        if (error.message === 'Session cannot be stopped') {
          return fail(400, { message: error.message });
        }
        return fail(400, { message: error.message });
      }
      console.error('Database error:', error);
      return fail(500, { message: 'Failed to stop session' });
    }
  }
};
