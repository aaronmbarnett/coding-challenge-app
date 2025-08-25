// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      db: typeof import('$lib/server/db').db;
      user: { id: string; role: 'admin' | 'candidate' } | null;
      // user: import('$lib/server/auth').SessionValidationResult['user'];
      session: import('$lib/server/auth').SessionValidationResult['session'];
    }
  } // interface Error {}
  // interface Locals {}
} // interface PageData {}
// interface PageState {}

// interface Platform {}
export {};
