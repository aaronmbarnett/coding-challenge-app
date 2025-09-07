/**
 * Type-safe testing utilities for SvelteKit components
 * Eliminates the need for `as any` in tests
 */

import type { RequestEvent } from '@sveltejs/kit';

/**
 * Create a minimal but type-safe event object for testing load functions
 * Returns a partial mock that matches what load functions actually need
 */
export function createMockLoadEvent(overrides: {
  params?: Record<string, string>;
  locals?: { db?: any; user?: any; session?: any };
  url?: URL;
}): any {
  return {
    params: overrides.params || {},
    locals: overrides.locals || { db: {}, user: null, session: null },
    url: overrides.url || new URL('http://localhost'),
    route: { id: null },
    parent: () => Promise.resolve({}),
    depends: () => {},
    untrack: (fn: () => any) => fn(),
    tracing: {},
    platform: undefined,
    cookies: {
      get: () => undefined,
      set: () => {},
      delete: () => {},
      serialize: () => ''
    } as any,
    fetch: global.fetch,
    getClientAddress: () => '127.0.0.1',
    isDataRequest: false,
    isSubRequest: false,
    request: new Request('http://localhost'),
    setHeaders: () => {}
  };
}

/**
 * Create a minimal but type-safe event object for testing actions
 */
export function createMockActionEvent(overrides: {
  params?: Record<string, string>;
  locals?: { db?: any; user?: any; session?: any };
  request?: Request;
}): any {
  const mockRequest =
    overrides.request ||
    new Request('http://localhost', {
      method: 'POST',
      body: new FormData()
    });

  return {
    params: overrides.params || {},
    locals: overrides.locals || { db: {}, user: null, session: null },
    request: mockRequest,
    url: new URL('http://localhost'),
    route: { id: null },
    cookies: {
      get: () => undefined,
      set: () => {},
      delete: () => {},
      serialize: () => ''
    } as any,
    fetch: global.fetch,
    getClientAddress: () => '127.0.0.1',
    isDataRequest: false,
    isSubRequest: false,
    setHeaders: () => {},
    platform: undefined
  };
}

/**
 * Create a mock request with FormData for testing
 */
export function createMockRequest(
  formData: FormData,
  options?: {
    method?: string;
    url?: string;
  }
): Request {
  const baseRequest = new Request(options?.url || 'http://localhost', {
    method: options?.method || 'POST',
    body: formData
  });

  // Override formData method to return our mock data
  Object.defineProperty(baseRequest, 'formData', {
    value: () => Promise.resolve(formData),
    writable: false
  });

  return baseRequest;
}

/**
 * Create a mock FormData with the given entries
 */
export function createMockFormData(entries: Record<string, string | File>): FormData {
  const formData = new FormData();
  Object.entries(entries).forEach(([key, value]) => {
    formData.set(key, value);
  });
  return formData;
}
