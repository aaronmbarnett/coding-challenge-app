import { fail, redirect, type Actions } from '@sveltejs/kit';
import * as table from '$lib/server/db/schema';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    console.log('=== Challenge creation started ===');

    const data = await request.formData();
    console.log('Form data received:', Object.fromEntries(data));

    const title = data.get('title') as string;
    const description = data.get('description') as string;
    const languages = data.get('languages') as string;
    const starterCode = (data.get('starterCode') as string) || null;
    const timeLimit = data.get('timeLimitSec') as string;

    console.log('Parsed values:', { title, description, languages, starterCode, timeLimit });

    if (!title || !description || !languages) {
      console.log('Validation failed');
      return fail(400, { message: 'Title, description, and languages are required' });
    }

    try {
      console.log('Attempting database insert...');
      const [challenge] = await locals.db
        .insert(table.challenges)
        .values({
          title,
          descriptionMd: description,
          languagesCsv: languages,
          starterCode,
          timeLimitSec: timeLimit ? parseInt(timeLimit) : null
        })
        .returning();
    } catch (error) {
      console.error('Database error:', error);
      return fail(500, { message: 'Failed to create challenge: ' + error.message });
    }

    throw redirect(302, `/admin/challenges`);
  }
};
