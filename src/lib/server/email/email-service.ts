import { dev } from '$app/environment';
import { MockEmailService } from './mock-email-service';
import type { EmailSendResult } from './mock-email-service';

// Environment-based email service factory
function createEmailService() {
  if (dev) {
    return new MockEmailService();
  } else {
    // In production, we'd use a real email service
    // For now, keep using mock until we're ready for real email
    return new MockEmailService();
  }
}

export const emailService = createEmailService();

export type { EmailSendResult };
