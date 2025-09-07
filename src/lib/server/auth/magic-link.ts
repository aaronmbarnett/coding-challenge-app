import crypto from 'node:crypto';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as table from '../db/schema';
import { eq, and } from 'drizzle-orm';

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

/**
 * Generates a cryptographically secure random token for magic links.
 * @returns 64-character hexadecimal string (32 random bytes)
 */
export function generateMagicLinkToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a magic link token using SHA-256.
 * @param token The raw token to hash
 * @returns SHA-256 hash as Buffer
 */
export function hashToken(token: string): Buffer {
  return crypto.createHash('sha256').update(token).digest();
}

/**
 * Verifies a token against its hash using timing-safe comparison.
 * @param token The raw token to verify
 * @param hash The stored hash to compare against
 * @returns True if token matches hash, false otherwise
 */
export function verifyToken(token: string, hash: Buffer): boolean {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(tokenHash, hash);
}

/**
 * Creates a magic link invitation for a candidate.
 * @param db Database instance
 * @param email Candidate email address
 * @param createdBy ID of admin user creating the invitation
 * @returns Object containing the raw token and stored invitation record
 */
export async function createMagicLinkInvitation(
  db: BetterSQLite3Database,
  email: string,
  createdBy: string
) {
  const token = generateMagicLinkToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + THIRTY_MINUTES_MS);

  const [invitation] = await db
    .insert(table.invitation)
    .values({
      email,
      tokenHash,
      expiresAt,
      createdBy
    })
    .returning();

  return { token, invitation };
}

/**
 * Validates a magic link token and marks it as consumed if valid.
 * @param db Database instance
 * @param token The raw token to validate
 * @param email Email address associated with the invitation
 * @returns Validation result with invitation data if valid
 */
export async function validateMagicLinkToken(
  db: BetterSQLite3Database,
  token: string,
  email: string
): Promise<{
  valid: boolean;
  invitation: table.Invitation | null;
  error?: string;
}> {
  try {
    // Find all invitations for this email to check token against
    const invitations = await db
      .select()
      .from(table.invitation)
      .where(eq(table.invitation.email, email))
      .orderBy(table.invitation.createdAt);

    // Find invitation that matches the token
    let matchingInvitation: table.Invitation | null = null;
    for (const invitation of invitations) {
      if (verifyToken(token, invitation.tokenHash)) {
        matchingInvitation = invitation;
        break;
      }
    }

    if (!matchingInvitation) {
      return {
        valid: false,
        invitation: null,
        error: 'Invalid or expired magic link'
      };
    }

    // Check if already consumed
    if (matchingInvitation.consumedAt) {
      return {
        valid: false,
        invitation: null,
        error: 'Magic link has already been used'
      };
    }

    // Check if expired
    if (matchingInvitation.expiresAt < new Date()) {
      return {
        valid: false,
        invitation: null,
        error: 'Invalid or expired magic link'
      };
    }

    // Mark as consumed
    await db
      .update(table.invitation)
      .set({ consumedAt: new Date() })
      .where(eq(table.invitation.id, matchingInvitation.id));

    // Return updated invitation data
    const updatedInvitation = {
      ...matchingInvitation,
      consumedAt: new Date()
    };

    return {
      valid: true,
      invitation: matchingInvitation
    };
  } catch (error) {
    return {
      valid: false,
      invitation: null,
      error: 'Invalid or expired magic link'
    };
  }
}
