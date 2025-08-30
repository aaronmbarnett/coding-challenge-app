import { fail, redirect, type Actions } from '@sveltejs/kit';
import * as table from '$lib/server/db/schema';
import {
  createChallenge,
  parseFormDataToChallenge,
  type CreateChallengeData
} from '$lib/server/challenges';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    try {
      const formData = await request.formData();
      const challengeData: CreateChallengeData = parseFormDataToChallenge(formData);

      await createChallenge(locals.db, challengeData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return fail(400, { message: error.message });
      }
      return fail(500, { message: 'Failed to create challenge' });
    }
    throw redirect(302, '/admin/challenges');
  }
};
