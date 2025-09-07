import { describe, it, expect, beforeEach, vi } from 'vitest';
import { actions } from './+page.server';
import { fail, redirect } from '@sveltejs/kit';
import * as magicLink from '$lib/server/auth/magic-link';
import { setSessionUser } from '$lib/server/auth/session';
import * as table from '$lib/server/db/schema';

// Semantic time constants
const THIRTY_MINUTES_MS = 30 * 60 * 1000; // 1800000

// Mock SvelteKit functions
vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    fail: vi.fn((status: number, data: any) => ({ status, data })),
    redirect: vi.fn((status: number, location: string) => {
      const err = new Error(`Redirect to ${location}`) as any;
      err.status = status;
      err.location = location;
      throw err;
    })
  };
});

// Mock magic link module
vi.mock('$lib/server/auth/magic-link', () => ({
  validateMagicLinkToken: vi.fn()
}));

// Mock session module
vi.mock('$lib/server/auth/session', () => ({
  setSessionUser: vi.fn()
}));

// Contract-based database mock
const createMockDb = (existingUser: any = null, userCreationResult: any = null, shouldFailUserCreation: boolean = false) => {
  return {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => {
          return Promise.resolve(existingUser ? [existingUser] : []);
        })
      }))
    })),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockImplementation(() => ({
        returning: vi.fn().mockImplementation(() => {
          if (shouldFailUserCreation) {
            return Promise.reject(new Error('Database constraint violation'));
          }
          return Promise.resolve(userCreationResult ? [userCreationResult] : []);
        })
      }))
    }))
  };
};

