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

  const testCases = await locals.db
    .select()
    .from(table.challengeTests)
    .where(eq(table.challengeTests.challengeId, challengeId))
    .orderBy(table.challengeTests.weight);

  return {
    challenge,
    testCases
  };
};

export const actions: Actions = {
  create: async ({ request, params, locals }) => {
    const challengeId = params.id;
    const formData = await request.formData();
    const data = Object.fromEntries(formData) as Record<string, string>;

    const { kind, input, expectedOutput, harnessCode, weight, hidden } = data;

    if (!kind || (kind === 'io' && (!input || !expectedOutput))) {
      return fail(400, {
        message: 'Test kind and input/output are required for I/O tests',
        data
      });
    }

    if (kind === 'harness' && !harnessCode) {
      return fail(400, {
        message: 'Harness code is required for harness tests',
        data
      });
    }

    try {
      await locals.db.insert(table.challengeTests).values({
        challengeId,
        kind: kind as 'io' | 'harness',
        input: input || null,
        expectedOutput: expectedOutput || null,
        harnessCode: harnessCode || null,
        weight: weight ? parseInt(weight) : 1,
        hidden: hidden === 'on' ? 1 : 0
      });
    } catch (dbError: unknown) {
      console.error('Database error:', dbError);
      return fail(500, { message: 'Failed to create test case' });
    }
    throw redirect(302, `/admin/challenges/${challengeId}/tests`);
  },

  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const challengeId = formData.get('challengeId') as string;
    const testId = formData.get('testId') as string;

    if (!testId || !challengeId) {
      return fail(400, { message: 'Test ID and Challenge ID required' });
    }

    try {
      await locals.db.delete(table.challengeTests).where(eq(table.challengeTests.id, testId));
    } catch (error: unknown) {
      return fail(500, { message: 'Failed to delete test case' });
    }
    throw redirect(302, `/admin/challenges/${challengeId}/tests`);
  }
};
