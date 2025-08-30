import type { Actions, PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { createSession, parseSessionFormData } from '$lib/server/sessions';

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
    try {
      const formData = await request.formData();
      const sessionData = parseSessionFormData(formData);

      await createSession(locals.db, sessionData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return fail(400, { message: error.message });
      }
      console.error('Database error:', error);
      return fail(500, { message: 'Failed to create session' });
    }
    throw redirect(302, '/admin/sessions');
  }
};
