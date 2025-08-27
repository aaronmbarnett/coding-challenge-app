import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

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