describe('/auth/verify form actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('default action', () => {
    it('should verify valid token and create user session for new user', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'candidate@example.com',
        createdBy: 'admin-1',
        expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
        consumedAt: null,
        tokenHash: Buffer.from('mock-hash'),
        createdAt: new Date()
      };

      const mockUser = {
        id: 'user-123',
        email: 'candidate@example.com',
        role: 'candidate' as const,
        createdAt: new Date()
      };

      vi.mocked(magicLink.validateMagicLinkToken).mockResolvedValue({
        valid: true,
        invitation: mockInvitation
      });

      const mockDb = createMockDb(null, mockUser); // No existing user, create new user

      const mockFormData = new FormData();
      mockFormData.set('token', 'valid-token-64chars-long-enough-for-security-requirements');
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const mockHeaders = new Headers();
      const locals = { db: mockDb };

      await expect(
        actions.default({ 
          request: mockRequest, 
          locals, 
          setHeaders: (headers: Record<string, string>) => {
            Object.entries(headers).forEach(([key, value]) => {
              mockHeaders.append(key, value);
            });
          }
        } as any)
      ).rejects.toThrow('Redirect to /candidate');

      expect(magicLink.validateMagicLinkToken).toHaveBeenCalledWith(
        mockDb,
        'valid-token-64chars-long-enough-for-security-requirements',
        'candidate@example.com'
      );

      expect(setSessionUser).toHaveBeenCalledWith(mockHeaders, mockUser);
      expect(redirect).toHaveBeenCalledWith(302, '/candidate');
    });

    it('should authenticate existing user with valid token', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'existing@example.com',
        createdBy: 'admin-1',
        expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
        consumedAt: null,
        tokenHash: Buffer.from('mock-hash'),
        createdAt: new Date()
      };

      const existingUser = {
        id: 'existing-user-123',
        email: 'existing@example.com',
        role: 'candidate' as const,
        createdAt: new Date()
      };

      vi.mocked(magicLink.validateMagicLinkToken).mockResolvedValue({
        valid: true,
        invitation: mockInvitation
      });

      const mockDb = createMockDb(existingUser); // Existing user found

      const mockFormData = new FormData();
      mockFormData.set('token', 'valid-token-64chars-long-enough-for-security-requirements');
      mockFormData.set('email', 'existing@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const mockHeaders = new Headers();
      const locals = { db: mockDb };

      await expect(
        actions.default({ 
          request: mockRequest, 
          locals, 
          setHeaders: (headers: Record<string, string>) => {
            Object.entries(headers).forEach(([key, value]) => {
              mockHeaders.append(key, value);
            });
          }
        } as any)
      ).rejects.toThrow('Redirect to /candidate');

      expect(setSessionUser).toHaveBeenCalledWith(mockHeaders, existingUser);
      expect(mockDb.insert).not.toHaveBeenCalled(); // Should not create new user
    });

    it('should return validation error for missing token', async () => {
      const mockDb = createMockDb();
      
      const mockFormData = new FormData();
      mockFormData.set('email', 'candidate@example.com');
      // No token provided

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Token and email are required' }
      });
      expect(fail).toHaveBeenCalledWith(400, { message: 'Token and email are required' });
      expect(magicLink.validateMagicLinkToken).not.toHaveBeenCalled();
    });

    it('should return validation error for missing email', async () => {
      const mockDb = createMockDb();
      
      const mockFormData = new FormData();
      mockFormData.set('token', 'valid-token-64chars-long-enough-for-security-requirements');
      // No email provided

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Token and email are required' }
      });
      expect(magicLink.validateMagicLinkToken).not.toHaveBeenCalled();
    });

    it('should return error for invalid token', async () => {
      const mockDb = createMockDb();
      
      vi.mocked(magicLink.validateMagicLinkToken).mockResolvedValue({
        valid: false,
        invitation: null,
        error: 'Invalid or expired magic link'
      });

      const mockFormData = new FormData();
      mockFormData.set('token', 'invalid-token');
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Invalid or expired magic link' }
      });
      expect(fail).toHaveBeenCalledWith(400, { message: 'Invalid or expired magic link' });
      expect(setSessionUser).not.toHaveBeenCalled();
    });

    it('should return error for expired token', async () => {
      const mockDb = createMockDb();
      
      vi.mocked(magicLink.validateMagicLinkToken).mockResolvedValue({
        valid: false,
        invitation: null,
        error: 'Invalid or expired magic link'
      });

      const mockFormData = new FormData();
      mockFormData.set('token', 'expired-token-64chars-long-enough-for-security-requirements');
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Invalid or expired magic link' }
      });
    });

    it('should return error for already consumed token', async () => {
      const mockDb = createMockDb();
      
      vi.mocked(magicLink.validateMagicLinkToken).mockResolvedValue({
        valid: false,
        invitation: null,
        error: 'Magic link has already been used'
      });

      const mockFormData = new FormData();
      mockFormData.set('token', 'consumed-token-64chars-long-enough-for-security-requirements');
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Magic link has already been used' }
      });
    });

    it('should handle database errors during user creation', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'candidate@example.com',
        createdBy: 'admin-1',
        expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
        consumedAt: null,
        tokenHash: Buffer.from('mock-hash'),
        createdAt: new Date()
      };

      vi.mocked(magicLink.validateMagicLinkToken).mockResolvedValue({
        valid: true,
        invitation: mockInvitation
      });

      const mockDb = createMockDb(null, null, true); // No existing user, fail user creation

      const mockFormData = new FormData();
      mockFormData.set('token', 'valid-token-64chars-long-enough-for-security-requirements');
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to authenticate user' }
      });
      expect(fail).toHaveBeenCalledWith(500, { message: 'Failed to authenticate user' });
    });

    it('should handle non-Error exceptions gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockDb = createMockDb();

      vi.mocked(magicLink.validateMagicLinkToken).mockRejectedValue({
        code: 'UNKNOWN_ERROR'
      });

      const mockFormData = new FormData();
      mockFormData.set('token', 'valid-token-64chars-long-enough-for-security-requirements');
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb };

      const result = await actions.default({ request: mockRequest, locals } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to authenticate user' }
      });
      expect(consoleSpy).toHaveBeenCalledWith('Authentication error:', { code: 'UNKNOWN_ERROR' });

      consoleSpy.mockRestore();
    });

    it('should handle different redirect destinations based on user role', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'admin@example.com',
        createdBy: 'super-admin',
        expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
        consumedAt: null,
        tokenHash: Buffer.from('mock-hash'),
        createdAt: new Date()
      };

      const adminUser = {
        id: 'admin-user-123',
        email: 'admin@example.com',
        role: 'admin' as const,
        createdAt: new Date()
      };

      vi.mocked(magicLink.validateMagicLinkToken).mockResolvedValue({
        valid: true,
        invitation: mockInvitation
      });

      const mockDb = createMockDb(adminUser); // Existing admin user

      const mockFormData = new FormData();
      mockFormData.set('token', 'valid-token-64chars-long-enough-for-security-requirements');
      mockFormData.set('email', 'admin@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const mockHeaders = new Headers();
      const locals = { db: mockDb };

      await expect(
        actions.default({ 
          request: mockRequest, 
          locals, 
          setHeaders: (headers: Record<string, string>) => {
            Object.entries(headers).forEach(([key, value]) => {
              mockHeaders.append(key, value);
            });
          }
        } as any)
      ).rejects.toThrow('Redirect to /admin');

      expect(redirect).toHaveBeenCalledWith(302, '/admin');
    });
  });
});