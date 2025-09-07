import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateMagicLinkToken,
  hashToken,
  verifyToken,
  createMagicLinkInvitation,
  validateMagicLinkToken
} from './magic-link';
import { setupTestDb, testFactories } from '../db/test-utils';
import * as table from '../db/schema';
import { eq } from 'drizzle-orm';

// Semantic time constants
const THIRTY_MINUTES_MS = 30 * 60 * 1000; // 1800000

describe('Magic Link Authentication', () => {
  let db: ReturnType<typeof setupTestDb>['db'];
  let cleanup: ReturnType<typeof setupTestDb>['cleanup'];

  beforeEach(() => {
    const testDb = setupTestDb();
    db = testDb.db;
    cleanup = testDb.cleanup;
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Token generation and hashing', () => {
    it('should generate a secure random token', () => {
      const token1 = generateMagicLinkToken();
      const token2 = generateMagicLinkToken();

      expect(token1).toHaveLength(64); // 32 bytes as hex = 64 chars
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2); // Should be unique
      expect(token1).toMatch(/^[a-f0-9]+$/); // Should be hex string
    });

    it('should hash tokens consistently', () => {
      const token = 'test-token-12345';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toEqual(hash2);
      expect(hash1).toBeInstanceOf(Buffer);
      expect(hash1.length).toBe(32); // SHA-256 = 32 bytes
    });

    it('should verify tokens against hashes', () => {
      const token = generateMagicLinkToken();
      const hash = hashToken(token);

      expect(verifyToken(token, hash)).toBe(true);
      expect(verifyToken('wrong-token', hash)).toBe(false);
      expect(verifyToken(token + 'extra', hash)).toBe(false);
    });
  });

  describe('Magic link invitation creation', () => {
    it('should create invitation with hashed token', async () => {
      const adminUser = await testFactories.createUser(db, {
        email: 'admin@example.com',
        role: 'admin'
      });

      const email = 'candidate@example.com';
      const result = await createMagicLinkInvitation(db, email, adminUser.id);

      expect(result).toEqual({
        token: expect.stringMatching(/^[a-f0-9]{64}$/),
        invitation: expect.objectContaining({
          id: expect.any(String),
          email: 'candidate@example.com',
          createdBy: adminUser.id,
          expiresAt: expect.any(Date)
        })
      });

      // Verify invitation was stored in database
      const [stored] = await db
        .select()
        .from(table.invitation)
        .where(eq(table.invitation.email, email));

      expect(stored).toBeDefined();
      expect(stored.tokenHash).toBeInstanceOf(Buffer);
      expect(stored.consumedAt).toBeNull();

      // Verify token is not stored directly
      expect(stored.tokenHash).not.toEqual(Buffer.from(result.token));

      // Verify expiry is ~30 minutes from now
      const expiryDiff = stored.expiresAt.getTime() - Date.now();
      expect(expiryDiff).toBeGreaterThan(THIRTY_MINUTES_MS - 1000);
      expect(expiryDiff).toBeLessThan(THIRTY_MINUTES_MS + 1000);
    });

    it('should handle duplicate email invitations', async () => {
      const adminUser = await testFactories.createUser(db, {
        email: 'admin@example.com',
        role: 'admin'
      });

      const email = 'candidate@example.com';

      // Create first invitation
      await createMagicLinkInvitation(db, email, adminUser.id);

      // Creating second invitation should succeed (new token)
      const result2 = await createMagicLinkInvitation(db, email, adminUser.id);

      expect(result2.token).toMatch(/^[a-f0-9]{64}$/);

      // Should have 2 invitations for same email
      const invitations = await db
        .select()
        .from(table.invitation)
        .where(eq(table.invitation.email, email));

      expect(invitations).toHaveLength(2);
    });
  });

  describe('Magic link token validation', () => {
    it('should validate fresh, unused token', async () => {
      const adminUser = await testFactories.createUser(db, {
        email: 'admin@example.com',
        role: 'admin'
      });

      const email = 'candidate@example.com';
      const { token } = await createMagicLinkInvitation(db, email, adminUser.id);

      const result = await validateMagicLinkToken(db, token, email);

      expect(result.valid).toBe(true);
      expect(result.invitation).toEqual(
        expect.objectContaining({
          email,
          createdBy: adminUser.id,
          consumedAt: null
        })
      );
    });

    it('should reject invalid token', async () => {
      const result = await validateMagicLinkToken(db, 'invalid-token', 'test@example.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired magic link');
      expect(result.invitation).toBeNull();
    });

    it('should reject expired token', async () => {
      const adminUser = await testFactories.createUser(db, {
        email: 'admin@example.com',
        role: 'admin'
      });

      // Create invitation that expires in the past
      const email = 'candidate@example.com';
      const { token, invitation } = await createMagicLinkInvitation(db, email, adminUser.id);

      // Manually set expiry to past
      await db
        .update(table.invitation)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(table.invitation.id, invitation.id));

      const result = await validateMagicLinkToken(db, token, email);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired magic link');
    });

    it('should reject already consumed token', async () => {
      const adminUser = await testFactories.createUser(db, {
        email: 'admin@example.com',
        role: 'admin'
      });

      const email = 'candidate@example.com';
      const { token, invitation } = await createMagicLinkInvitation(db, email, adminUser.id);

      // Mark as consumed
      await db
        .update(table.invitation)
        .set({ consumedAt: new Date() })
        .where(eq(table.invitation.id, invitation.id));

      const result = await validateMagicLinkToken(db, token, email);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Magic link has already been used');
    });

    it('should consume token on successful validation', async () => {
      const adminUser = await testFactories.createUser(db, {
        email: 'admin@example.com',
        role: 'admin'
      });

      const email = 'candidate@example.com';
      const { token, invitation } = await createMagicLinkInvitation(db, email, adminUser.id);

      const result = await validateMagicLinkToken(db, token, email);
      expect(result.valid).toBe(true);

      // Verify token is now consumed
      const [updated] = await db
        .select()
        .from(table.invitation)
        .where(eq(table.invitation.id, invitation.id));

      expect(updated.consumedAt).toBeInstanceOf(Date);
      expect(updated.consumedAt!.getTime()).toBeCloseTo(Date.now(), -3); // Within 1 second
    });
  });
});
