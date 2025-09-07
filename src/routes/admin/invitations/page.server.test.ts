import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load } from './+page.server';

// Semantic time constants for invitation tests
const THIRTY_MINUTES_MS = 30 * 60 * 1000; // 1800000
const ONE_HOUR_MS = 60 * 60 * 1000; // 3600000

// Type for the expected return value
interface InvitationsLoadResult {
  invitations: Array<{
    id: string;
    email: string;
    tokenHash: Buffer;
    expiresAt: Date;
    consumedAt: Date | null;
    createdBy: string;
    createdAt: Date;
  }>;
}

// Create a simple mock that returns invitation data directly
const createMockDb = (mockInvitations: any) => {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockInvitations)
      })
    })
  };
};

describe('/admin/invitations page server load', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('load function', () => {
    it('should load invitations ordered by creation date', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          email: 'alice@example.com',
          tokenHash: Buffer.from('hash-1'),
          expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
          consumedAt: null,
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'inv-2',
          email: 'bob@example.com',
          tokenHash: Buffer.from('hash-2'),
          expiresAt: new Date(Date.now() + ONE_HOUR_MS),
          consumedAt: new Date('2024-01-02T11:00:00Z'),
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-02T10:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockInvitations);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result).toEqual({
        invitations: mockInvitations
      });

      // Verify database was called correctly
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should handle empty invitations list', async () => {
      const mockInvitations: any[] = [];
      const mockDb = createMockDb(mockInvitations);
      const locals = { db: mockDb };

      const result = await load({ locals } as any);

      expect(result).toEqual({
        invitations: []
      });
    });

    it('should handle invitations with different statuses', async () => {
      const now = new Date();
      const mockInvitations = [
        {
          id: 'inv-pending',
          email: 'pending@example.com',
          tokenHash: Buffer.from('hash-pending'),
          expiresAt: new Date(now.getTime() + THIRTY_MINUTES_MS),
          consumedAt: null,
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'inv-consumed',
          email: 'consumed@example.com',
          tokenHash: Buffer.from('hash-consumed'),
          expiresAt: new Date(now.getTime() + THIRTY_MINUTES_MS),
          consumedAt: new Date('2024-01-01T12:00:00Z'),
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'inv-expired',
          email: 'expired@example.com',
          tokenHash: Buffer.from('hash-expired'),
          expiresAt: new Date(now.getTime() - ONE_HOUR_MS), // Expired
          consumedAt: null,
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-01T08:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockInvitations);
      const locals = { db: mockDb };

      const result = await load({ locals } as any) as InvitationsLoadResult;

      expect(result.invitations).toHaveLength(3);
      
      // Verify pending invitation
      expect(result.invitations[0].consumedAt).toBeNull();
      expect(result.invitations[0].expiresAt.getTime()).toBeGreaterThan(now.getTime());
      
      // Verify consumed invitation
      expect(result.invitations[1].consumedAt).toBeInstanceOf(Date);
      
      // Verify expired invitation
      expect(result.invitations[2].consumedAt).toBeNull();
      expect(result.invitations[2].expiresAt.getTime()).toBeLessThan(now.getTime());
    });

    it('should handle invitations from different admins', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          email: 'candidate1@example.com',
          tokenHash: Buffer.from('hash-1'),
          expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
          consumedAt: null,
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'inv-2',
          email: 'candidate2@example.com',
          tokenHash: Buffer.from('hash-2'),
          expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
          consumedAt: null,
          createdBy: 'admin-2',
          createdAt: new Date('2024-01-02T10:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockInvitations);
      const locals = { db: mockDb };

      const result = await load({ locals } as any) as InvitationsLoadResult;

      expect(result.invitations).toHaveLength(2);
      expect(result.invitations[0].createdBy).toBe('admin-1');
      expect(result.invitations[1].createdBy).toBe('admin-2');
    });

    it('should return data structure correctly', async () => {
      const mockInvitations = [
        {
          id: 'test-inv',
          email: 'test@example.com',
          tokenHash: Buffer.from('test-hash'),
          expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
          consumedAt: null,
          createdBy: 'admin-1',
          createdAt: new Date()
        }
      ];

      const mockDb = createMockDb(mockInvitations);
      const locals = { db: mockDb };

      const result = await load({ locals } as any) as InvitationsLoadResult;

      expect(result).toHaveProperty('invitations');
      expect(Array.isArray(result.invitations)).toBe(true);
      expect(result.invitations[0]).toHaveProperty('id');
      expect(result.invitations[0]).toHaveProperty('email');
      expect(result.invitations[0]).toHaveProperty('tokenHash');
      expect(result.invitations[0]).toHaveProperty('expiresAt');
      expect(result.invitations[0]).toHaveProperty('consumedAt');
      expect(result.invitations[0]).toHaveProperty('createdBy');
      expect(result.invitations[0]).toHaveProperty('createdAt');
    });

    it('should handle invitations with same email from different times', async () => {
      const mockInvitations = [
        {
          id: 'inv-old',
          email: 'candidate@example.com',
          tokenHash: Buffer.from('old-hash'),
          expiresAt: new Date('2024-01-01T10:30:00Z'),
          consumedAt: new Date('2024-01-01T10:15:00Z'),
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'inv-new',
          email: 'candidate@example.com',
          tokenHash: Buffer.from('new-hash'),
          expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
          consumedAt: null,
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-02T10:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockInvitations);
      const locals = { db: mockDb };

      const result = await load({ locals } as any) as InvitationsLoadResult;

      expect(result.invitations).toHaveLength(2);
      expect(result.invitations[0].email).toBe('candidate@example.com');
      expect(result.invitations[1].email).toBe('candidate@example.com');
      expect(result.invitations[0].id).toBe('inv-old');
      expect(result.invitations[1].id).toBe('inv-new');
    });

    it('should preserve creation date ordering', async () => {
      const mockInvitations = [
        {
          id: 'inv-earliest',
          email: 'first@example.com',
          createdAt: new Date('2024-01-01T08:00:00Z')
        },
        {
          id: 'inv-middle',
          email: 'second@example.com',
          createdAt: new Date('2024-01-01T12:00:00Z')
        },
        {
          id: 'inv-latest',
          email: 'third@example.com',
          createdAt: new Date('2024-01-01T16:00:00Z')
        }
      ];

      const mockDb = createMockDb(mockInvitations);
      const locals = { db: mockDb };

      const result = await load({ locals } as any) as InvitationsLoadResult;

      // Verify ordering is preserved as returned by database
      expect(result.invitations[0].id).toBe('inv-earliest');
      expect(result.invitations[1].id).toBe('inv-middle');
      expect(result.invitations[2].id).toBe('inv-latest');
    });
  });
});