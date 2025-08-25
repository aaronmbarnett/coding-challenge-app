import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../login/$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  if (locals.user.role !== 'admin') {
    throw redirect(302, '/');
  }

  return { user: locals.user };
};
