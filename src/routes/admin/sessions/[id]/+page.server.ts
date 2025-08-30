import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';

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
    const now = new Date();

    try {
      const [session] = await locals.db
        .select()
        .from(table.sessions)
        .where(eq(table.sessions.id, sessionId));
      if (!session) {
        return fail(404, { message: 'Session not found' });
      }
      if (session.status !== 'pending') {
        return fail(400, { message: 'Session cannot be started' });
      }
      const endsAt = new Date(now.getTime() + session.totalDurationSec * 1000);
      await locals.db
        .update(table.sessions)
        .set({ status: 'active', startedAt: now, endsAt: endsAt });

      return { success: true };
    } catch (dbError: unknown) {
      console.error('Database error:', dbError);
      return fail(500, { message: 'Failed to start session' });
    }
  },

  stopSession: async ({ params, locals }) => {
    const sessionId = params.id;
    const now = new Date();

    try {
      const [session] = await locals.db
        .select()
        .from(table.sessions)
        .where(eq(table.sessions.id, sessionId));
      if (!session) {
        return fail(404, { message: 'Session not found' });
      }
      if (session.status !== 'active') {
        return fail(400, { message: 'Session cannot be stopped' });
      }
      await locals.db
        .update(table.sessions)
        .set({ status: 'submitted', endsAt: now })
        .where(eq(table.sessions.id, sessionId));

      return { success: true };
    } catch (dbError: unknown) {
      console.error('Database error:', dbError);
      return fail(500, { message: 'Failed to stop session' });
    }
  }
};
