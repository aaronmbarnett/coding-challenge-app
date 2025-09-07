import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validateMagicLinkToken } from '$lib/server/auth/magic-link';
import { setSessionUser } from '$lib/server/auth/session';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
  default: async ({ request, locals, setHeaders }) => {
    try {
      const formData = await request.formData();
      const token = (formData.get('token') as string)?.trim();
      const email = (formData.get('email') as string)?.trim();

      // Validate required fields
      if (!token || !email) {
        return fail(400, { message: 'Token and email are required' });
      }

      // Validate magic link token
      const validation = await validateMagicLinkToken(locals.db, token, email);

      if (!validation.valid) {
        return fail(400, { message: validation.error || 'Invalid magic link' });
      }

      // Check if user already exists
      const [existingUser] = await locals.db
        .select()
        .from(table.user)
        .where(eq(table.user.email, email));

      let user = existingUser;

      // Create user if doesn't exist
      if (!user) {
        const [newUser] = await locals.db
          .insert(table.user)
          .values({
            email,
            role: 'candidate'
          })
          .returning();

        user = newUser;
      }

      // Set user session
      const headers = new Headers();
      setSessionUser(headers, user);

      // Apply headers to response
      if (setHeaders) {
        const headerEntries: Record<string, string> = {};
        headers.forEach((value, key) => {
          headerEntries[key] = value;
        });
        setHeaders(headerEntries);
      }

      // Redirect based on user role
      const redirectPath = user.role === 'admin' ? '/admin' : '/candidate';
      throw redirect(302, redirectPath);
    } catch (error: unknown) {
      if (error instanceof Error && 'status' in error) {
        // Re-throw redirect errors
        throw error;
      }

      if (error instanceof Error) {
        return fail(500, { message: 'Failed to authenticate user' });
      }

      console.error('Authentication error:', error);
      return fail(500, { message: 'Failed to authenticate user' });
    }
  }
};
