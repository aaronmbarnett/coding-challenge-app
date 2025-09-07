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

describe('/admin/invitations email integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful email sending', () => {
    it('should create invitation and send email successfully', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'candidate@example.com',
        createdBy: 'admin-1',
        expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
        consumedAt: null,
        tokenHash: Buffer.from('mock-hash'),
        createdAt: new Date()
      };

      const mockToken = 'secure-token-64chars-long-enough-for-security-requirements';

      vi.mocked(magicLink.createMagicLinkInvitation).mockResolvedValue({
        token: mockToken,
        invitation: mockInvitation
      });

      vi.mocked(emailService.emailService.sendMagicLinkEmail).mockResolvedValue({
        success: true,
        messageId: 'mock-message-123'
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

      const result = await actions.default({ 
        request: mockRequest, 
        locals,
        url: mockUrl
      } as any);

      // Verify invitation was created
      expect(magicLink.createMagicLinkInvitation).toHaveBeenCalledWith(
        mockDb,
        'candidate@example.com',
        'admin-1'
      );

      // Verify email was sent with correct parameters
      expect(emailService.emailService.sendMagicLinkEmail).toHaveBeenCalledWith(
        'candidate@example.com',
        mockToken,
        'http://localhost:5173/auth/verify'
      );

      // Verify successful response includes email info
      expect(result).toEqual({
        success: true,
        invitation: mockInvitation,
        emailSent: true,
        emailMessageId: 'mock-message-123',
        message: 'Magic link invitation sent successfully'
      });
    });

    it('should handle different base URLs correctly', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'test@example.com',
        createdBy: 'admin-1',
        expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
        consumedAt: null,
        tokenHash: Buffer.from('mock-hash'),
        createdAt: new Date()
      };

      vi.mocked(magicLink.createMagicLinkInvitation).mockResolvedValue({
        token: 'test-token-64chars-long-enough-for-security-requirements',
        invitation: mockInvitation
      });

      vi.mocked(emailService.emailService.sendMagicLinkEmail).mockResolvedValue({
        success: true,
        messageId: 'mock-msg-456'
      });

      const mockFormData = new FormData();
      mockFormData.set('email', 'test@example.com');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { 
        db: mockDb, 
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
      };

      // Test with production-like URL
      const mockUrl = new URL('https://mycompany.com/admin/invitations');

      await actions.default({ 
        request: mockRequest, 
        locals,
        url: mockUrl
      } as any);

      expect(emailService.emailService.sendMagicLinkEmail).toHaveBeenCalledWith(
        'test@example.com',
        'test-token-64chars-long-enough-for-security-requirements',
        'https://mycompany.com/auth/verify'
      );
    });
  });

  describe('email sending failures', () => {
    it('should handle email service failures gracefully', async () => {
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
        token: 'test-token-64chars-long-enough-for-security-requirements',
        invitation: mockInvitation
      });

      vi.mocked(emailService.emailService.sendMagicLinkEmail).mockResolvedValue({
        success: false,
        messageId: '',
        error: 'SMTP connection failed'
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

      const result = await actions.default({ 
        request: mockRequest, 
        locals,
        url: mockUrl
      } as any);

      // Should still create invitation but report email failure
      expect(result).toEqual({
        success: false,
        invitation: mockInvitation,
        emailSent: false,
        emailError: 'SMTP connection failed',
        message: 'Invitation created but failed to send email: SMTP connection failed'
      });
    });

    it('should handle email service exceptions', async () => {
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
        token: 'test-token-64chars-long-enough-for-security-requirements',
        invitation: mockInvitation
      });

      vi.mocked(emailService.emailService.sendMagicLinkEmail).mockRejectedValue(
        new Error('Email service unavailable')
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

      const result = await actions.default({ 
        request: mockRequest, 
        locals,
        url: mockUrl
      } as any);

      expect(result).toEqual({
        success: false,
        invitation: mockInvitation,
        emailSent: false,
        emailError: 'Email service unavailable',
        message: 'Invitation created but failed to send email: Email service unavailable'
      });
    });

    it('should not create invitation if email validation fails at service level', async () => {
      vi.mocked(emailService.emailService.sendMagicLinkEmail).mockResolvedValue({
        success: false,
        messageId: '',
        error: 'Invalid recipient email address'
      });

      const mockFormData = new FormData();
      mockFormData.set('email', 'invalid@domain');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      };

      const locals = { 
        db: mockDb, 
        user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
      };

      const mockUrl = new URL('http://localhost:5173/admin/invitations');

      const result = await actions.default({ 
        request: mockRequest, 
        locals,
        url: mockUrl
      } as any);

      // Should not create invitation for truly invalid emails
      expect(magicLink.createMagicLinkInvitation).not.toHaveBeenCalled();
      expect(result.status).toBe(400);
      expect(result.data.message).toBe('Invalid email format');
    });
  });

  describe('URL construction', () => {
    it('should construct verify URL from request origin', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'test@example.com',
        createdBy: 'admin-1',
        expiresAt: new Date(Date.now() + THIRTY_MINUTES_MS),
        consumedAt: null,
        tokenHash: Buffer.from('mock-hash'),
        createdAt: new Date()
      };

      vi.mocked(magicLink.createMagicLinkInvitation).mockResolvedValue({
        token: 'token-64chars-long-enough-for-security-requirements',
        invitation: mockInvitation
      });

      vi.mocked(emailService.emailService.sendMagicLinkEmail).mockResolvedValue({
        success: true,
        messageId: 'mock-123'
      });

      const testCases = [
        { 
          inputUrl: 'http://localhost:5173/admin/invitations',
          expectedVerifyUrl: 'http://localhost:5173/auth/verify'
        },
        { 
          inputUrl: 'https://staging.company.com/admin/invitations',
          expectedVerifyUrl: 'https://staging.company.com/auth/verify'
        },
        { 
          inputUrl: 'https://company.com:8080/admin/invitations',
          expectedVerifyUrl: 'https://company.com:8080/auth/verify'
        }
      ];

      for (const { inputUrl, expectedVerifyUrl } of testCases) {
        vi.clearAllMocks();

        const mockFormData = new FormData();
        mockFormData.set('email', 'test@example.com');

        const mockRequest = {
          formData: vi.fn().mockResolvedValue(mockFormData)
        };

        const locals = { 
          db: mockDb, 
          user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const } 
        };

        await actions.default({ 
          request: mockRequest, 
          locals,
          url: new URL(inputUrl)
        } as any);

        expect(emailService.emailService.sendMagicLinkEmail).toHaveBeenCalledWith(
          'test@example.com',
          'token-64chars-long-enough-for-security-requirements',
          expectedVerifyUrl
        );
      }
    });
  });
});