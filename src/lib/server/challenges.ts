import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Data structure for creating or updating a coding challenge.
 * Used by form handlers and server actions to validate and process challenge data.
 */
export interface CreateChallengeData {
  /** The challenge title */
  title: string;
  /** Markdown description of the challenge */
  description: string;
  /** Comma-separated list of supported programming languages */
  languages: string;
  /** Optional starter code template for candidates */
  starterCode?: string | null;
  /** Optional time limit in seconds for completing the challenge */
  timeLimitSec?: number | null;
}

/**
 * Creates a new coding challenge in the database.
 * Called by server actions in challenge creation forms.
 *
 * @param db Database instance from locals
 * @param data Validated challenge data from form submission
 * @returns The created challenge record with generated ID
 * @throws {Error} When required fields are missing or invalid
 */
export async function createChallenge(
  db: BetterSQLite3Database<typeof table>,
  data: CreateChallengeData
) {
  // validation
  if (!data.title?.trim() || !data.description?.trim() || !data.languages?.trim()) {
    throw new Error('Title, description, and languages are required');
  }

  const [challenge] = await db
    .insert(table.challenges)
    .values({
      title: data.title.trim(),
      descriptionMd: data.description.trim(),
      languagesCsv: data.languages.trim(),
      starterCode: data.starterCode?.trim() ?? null,
      timeLimitSec: data.timeLimitSec ?? null
    })
    .returning();

  return challenge;
}

/**
 * Updates an existing coding challenge.
 * Called by server actions in challenge edit forms.
 *
 * @param db Database instance from locals
 * @param challengeId Unique identifier of the challenge to update
 * @param data Updated challenge data from form submission
 * @throws {Error} When required fields are missing or invalid
 */
export async function updateChallenge(
  db: BetterSQLite3Database<typeof table>,
  challengeId: string,
  data: CreateChallengeData
): Promise<void> {
  if (!data.title?.trim() || !data.description?.trim() || !data.languages?.trim()) {
    throw new Error('Title, description, and languages are required');
  }

  await db
    .update(table.challenges)
    .set({
      title: data.title.trim(),
      descriptionMd: data.description.trim(),
      languagesCsv: data.languages.trim(),
      starterCode: data.starterCode?.trim() || null,
      timeLimitSec: data.timeLimitSec || null
    })
    .where(eq(table.challenges.id, challengeId));
}

/**
 * Deletes a coding challenge and all associated test cases.
 * Called by server actions in challenge management.
 *
 * @param db Database instance from locals
 * @param challengeId Unique identifier of the challenge to delete
 *
 * @remarks Performs cascading delete - removes test cases before challenge
 */
export async function deleteChallenge(
  db: BetterSQLite3Database<typeof table>,
  challengeId: string
) {
  // delete test cases first
  await db.delete(table.challengeTests).where(eq(table.challenges.id, challengeId));

  // delete challenge
  await db.delete(table.challenges).where(eq(table.challenges.id, challengeId));
}

/**
 * Parses HTML form data into a typed challenge data object.
 * Used by server actions to transform form submissions.
 *
 * @param formData FormData from request in server action
 * @returns Typed challenge data ready for database operations
 *
 * @remarks Converts string form values to appropriate types.
 * Time limit is parsed to number or null if empty.
 */
export function parseFormDataToChallenge(formData: FormData): CreateChallengeData {
  const timeLimit = formData.get('timeLimit') as string;
  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    languages: formData.get('languages') as string,
    starterCode: formData.get('starterCode') as string,
    timeLimitSec: timeLimit ? parseInt(timeLimit, 10) : null
  };
}
