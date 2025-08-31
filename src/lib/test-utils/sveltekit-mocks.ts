/**
 * Type-safe testing utilities for SvelteKit components
 * Eliminates the need for `as any` in tests
 */

import type { RequestEvent } from '@sveltejs/kit';

/**
 * Create a minimal but type-safe event object for testing load functions
 */
export function createMockLoadEvent(overrides: {
  params?: Record<string, string>;
  locals?: { db?: any; user?: any };
  url?: URL;
}): Pick<RequestEvent, 'params' | 'locals' | 'url'> {
  return {
    params: overrides.params || {},
    locals: overrides.locals || { db: {}, user: null },
    url: overrides.url || new URL('http://localhost')
  };
}

/**
 * Create a minimal but type-safe event object for testing actions
 */
export function createMockActionEvent(overrides: {
  params?: Record<string, string>;
  locals?: { db?: any; user?: any };
  request?: Request;
}): Pick<RequestEvent, 'params' | 'locals' | 'request'> {
  const mockRequest = overrides.request || new Request('http://localhost', {
    method: 'POST',
    body: new FormData()
  });

  return {
    params: overrides.params || {},
    locals: overrides.locals || { db: {}, user: null },
    request: mockRequest
  };
}

/**
 * Create a mock request with FormData for testing
 */
export function createMockRequest(formData: FormData, options?: {
  method?: string;
  url?: string;
}): Request {
  return {
    formData: () => Promise.resolve(formData),
    method: options?.method || 'POST',
    url: options?.url || 'http://localhost'
  } as Request;
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