import * as table from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
  const challengeId = params.id;

  const [challenge] = await locals.db
    .select()
    .from(table.challenges)
    .where(eq(table.challenges.id, challengeId));

  if (!challenge) {
    throw error(404, 'Challenge not found');
  }

  const testCases = await locals.db
    .select()
    .from(table.challengeTests)
    .where(eq(table.challengeTests.challengeId, challengeId));

  return {
    challenge,
    testCases
  };
};

export const actions: Actions = {
  delete: async ({ locals, params }) => {
    const challengeId = params.id;

    if (!challengeId) {
      return fail(400, { message: 'Challenge ID is required' });
    }

    try {
      // Check if challenge exists
      const [existingChallenge] = await locals.db
        .select()
        .from(table.challenges)
        .where(eq(table.challenges.id, challengeId));

      if (!existingChallenge) {
        return fail(404, { message: 'Challenge not found' });
      }

      // Check for active attempts (which connect to sessions) before deletion
      const activeAttempts = await locals.db
        .select()
        .from(table.attempts)
        .where(eq(table.attempts.challengeId, challengeId));

      if (activeAttempts.length > 0) {
        return fail(400, {
          message: 'Cannot delete challenge with existing attempts/sessions. Data preservation required.'
        });
      }

      const submissions = await locals.db
        .select()
        .from(table.submissions)
        .innerJoin(table.attempts, eq(table.submissions.attemptId, table.attempts.id))
        .where(eq(table.attempts.challengeId, challengeId));

      if (submissions.length > 0) {
        return fail(400, {
          message: 'Cannot delete challenge with existing submissions. Data preservation required.'
        });
      }

      // Safe to cascade delete - remove test cases first, then challenge
      await locals.db
        .delete(table.challengeTests)
        .where(eq(table.challengeTests.challengeId, challengeId));

      await locals.db.delete(table.challenges).where(eq(table.challenges.id, challengeId));

      // Redirect to challenges list after successful deletion
      throw redirect(303, '/admin/challenges');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      return fail(500, { message: 'Failed to delete challenge' });
    }
  }
};
