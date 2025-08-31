import type { 
  Judge0Config, 
  Judge0ExecutionRequest, 
  Judge0Response, 
  Judge0Language, 
  Judge0Stats,
  HealthCheckInfo
} from './types';
import { LANGUAGE_MAPPINGS } from './config';

/**
 * Docker-ready Judge0 API client with comprehensive error handling
 * Designed to work seamlessly in containerized environments
 */
export class Judge0Client {
  private stats: Judge0Stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    retryCount: 0
  };

  constructor(private config: Judge0Config) {}

  /**
   * Create client from environment variables (Docker-friendly)
   */
  static fromEnvironment(env: Record<string, string | undefined>): Judge0Config {
    if (!env.JUDGE0_URL) {
      throw new Error('JUDGE0_URL environment variable is required');
    }

    return {
      baseUrl: env.JUDGE0_URL,
      authToken: env.JUDGE0_AUTH_TOKEN,
      timeout: env.JUDGE0_TIMEOUT ? parseInt(env.JUDGE0_TIMEOUT, 10) : 10000,
      maxRetries: env.JUDGE0_MAX_RETRIES ? parseInt(env.JUDGE0_MAX_RETRIES, 10) : 3,
      enablePolling: true,
      pollingInterval: env.JUDGE0_POLLING_INTERVAL ? 
        parseInt(env.JUDGE0_POLLING_INTERVAL, 10) : 1000
    };
  }

  /**
   * Health check endpoint for Docker container monitoring
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}/system_info`, {
        method: 'GET',
        signal: controller.signal,
        headers: this.getHeaders()
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get health check information for container orchestration
   */
  getHealthCheckInfo(): HealthCheckInfo {
    return {
      endpoint: '/system_info',
      method: 'GET',
      expectedStatus: 200,
      timeout: this.config.timeout
    };
  }

  /**
   * Get supported languages from Judge0 service
   */
  async getSupportedLanguages(): Promise<Judge0Language[]> {
    const response = await this.makeRequest('GET', '/languages');
    return response.json();
  }

  /**
   * Map language name to Judge0 language ID
   */
  getLanguageId(language: string): number | null {
    const normalizedLang = language.toLowerCase();
    return LANGUAGE_MAPPINGS[normalizedLang as keyof typeof LANGUAGE_MAPPINGS] ?? null;
  }

  /**
   * Submit code for execution
   */
  async submitExecution(request: Judge0ExecutionRequest): Promise<string> {
    const payload = {
      source_code: request.sourceCode,
      language_id: request.languageId,
      stdin: request.stdin,
      expected_output: request.expectedOutput,
      cpu_time_limit: request.cpuTimeLimit,
      memory_limit: request.memoryLimit,
      wall_time_limit: request.wallTimeLimit
    };

    const response = await this.makeRequest(
      'POST',
      '/submissions?base64_encoded=false&wait=false',
      payload
    );

    const result = await response.json();
    return result.token;
  }

  /**
   * Get execution result with automatic polling
   */
  async getExecutionResult(token: string): Promise<Judge0Response> {
    let attempts = 0;
    const maxAttempts = 30; // Maximum polling attempts

    while (attempts < maxAttempts) {
      const response = await this.makeRequest('GET', `/submissions/${token}`);
      const result = await response.json();

      // Check if execution is complete
      const status = result.status.id;
      if (status > 2) { // Status > 2 means completed (success or error)
        return result;
      }

      // Wait before next poll
      if (this.config.enablePolling) {
        await new Promise(resolve => setTimeout(resolve, this.config.pollingInterval));
      }
      
      attempts++;
    }

    // If we get here, execution timed out
    throw new Error(`Execution result polling timed out after ${maxAttempts} attempts`);
  }

  /**
   * Get client statistics for monitoring
   */
  getStats(): Judge0Stats {
    return { ...this.stats };
  }

  /**
   * Reset client statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      retryCount: 0
    };
  }

  /**
   * Make HTTP request with retry logic and statistics tracking
   */
  private async makeRequest(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<Response> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      this.stats.totalRequests++;
      
      if (attempt > 0) {
        this.stats.retryCount++;
        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
          method,
          headers: this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new Error(`Rate limit exceeded. Retry after ${retryAfter || 'unknown'} seconds`);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Update success statistics
        const responseTime = Date.now() - startTime;
        this.updateStats(true, responseTime);

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          break;
        }
      }
    }

    // Update failure statistics
    this.updateStats(false, Date.now() - startTime);

    throw new Error(`Judge0 service unavailable after ${this.config.maxRetries} retries: ${lastError?.message}`);
  }

  /**
   * Get HTTP headers for requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    return headers;
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryableMessages = [
      'Rate limit exceeded',
      'Invalid authentication',
      'Unauthorized',
      'Bad Request'
    ];

    return nonRetryableMessages.some(message => 
      error.message.includes(message)
    );
  }

  /**
   * Update internal statistics
   */
  private updateStats(success: boolean, responseTime: number): void {
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    // Update rolling average response time
    const totalResponses = this.stats.successfulRequests + this.stats.failedRequests;
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (totalResponses - 1) + responseTime) / totalResponses;
  }
}

export type { Judge0Config } from './types';