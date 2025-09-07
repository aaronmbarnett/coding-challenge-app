import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Data structure for creating a new coding session.
 * Used by session creation forms to specify session parameters.
 */
export interface CreateSessionData {
  /** ID of the candidate who will take the session */
  candidateId: string;
  /** Total time allowed for the session in seconds */
  totalDurationSec: number;
  /** Array of challenge IDs to include in this session */
  challengeIds: string[];
}

/**
 * Creates a new coding session with associated challenge attempts.
 * Called by server actions when admins create sessions for candidates.
 *
 * @param db Database instance from locals
 * @param data Session configuration including candidate and challenges
 * @returns The created session record
 * @throws {Error} When required fields are missing or no challenges selected
 *
 * @remarks Creates both the session and individual attempt records for each challenge
 */
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
  const attemptValues = data.challengeIds.map((challengeId) => ({
    sessionId: session.id,
    challengeId: challengeId,
    status: 'locked' as const
  }));

  await db.insert(table.attempts).values(attemptValues);

  return session;
}

/**
 * Starts a pending coding session, setting start time and end time.
 * Called when a candidate begins their coding assessment.
 *
 * @param db Database instance from locals
 * @param sessionId Unique identifier of the session to start
 * @returns Object containing session, start time, and calculated end time
 * @throws {Error} When session not found or cannot be started
 *
 * @remarks Only pending sessions can be started. Calculates end time based on duration.
 */
export async function startSession(db: BetterSQLite3Database<typeof table>, sessionId: string) {
  const [session] = await db.select().from(table.sessions).where(eq(table.sessions.id, sessionId));

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

/**
 * Stops an active coding session, marking it as submitted.
 * Called when a candidate completes or times out of their assessment.
 *
 * @param db Database instance from locals
 * @param sessionId Unique identifier of the session to stop
 * @returns Object containing session and end time
 * @throws {Error} When session not found or cannot be stopped
 *
 * @remarks Only active sessions can be stopped. Sets final end time.
 */
export async function stopSession(db: BetterSQLite3Database<typeof table>, sessionId: string) {
  const [session] = await db.select().from(table.sessions).where(eq(table.sessions.id, sessionId));

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

/**
 * Calculates when a session should end based on start time and duration.
 * Utility function used in session timing calculations.
 *
 * @param startTime When the session started
 * @param durationSec Session duration in seconds
 * @returns Date when the session should end
 */
export function calculateSessionEndTime(startTime: Date, durationSec: number): Date {
  return new Date(startTime.getTime() + durationSec * 1000);
}

/**
 * Checks if a session has expired based on its end time.
 * Used to enforce time limits and prevent late submissions.
 *
 * @param session Session object with endsAt timestamp
 * @returns true if session has passed its end time, false otherwise
 *
 * @remarks Sessions without an endsAt time are considered not expired
 */
export function isSessionExpired(session: { endsAt: Date | null }): boolean {
  if (!session.endsAt) return false;
  return new Date() > session.endsAt;
}

/**
 * Parses HTML form data into a typed session data object.
 * Used by server actions to transform session creation form submissions.
 *
 * @param formData FormData from request in server action
 * @returns Typed session data ready for database operations
 *
 * @remarks Parses duration to number and collects all selected challenge IDs
 */
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
