import type { Actions, PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const candidates = await locals.db
    .select({ id: table.user.id, email: table.user.email })
    .from(table.user)
    .where(eq(table.user.role, 'candidate'))
    .orderBy(table.user.email);

  const challenges = await locals.db
    .select({
      id: table.challenges.id,
      title: table.challenges.title,
      timeLimitSec: table.challenges.timeLimitSec
    })
    .from(table.challenges)
    .orderBy(table.challenges.title);

  return {
    candidates,
    challenges
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData) as Record<string, string>;
    const { candidateId, totalDurationSec } = data;
    const selectedChallenges = formData.getAll('challengeIds') as string[];

    if (!candidateId || !totalDurationSec) {
      return fail(400, { message: 'Candidate and duration are required', data });
    }

    if (selectedChallenges.length === 0) {
      return fail(400, { message: 'At least one challenge must be selected', data });
    }

    try {
      const [session] = await locals.db
        .insert(table.sessions)
        .values({ candidateId, totalDurationSec: parseInt(totalDurationSec), status: 'pending' })
        .returning();
    } catch (dbError) {
      console.error('Database error:', dbError);
      return fail(500, { message: 'Failed to create session' });
    }
    throw redirect(302, '/admin/sessions');
  }
};
