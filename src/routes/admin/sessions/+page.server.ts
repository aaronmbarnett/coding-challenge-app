import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { count, eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const sessions = await locals.db
    .select({
      session: table.sessions,
      candidate: {
        id: table.user.id,
        email: table.user.email
      }
    })
    .from(table.sessions)
    .leftJoin(table.user, eq(table.sessions.candidateId, table.user.id))
    .orderBy(desc(table.sessions.startedAt));

  // get stats for dashboard
  const [challengeCount] = await locals.db.select({ count: count() }).from(table.challenges);

  const [candidateCount] = await locals.db
    .select({ count: count() })
    .from(table.user)
    .where(eq(table.user.role, 'candidate'));

  return {
    sessions,
    stats: {
      totalChallenges: challengeCount.count,
      totalCandidates: candidateCount.count
    }
  };
};
