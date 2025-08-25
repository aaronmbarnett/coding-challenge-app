import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
export const load: PageServerLoad = async ({ locals }) => {
  const challenges = await locals.db
    .select()
    .from(table.challenges)
    .orderBy(table.challenges.createdAt);

  return {
    challenges
  };
};
