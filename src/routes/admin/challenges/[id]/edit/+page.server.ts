import type { Actions, PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
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
  return {
    challenge
  };
};

export const actions: Actions = {
  update: async ({ request, params, locals }) => {
    const challengeId = params.id;
    const formData = await request.formData();
    const data = Object.fromEntries(formData) as Record<string, string>;

    const { title, description, languages, starterCode, timeLimit } = data;
    const timeLimitSec = timeLimit?.trim() ? parseInt(timeLimit.trim()) : null;

    if (!title || !description || !languages) {
      return fail(400, { message: 'Title,desc, and lang are required' });
    }

    try {
      await locals.db
        .update(table.challenges)
        .set({
          title,
          descriptionMd: description,
          languagesCsv: languages,
          starterCode,
          timeLimitSec
        })
        .where(eq(table.challenges.id, challengeId));
    } catch (error) {
      console.error('Error updating challenge:', error);
      return fail(500, { message: 'Failed to update challenge', data });
    }

    throw redirect(302, `/admin/challenges/${challengeId}`);
  },
  delete: async ({ locals, params }) => {
    const challengeId = params.id;
    try {
      // delete assosciated test cases first
      await locals.db
        .delete(table.challengeTests)
        .where(eq(table.challengeTests.challengeId, challengeId));

      // delete the challenge
      await locals.db.delete(table.challenges).where(eq(table.challenges.id, challengeId));
    } catch (error) {
      console.error('Error deleteing challenge:', error);
      return fail(500, { message: 'Failed to delete challenge.' });
    }
    throw redirect(302, '/admin/challenges');
  }
};
