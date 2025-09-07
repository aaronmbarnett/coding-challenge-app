import type { Judge0Config } from './types';

/**
 * Environment variable configuration for Judge0 client
 * Designed to work seamlessly with Docker Compose and container orchestration
 */
export interface Judge0Environment {
  JUDGE0_URL?: string;
  JUDGE0_AUTH_TOKEN?: string;
  JUDGE0_TIMEOUT?: string;
  JUDGE0_MAX_RETRIES?: string;
  JUDGE0_POLLING_INTERVAL?: string;
}

/**
 * Default configuration values optimized for Docker deployment
 */
export const JUDGE0_DEFAULTS = {
  timeout: 10000, // 10 seconds - longer for containerized environments
  maxRetries: 3,
  enablePolling: true,
  pollingInterval: 1000, // 1 second

  // Docker-specific defaults
  dockerServiceUrl: 'http://judge0:2358', // Docker Compose service name
  localDevUrl: 'http://localhost:2358',
  cloudUrl: 'https://judge0-ce.p.rapidapi.com'
} as const;

/**
 * Language ID mappings for Judge0 API
 * These are stable across Judge0 versions and deployments
 */
export const LANGUAGE_MAPPINGS = {
  javascript: 63, // JavaScript (Node.js)
  python: 71, // Python (3.8.1)
  java: 62, // Java (OpenJDK 13.0.1)
  cpp: 54, // C++ (GCC 9.2.0)
  c: 50, // C (GCC 9.2.0)
  go: 60, // Go (1.13.5)
  rust: 73, // Rust (1.40.0)
  typescript: 74 // TypeScript (3.7.4)
} as const;

/**
 * Create Judge0 configuration from environment variables
 * Supports both Docker and cloud deployments
 */
export function createConfigFromEnvironment(
  env: Judge0Environment = process.env as Judge0Environment
): Judge0Config {
  // Validate required environment variables
  if (!env.JUDGE0_URL) {
    throw new Error('JUDGE0_URL environment variable is required');
  }

  return {
    baseUrl: env.JUDGE0_URL,
    authToken: env.JUDGE0_AUTH_TOKEN,
    timeout: env.JUDGE0_TIMEOUT ? parseInt(env.JUDGE0_TIMEOUT, 10) : JUDGE0_DEFAULTS.timeout,
    maxRetries: env.JUDGE0_MAX_RETRIES
      ? parseInt(env.JUDGE0_MAX_RETRIES, 10)
      : JUDGE0_DEFAULTS.maxRetries,
    enablePolling: JUDGE0_DEFAULTS.enablePolling,
    pollingInterval: env.JUDGE0_POLLING_INTERVAL
      ? parseInt(env.JUDGE0_POLLING_INTERVAL, 10)
      : JUDGE0_DEFAULTS.pollingInterval
  };
}

/**
 * Create development configuration for local Docker setup
 */
export function createDockerDevConfig(authToken?: string): Judge0Config {
  return {
    baseUrl: JUDGE0_DEFAULTS.dockerServiceUrl,
    authToken,
    timeout: JUDGE0_DEFAULTS.timeout,
    maxRetries: JUDGE0_DEFAULTS.maxRetries,
    enablePolling: JUDGE0_DEFAULTS.enablePolling,
    pollingInterval: JUDGE0_DEFAULTS.pollingInterval
  };
}

/**
 * Create configuration for local development (Judge0 running on localhost)
 */
export function createLocalDevConfig(authToken?: string): Judge0Config {
  return {
    baseUrl: JUDGE0_DEFAULTS.localDevUrl,
    authToken,
    timeout: JUDGE0_DEFAULTS.timeout,
    maxRetries: JUDGE0_DEFAULTS.maxRetries,
    enablePolling: JUDGE0_DEFAULTS.enablePolling,
    pollingInterval: JUDGE0_DEFAULTS.pollingInterval
  };
}

/**
 * Create configuration for cloud Judge0 service
 */
export function createCloudConfig(authToken: string): Judge0Config {
  if (!authToken) {
    throw new Error('Auth token is required for cloud Judge0 service');
  }

  return {
    baseUrl: JUDGE0_DEFAULTS.cloudUrl,
    authToken,
    timeout: 15000, // Longer timeout for cloud service
    maxRetries: 5, // More retries for network reliability
    enablePolling: JUDGE0_DEFAULTS.enablePolling,
    pollingInterval: 2000 // Longer polling interval for cloud
  };
}

/**
 * Detect deployment environment and create appropriate configuration
 */
export function createAutoConfig(
  env: Judge0Environment = process.env as Judge0Environment
): Judge0Config {
  // If explicit URL provided, use environment config
  if (env.JUDGE0_URL) {
    return createConfigFromEnvironment(env);
  }

  // Auto-detect based on environment indicators
  if (process.env.NODE_ENV === 'production') {
    // Production likely uses cloud service
    const authToken = env.JUDGE0_AUTH_TOKEN;
    if (!authToken) {
      throw new Error('JUDGE0_AUTH_TOKEN required for production deployment');
    }
    return createCloudConfig(authToken);
  }

  // Development - try Docker first, fall back to localhost
  return createDockerDevConfig(env.JUDGE0_AUTH_TOKEN);
}

/**
 * Validate Judge0 configuration for common issues
 */
export function validateConfig(config: Judge0Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate base URL
  if (!config.baseUrl) {
    errors.push('baseUrl is required');
  } else {
    try {
      new URL(config.baseUrl);
    } catch {
      errors.push('baseUrl must be a valid URL');
    }
  }

  // Validate numeric values
  if (config.timeout <= 0) {
    errors.push('timeout must be positive');
  }

  if (config.maxRetries < 0) {
    errors.push('maxRetries cannot be negative');
  }

  if (config.pollingInterval <= 0) {
    errors.push('pollingInterval must be positive');
  }

  // Validate cloud service requirements
  if (config.baseUrl.includes('rapidapi.com') && !config.authToken) {
    errors.push('authToken is required for RapidAPI cloud service');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get language ID for supported programming languages
 */
export function getLanguageId(language: string): number | null {
  const normalizedLang = language.toLowerCase();
  return LANGUAGE_MAPPINGS[normalizedLang as keyof typeof LANGUAGE_MAPPINGS] ?? null;
}

/**
 * Get supported language names
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_MAPPINGS);
}
