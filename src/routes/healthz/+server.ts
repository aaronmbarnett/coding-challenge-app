import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  locals.db.run('select 1');
  return new Response('ok', { status: 200 });
};
