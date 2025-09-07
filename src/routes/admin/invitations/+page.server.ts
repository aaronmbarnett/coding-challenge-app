import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { createMagicLinkInvitation } from '$lib/server/auth/magic-link';
import { emailService } from '$lib/server/email/email-service';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  // Load existing invitations for display
  const invitations = await locals.db
    .select()
    .from(table.invitation)
    .orderBy(table.invitation.createdAt);

  return {
    invitations
  };
};

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    try {
      // Check authorization
      if (!locals.user) {
        return fail(401, { message: 'Unauthorized' });
      }

      const formData = await request.formData();
      const email = (formData.get('email') as string)?.trim();

      // Validate email
      if (!email) {
        return fail(400, { message: 'Email is required' });
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return fail(400, { message: 'Invalid email format' });
      }

      // Create magic link invitation
      const { token, invitation } = await createMagicLinkInvitation(
        locals.db,
        email,
        locals.user.id
      );

      // Construct verification URL from request origin
      const verifyUrl = `${url.protocol}//${url.host}/auth/verify`;

      // Send magic link email
      try {
        const emailResult = await emailService.sendMagicLinkEmail(
          email,
          token,
          verifyUrl
        );

        if (emailResult.success) {
          return {
            success: true,
            invitation,
            emailSent: true,
            emailMessageId: emailResult.messageId,
            message: 'Magic link invitation sent successfully'
          };
        } else {
          return {
            success: false,
            invitation,
            emailSent: false,
            emailError: emailResult.error,
            message: `Invitation created but failed to send email: ${emailResult.error}`
          };
        }
      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown email error';
        return {
          success: false,
          invitation,
          emailSent: false,
          emailError: errorMessage,
          message: `Invitation created but failed to send email: ${errorMessage}`
        };
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        return fail(500, { message: 'Failed to create invitation' });
      }
      console.error('Database error:', error);
      return fail(500, { message: 'Failed to create invitation' });
    }
  }
};