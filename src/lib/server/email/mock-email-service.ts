export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: Date;
  messageId: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId: string;
  error?: string;
}

export class MockEmailService {
  private sentEmails: EmailMessage[] = [];

  async sendMagicLinkEmail(
    to: string,
    token: string,
    magicLinkUrl: string
  ): Promise<EmailSendResult> {
    try {
      // Validate inputs
      if (!to || !this.isValidEmail(to)) {
        return {
          success: false,
          messageId: '',
          error: 'Invalid recipient email address'
        };
      }

      if (!token || token.trim().length < 32) {
        return {
          success: false,
          messageId: '',
          error: 'Invalid or missing token'
        };
      }

      if (!magicLinkUrl) {
        return {
          success: false,
          messageId: '',
          error: 'Invalid magic link URL'
        };
      }

      const messageId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const fullMagicLink = `${magicLinkUrl}?token=${token}&email=${encodeURIComponent(to)}`;

      const email: EmailMessage = {
        to,
        subject: 'Your Coding Challenge Invitation',
        html: this.generateHtmlEmail(fullMagicLink),
        text: this.generateTextEmail(fullMagicLink),
        sentAt: new Date(),
        messageId
      };

      this.sentEmails.push(email);

      // Log to console for development visibility
      console.log(`📧 Mock email sent to ${to}`);
      console.log(`🔗 Magic link: ${fullMagicLink}`);

      return {
        success: true,
        messageId
      };
    } catch (error) {
      console.error('Mock email service error:', error);
      return {
        success: false,
        messageId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getSentEmails(): EmailMessage[] {
    return [...this.sentEmails]; // Return copy to prevent mutations
  }

  getEmailsForRecipient(email: string): EmailMessage[] {
    return this.sentEmails.filter((msg) => msg.to === email);
  }

  getLatestEmailForRecipient(email: string): EmailMessage | null {
    const emails = this.getEmailsForRecipient(email);
    return emails.length > 0 ? emails[emails.length - 1] : null;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }

  getSentEmailCount(): number {
    return this.sentEmails.length;
  }

  wasEmailSentTo(email: string): boolean {
    return this.sentEmails.some((msg) => msg.to === email);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateHtmlEmail(magicLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Coding Challenge Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">You've Been Invited!</h1>
    
    <p>You've been invited to participate in a coding challenge.</p>
    
    <p>Click the button below to get started:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}" 
         style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Start Coding Challenge
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      Or copy and paste this link into your browser:<br>
      <a href="${magicLink}">${magicLink}</a>
    </p>
    
    <p style="font-size: 14px; color: #666;">
      This invitation link will expire in 30 minutes and can only be used once.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999;">
      If you weren't expecting this invitation, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`.trim();
  }

  private generateTextEmail(magicLink: string): string {
    return `
You've Been Invited!

You've been invited to participate in a coding challenge.

Click this link to get started:
${magicLink}

This invitation link will expire in 30 minutes and can only be used once.

If you weren't expecting this invitation, you can safely ignore this email.
`.trim();
  }
}

