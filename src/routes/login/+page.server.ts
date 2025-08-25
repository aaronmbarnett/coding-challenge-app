import { setDevSession } from '$lib/server/auth/session';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
  default: async (event: RequestEvent) => {
    const { request } = event;
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    console.log('form submiision:', { email, password });

    if (!email || !password) {
      console.log('Missing email or passowrd');
      return fail(400, { message: 'Email and password required' });
    }

    if (email === 'admin@example.com' && password === 'admin123') {
      setDevSession(event, {
        id: 'dev-admin-id',
        email: 'admin@example.com',
        role: 'admin'
      });
      throw redirect(302, '/admin');
    }
    return fail(400, { message: 'Invalid credentials' });
  }
};
