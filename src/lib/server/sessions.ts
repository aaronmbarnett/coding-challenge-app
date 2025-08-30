import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export interface CreateSessionData {
  candidateId: string;
  totalDurationSec: number;
  challengeIds: string[];
}

export async function createSession(
  db: BetterSQLite3Database<typeof table>,
  data: CreateSessionData
) {
  if (!data.candidateId || !data.totalDurationSec) {
    throw new Error('Candidate and duration are required');
  }

  if (data.challengeIds.length === 0) {
    throw new Error('At least one challenge must be selected');
  }

  const [session] = await db
    .insert(table.sessions)
    .values({
      candidateId: data.candidateId,
      totalDurationSec: data.totalDurationSec,
      status: 'pending'
    })
    .returning();

  // Create attempts for each challenge
  const attemptValues = data.challengeIds.map(challengeId => ({
    sessionId: session.id,
    challengeId: challengeId,
    status: 'locked' as const
  }));

  await db.insert(table.attempts).values(attemptValues);

  return session;
}

export async function startSession(
  db: BetterSQLite3Database<typeof table>,
  sessionId: string
) {
  const [session] = await db
    .select()
    .from(table.sessions)
    .where(eq(table.sessions.id, sessionId));

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'pending') {
    throw new Error('Session cannot be started');
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + session.totalDurationSec * 1000);

  await db
    .update(table.sessions)
    .set({ status: 'active', startedAt: now, endsAt: endsAt })
    .where(eq(table.sessions.id, sessionId));

  return { session, startedAt: now, endsAt };
}

export async function stopSession(
  db: BetterSQLite3Database<typeof table>,
  sessionId: string
) {
  const [session] = await db
    .select()
    .from(table.sessions)
    .where(eq(table.sessions.id, sessionId));

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'active') {
    throw new Error('Session cannot be stopped');
  }

  const now = new Date();

  await db
    .update(table.sessions)
    .set({ status: 'submitted', endsAt: now })
    .where(eq(table.sessions.id, sessionId));

  return { session, endedAt: now };
}

export function calculateSessionEndTime(startTime: Date, durationSec: number): Date {
  return new Date(startTime.getTime() + durationSec * 1000);
}

export function isSessionExpired(session: { endsAt: Date | null }): boolean {
  if (!session.endsAt) return false;
  return new Date() > session.endsAt;
}

export function parseSessionFormData(formData: FormData): CreateSessionData {
  const candidateId = formData.get('candidateId') as string;
  const totalDurationSec = parseInt(formData.get('totalDurationSec') as string, 10);
  const challengeIds = formData.getAll('challengeIds') as string[];

  return {
    candidateId,
    totalDurationSec,
    challengeIds
  };
}