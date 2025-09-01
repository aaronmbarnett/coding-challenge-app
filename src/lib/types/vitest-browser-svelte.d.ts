/**
 * Type declarations for vitest-browser-svelte
 * This library is in early development (0.1.0) and lacks complete TypeScript support
 */

declare module 'vitest-browser-svelte' {
  import type { Component } from 'svelte';
  
  export function render(
    component: Component<any>,
    options?: {
      props?: Record<string, any>;
      context?: Map<any, any>;
    }
  ): {
    component: any;
    container: Element;
  };
  
  export function cleanup(): void;
}