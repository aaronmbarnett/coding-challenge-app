import { describe, it, expect, beforeEach, vi } from 'vitest';
import { actions } from './+page.server';
import { fail } from '@sveltejs/kit';
import * as magicLink from '$lib/server/auth/magic-link';
import * as emailService from '$lib/server/email/email-service';

// Semantic time constants
const THIRTY_MINUTES_MS = 30 * 60 * 1000; // 1800000

// Mock SvelteKit functions
vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    fail: vi.fn((status: number, data: any) => ({ status, data }))
  };
});

// Mock magic link module
vi.mock('$lib/server/auth/magic-link', () => ({
  createMagicLinkInvitation: vi.fn()
}));

// Mock email service
vi.mock('$lib/server/email/email-service', () => ({
  emailService: {
    sendMagicLinkEmail: vi.fn()
  }
}));

const mockDb = {};

describe('/admin/invitations form actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('default action', () => {
    it('should create magic link invitation with valid email', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'candidate@example.com',
        createdBy: 'admin-1',
        expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
        consumedAt: null,
        tokenHash: Buffer.from('mock-hash'),
        createdAt: new Date()
      };

      vi.mocked(magicLink.createMagicLinkInvitation).mockResolvedValue({
        token: 'mock-token-64chars',
        invitation: mockInvitation
      });

      vi.mocked(emailService.emailService.sendMagicLinkEmail).mockResolvedValue({
        success: true,
        messageId: 'mock-email-123'
      });

      const mockFormData = new FormData();
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { 
        db: mockDb, 
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
      };

      const mockUrl = new URL('http://localhost:5173/admin/invitations');
      const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);

      expect(magicLink.createMagicLinkInvitation).toHaveBeenCalledWith(
        mockDb,
        'candidate@example.com',
        'admin-1'
      );

      expect(result).toEqual({
        success: true,
        invitation: mockInvitation,
        emailSent: true,
        emailMessageId: 'mock-email-123',
        message: 'Magic link invitation sent successfully'
      });
    });

    it('should return validation error for missing email', async () => {
      const mockFormData = new FormData();
      // No email provided

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { 
        db: mockDb, 
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
      };

      const mockUrl = new URL('http://localhost:5173/admin/invitations');
      const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Email is required' }
      });
      expect(fail).toHaveBeenCalledWith(400, { message: 'Email is required' });
      expect(magicLink.createMagicLinkInvitation).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid email format', async () => {
      const mockFormData = new FormData();
      mockFormData.set('email', 'invalid-email');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { 
        db: mockDb, 
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
      };

      const mockUrl = new URL('http://localhost:5173/admin/invitations');
      const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);

      expect(result).toEqual({
        status: 400,
        data: { message: 'Invalid email format' }
      });
      expect(fail).toHaveBeenCalledWith(400, { message: 'Invalid email format' });
      expect(magicLink.createMagicLinkInvitation).not.toHaveBeenCalled();
    });

    it('should return unauthorized error without admin user', async () => {
      const mockFormData = new FormData();
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { db: mockDb, user: null };

      const mockUrl = new URL('http://localhost:5173/admin/invitations');
      const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);

      expect(result).toEqual({
        status: 401,
        data: { message: 'Unauthorized' }
      });
      expect(fail).toHaveBeenCalledWith(401, { message: 'Unauthorized' });
      expect(magicLink.createMagicLinkInvitation).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(magicLink.createMagicLinkInvitation).mockRejectedValue(
        new Error('Database connection failed')
      );

      const mockFormData = new FormData();
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { 
        db: mockDb, 
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
      };

      const mockUrl = new URL('http://localhost:5173/admin/invitations');
      const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to create invitation' }
      });
      expect(fail).toHaveBeenCalledWith(500, { message: 'Failed to create invitation' });
    });

    it('should handle console.error for non-Error exceptions', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(magicLink.createMagicLinkInvitation).mockRejectedValue({
        code: 'UNKNOWN_ERROR'
      });

      const mockFormData = new FormData();
      mockFormData.set('email', 'candidate@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { 
        db: mockDb, 
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
      };

      const mockUrl = new URL('http://localhost:5173/admin/invitations');
      const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to create invitation' }
      });
      expect(consoleSpy).toHaveBeenCalledWith('Database error:', { code: 'UNKNOWN_ERROR' });

      consoleSpy.mockRestore();
    });

    it('should handle form data parsing errors', async () => {
      const mockRequest = {
        formData: vi.fn().mockRejectedValue(new Error('Invalid multipart data'))
      };

      const locals = { 
        db: mockDb, 
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
      };

      const mockUrl = new URL('http://localhost:5173/admin/invitations');
      const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);

      expect(result).toEqual({
        status: 500,
        data: { message: 'Failed to create invitation' }
      });
      expect(magicLink.createMagicLinkInvitation).not.toHaveBeenCalled();
    });

    it('should validate different email formats correctly', async () => {
      const testCases = [
        { email: 'test@example.com', valid: true },
        { email: 'user.name@company.org', valid: true },
        { email: 'user+tag@domain.co.uk', valid: true },
        { email: 'plaintext', valid: false },
        { email: '@domain.com', valid: false },
        { email: 'user@', valid: false },
        { email: '', valid: false },
        { email: ' test@example.com ', valid: true }, // Should trim whitespace
      ];

      for (const { email, valid } of testCases) {
        vi.clearAllMocks();

        const mockFormData = new FormData();
        mockFormData.set('email', email);

        const mockRequest = {
          formData: vi.fn().mockResolvedValue(mockFormData)
        };

        const locals = { 
          db: mockDb, 
          user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
        };

        if (valid) {
          vi.mocked(magicLink.createMagicLinkInvitation).mockResolvedValue({
            token: 'mock-token',
            invitation: {
              id: 'inv-123',
              email: email.trim(),
              createdBy: 'admin-1',
              expiresAt: new Date(),
              consumedAt: null,
              tokenHash: Buffer.from('hash'),
              createdAt: new Date()
            }
          });

          vi.mocked(emailService.emailService.sendMagicLinkEmail).mockResolvedValue({
            success: true,
            messageId: 'mock-email-success'
          });

          const mockUrl = new URL('http://localhost:5173/admin/invitations');
          const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);
          expect(result.success).toBe(true);
        } else {
          const mockUrl = new URL('http://localhost:5173/admin/invitations');
          const result = await actions.default({ request: mockRequest, locals, url: mockUrl } as any);
          expect(result.status).toBe(400);
          expect(result.data.message).toMatch(/required|Invalid email format/);
        }
      }
    });
  });
});