import type { PageServerLoad, Actions } from './$types';
import * as table from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const challenges = await locals.db
    .select()
    .from(table.challenges)
    .orderBy(table.challenges.createdAt);

  return {
    challenges
  };
};

export const actions: Actions = {
  bulkDelete: async ({ locals, request }) => {
    const formData = await request.formData();
    const challengeIds = formData.getAll('challengeIds') as string[];

    if (challengeIds.length === 0) {
      return fail(400, { message: 'No challenges selected for deletion' });
    }

    try {
      const attempts = await locals.db
        .select()
        .from(table.attempts)
        .where(inArray(table.attempts.challengeId, challengeIds));

      if (attempts.length > 0) {
        return fail(400, { message: 'Cannot delete challenges with existing attempts.' });
      }

      const submissions = await locals.db
        .select()
        .from(table.submissions)
        .innerJoin(table.attempts, eq(table.submissions.attemptId, table.attempts.id))
        .where(inArray(table.attempts.challengeId, challengeIds));

      if (submissions.length > 0) {
        return fail(400, {
          message: 'Cannot delete challenge with existing submissions. Data preservation required.'
        });
      }

      await locals.db
        .delete(table.challengeTests)
        .where(inArray(table.challengeTests.challengeId, challengeIds));

      await locals.db.delete(table.challenges).where(inArray(table.challenges.id, challengeIds));
    } catch (error) {
      console.error('Error in bulk delete:', error);
      return fail(500, { message: 'Failed to delete challenges' });
    }

    throw redirect(303, '/admin/challenges');
  }
};
