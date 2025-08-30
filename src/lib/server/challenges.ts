import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export interface CreateChallengeData {
  title: string;
  description: string;
  languages: string;
  starterCode?: string | null;
  timeLimitSec?: number | null;
}

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

export async function deleteChallenge(
  db: BetterSQLite3Database<typeof table>,
  challengeId: string
) {
  // delete test cases first
  await db.delete(table.challengeTests).where(eq(table.challenges.id, challengeId));

  // delete challenge
  await db.delete(table.challenges).where(eq(table.challenges.id, challengeId));
}

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
