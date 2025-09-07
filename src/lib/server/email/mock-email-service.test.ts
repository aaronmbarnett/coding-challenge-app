import { describe, it, expect, beforeEach } from 'vitest';
import { MockEmailService } from './mock-email-service';

describe('MockEmailService', () => {
  let emailService: MockEmailService;

  beforeEach(() => {
    emailService = new MockEmailService();
  });

  describe('sendMagicLinkEmail', () => {
    it('should successfully send magic link email with valid inputs', async () => {
      const result = await emailService.sendMagicLinkEmail(
        'candidate@example.com',
        'valid-token-64chars-long-enough-for-security-requirements',
        'http://localhost:5173/auth/verify'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^mock-\d+-[a-z0-9]+$/);
      expect(result.error).toBeUndefined();
    });

    it('should store sent email in internal array', async () => {
      await emailService.sendMagicLinkEmail(
        'test@example.com',
        'valid-token-64chars-long-enough-for-security-requirements',
        'http://localhost:5173/auth/verify'
      );

      const sentEmails = emailService.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe('test@example.com');
      expect(sentEmails[0].subject).toBe('Your Coding Challenge Invitation');
      expect(sentEmails[0].sentAt).toBeInstanceOf(Date);
      expect(sentEmails[0].messageId).toMatch(/^mock-/);
    });

    it('should generate HTML email with magic link', async () => {
      await emailService.sendMagicLinkEmail(
        'candidate@example.com',
        'test-token-123-64chars-long-enough-for-security-requirements',
        'http://localhost:5173/auth/verify'
      );

      const sentEmails = emailService.getSentEmails();
      const htmlContent = sentEmails[0].html;

      expect(htmlContent).toContain("You've Been Invited!");
      expect(htmlContent).toContain(
        'http://localhost:5173/auth/verify?token=test-token-123-64chars-long-enough-for-security-requirements&email=candidate%40example.com'
      );
      expect(htmlContent).toContain('Start Coding Challenge');
      expect(htmlContent).toContain('expire in 30 minutes');
    });

    it('should generate text email with magic link', async () => {
      await emailService.sendMagicLinkEmail(
        'candidate@example.com',
        'test-token-456-64chars-long-enough-for-security-requirements',
        'http://localhost:5173/auth/verify'
      );

      const sentEmails = emailService.getSentEmails();
      const textContent = sentEmails[0].text;

      expect(textContent).toContain("You've Been Invited!");
      expect(textContent).toContain(
        'http://localhost:5173/auth/verify?token=test-token-456-64chars-long-enough-for-security-requirements&email=candidate%40example.com'
      );
      expect(textContent).toContain('expire in 30 minutes');
    });

    it('should reject invalid email addresses', async () => {
      const result = await emailService.sendMagicLinkEmail(
        'invalid-email',
        'valid-token-64chars-long-enough-for-security-requirements',
        'http://localhost:5173/auth/verify'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid recipient email address');
      expect(result.messageId).toBe('');
      expect(emailService.getSentEmails()).toHaveLength(0);
    });

    it('should reject empty email addresses', async () => {
      const result = await emailService.sendMagicLinkEmail(
        '',
        'valid-token-64chars-long-enough-for-security-requirements',
        'http://localhost:5173/auth/verify'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid recipient email address');
    });

    it('should reject short tokens', async () => {
      const result = await emailService.sendMagicLinkEmail(
        'candidate@example.com',
        'short',
        'http://localhost:5173/auth/verify'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or missing token');
      expect(emailService.getSentEmails()).toHaveLength(0);
    });

    it('should reject empty tokens', async () => {
      const result = await emailService.sendMagicLinkEmail(
        'candidate@example.com',
        '',
        'http://localhost:5173/auth/verify'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or missing token');
    });

    it('should reject empty magic link URL', async () => {
      const result = await emailService.sendMagicLinkEmail(
        'candidate@example.com',
        'valid-token-64chars-long-enough-for-security-requirements',
        ''
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid magic link URL');
      expect(emailService.getSentEmails()).toHaveLength(0);
    });

    it('should properly URL encode email addresses in magic links', async () => {
      await emailService.sendMagicLinkEmail(
        'test+tag@example.com',
        'test-token-64chars-long-enough-for-security-requirements',
        'http://localhost:5173/auth/verify'
      );

      const sentEmails = emailService.getSentEmails();
      expect(sentEmails[0].html).toContain('test%2Btag%40example.com');
      expect(sentEmails[0].text).toContain('test%2Btag%40example.com');
    });
  });

  describe('email tracking methods', () => {
    beforeEach(async () => {
      // Send some test emails
      await emailService.sendMagicLinkEmail(
        'alice@example.com',
        'token-1-64chars-long-enough-for-security-requirements',
        'http://test.com'
      );
      await emailService.sendMagicLinkEmail(
        'bob@example.com',
        'token-2-64chars-long-enough-for-security-requirements',
        'http://test.com'
      );
      await emailService.sendMagicLinkEmail(
        'alice@example.com',
        'token-3-64chars-long-enough-for-security-requirements',
        'http://test.com'
      );
    });

    it('should return all sent emails', () => {
      const sentEmails = emailService.getSentEmails();
      expect(sentEmails).toHaveLength(3);
      expect(sentEmails[0].to).toBe('alice@example.com');
      expect(sentEmails[1].to).toBe('bob@example.com');
      expect(sentEmails[2].to).toBe('alice@example.com');
    });

    it('should return copy of sent emails to prevent mutations', () => {
      const sentEmails1 = emailService.getSentEmails();
      const sentEmails2 = emailService.getSentEmails();

      expect(sentEmails1).toEqual(sentEmails2);
      expect(sentEmails1).not.toBe(sentEmails2); // Different array instances
    });

    it('should filter emails by recipient', () => {
      const aliceEmails = emailService.getEmailsForRecipient('alice@example.com');
      const bobEmails = emailService.getEmailsForRecipient('bob@example.com');
      const nonExistentEmails = emailService.getEmailsForRecipient('charlie@example.com');

      expect(aliceEmails).toHaveLength(2);
      expect(bobEmails).toHaveLength(1);
      expect(nonExistentEmails).toHaveLength(0);
    });

    it('should return latest email for recipient', () => {
      const latestAliceEmail = emailService.getLatestEmailForRecipient('alice@example.com');
      const latestBobEmail = emailService.getLatestEmailForRecipient('bob@example.com');
      const latestNonExistentEmail = emailService.getLatestEmailForRecipient('charlie@example.com');

      expect(latestAliceEmail?.html).toContain('token-3');
      expect(latestBobEmail?.html).toContain('token-2');
      expect(latestNonExistentEmail).toBeNull();
    });

    it('should return correct sent email count', () => {
      expect(emailService.getSentEmailCount()).toBe(3);
    });

    it('should check if email was sent to recipient', () => {
      expect(emailService.wasEmailSentTo('alice@example.com')).toBe(true);
      expect(emailService.wasEmailSentTo('bob@example.com')).toBe(true);
      expect(emailService.wasEmailSentTo('charlie@example.com')).toBe(false);
    });

    it('should clear all sent emails', () => {
      expect(emailService.getSentEmailCount()).toBe(3);

      emailService.clearSentEmails();

      expect(emailService.getSentEmailCount()).toBe(0);
      expect(emailService.getSentEmails()).toHaveLength(0);
      expect(emailService.wasEmailSentTo('alice@example.com')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle various email format edge cases', async () => {
      const testCases = [
        { email: 'valid@example.com', shouldSucceed: true },
        { email: 'user.name@domain.org', shouldSucceed: true },
        { email: 'user+tag@domain.co.uk', shouldSucceed: true },
        { email: 'plaintext', shouldSucceed: false },
        { email: '@domain.com', shouldSucceed: false },
        { email: 'user@', shouldSucceed: false },
        { email: 'user@domain', shouldSucceed: false },
        { email: '   user@domain.com   ', shouldSucceed: false } // Should not auto-trim
      ];

      for (const { email, shouldSucceed } of testCases) {
        const result = await emailService.sendMagicLinkEmail(
          email,
          'valid-token-64chars-long-enough-for-security-requirements',
          'http://localhost:5173/auth/verify'
        );

        if (shouldSucceed) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
          expect(result.error).toBe('Invalid recipient email address');
        }
      }
    });

    it('should handle token validation edge cases', async () => {
      const testCases = [
        { token: 'valid-token-64chars-long-enough-for-security-requirements', shouldSucceed: true },
        { token: 'exactly-32-chars-long-token12345', shouldSucceed: true },
        { token: '31-chars-long-token-short123', shouldSucceed: false },
        { token: '', shouldSucceed: false },
        { token: '   ', shouldSucceed: false }
      ];

      for (const { token, shouldSucceed } of testCases) {
        const result = await emailService.sendMagicLinkEmail(
          'test@example.com',
          token,
          'http://localhost:5173/auth/verify'
        );

        if (shouldSucceed) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
          expect(result.error).toBe('Invalid or missing token');
        }
      }
    });
  });
});

