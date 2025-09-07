import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { executeChallenge } from '$lib/server/execution/challenge-executor';
import { createId } from '@paralleldrive/cuid2';

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
  runTest: async ({ request, params, locals }) => {
    const challengeId = params.id;
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate required fields
    const code = data.code?.toString().trim();
    const language = data.language?.toString().trim();

    if (!code || !language) {
      return fail(400, {
        message: 'Code and language are required',
        data: {
          code: code || undefined,
          language: language || undefined
        }
      });
    }

    try {
      // Get challenge details to validate language support
      const [challenge] = await locals.db
        .select()
        .from(table.challenges)
        .where(eq(table.challenges.id, challengeId));

      if (!challenge) {
        return fail(404, {
          message: 'Challenge not found'
        });
      }

      // Check if language is supported for this challenge
      const supportedLanguages = challenge.languagesCsv.split(',').map((lang) => lang.trim());
      if (!supportedLanguages.includes(language)) {
        return fail(400, {
          message: `Language ${language} is not supported for this challenge. Supported languages: ${supportedLanguages.join(', ')}`,
          data: {
            code,
            language
          }
        });
      }

      // Create a mock attempt for testing purposes
      // In a real scenario, this would be tied to a user session/attempt
      const mockAttemptId = `test-attempt-${createId()}`;

      // Create a temporary session and attempt for testing
      const [user] = await locals.db
        .insert(table.user)
        .values({
          email: 'test-admin@example.com',
          role: 'admin'
        })
        .returning();

      const [session] = await locals.db
        .insert(table.sessions)
        .values({
          candidateId: user.id,
          totalDurationSec: 3600,
          status: 'active'
        })
        .returning();

      const [attempt] = await locals.db
        .insert(table.attempts)
        .values({
          sessionId: session.id,
          challengeId: challengeId,
          status: 'in_progress'
        })
        .returning();

      // Execute the code
      const executionResult = await executeChallenge({
        attemptId: attempt.id,
        code,
        language
      });

      // Clean up the temporary test data
      await locals.db.delete(table.submissions).where(eq(table.submissions.attemptId, attempt.id));
      await locals.db.delete(table.attempts).where(eq(table.attempts.id, attempt.id));
      await locals.db.delete(table.sessions).where(eq(table.sessions.id, session.id));
      await locals.db.delete(table.user).where(eq(table.user.id, user.id));

      return {
        success: true,
        executionResult
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

      return fail(500, {
        message: `Code execution failed: ${errorMessage}`
      });
    }
  }
};
