import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Judge0Client, type Judge0Config } from './judge0-client';
import { createId } from '@paralleldrive/cuid2';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Judge0 Client', () => {
  let client: Judge0Client;
  let mockConfig: Judge0Config;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    mockConfig = {
      baseUrl: 'http://localhost:2358',
      authToken: 'test-auth-token',
      timeout: 5000,
      maxRetries: 3,
      enablePolling: true,
      pollingInterval: 1000
    };
    
    client = new Judge0Client(mockConfig);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Configuration-driven setup', () => {
    it('should create client with local Docker config', () => {
      const localConfig: Judge0Config = {
        baseUrl: 'http://localhost:2358',
        timeout: 5000,
        maxRetries: 3,
        enablePolling: true,
        pollingInterval: 1000
      };
      
      const localClient = new Judge0Client(localConfig);
      expect(localClient).toBeInstanceOf(Judge0Client);
    });

    it('should create client with cloud service config', () => {
      const cloudConfig: Judge0Config = {
        baseUrl: 'https://judge0-ce.p.rapidapi.com',
        authToken: 'rapidapi-key-12345',
        timeout: 10000,
        maxRetries: 5,
        enablePolling: true,
        pollingInterval: 2000
      };
      
      const cloudClient = new Judge0Client(cloudConfig);
      expect(cloudClient).toBeInstanceOf(Judge0Client);
    });

    it('should handle minimal configuration', () => {
      const minimalConfig: Judge0Config = {
        baseUrl: 'http://judge0:2358', // Docker service name
        timeout: 5000,
        maxRetries: 3,
        enablePolling: true,
        pollingInterval: 1000
      };
      
      const minimalClient = new Judge0Client(minimalConfig);
      expect(minimalClient).toBeInstanceOf(Judge0Client);
    });
  });

  describe('Health checking for containerization', () => {
    it('should check service health successfully', async () => {
      // Mock successful health check response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response);

      const isHealthy = await client.checkHealth();
      
      expect(isHealthy).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:2358/system_info',
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('should handle service unavailable gracefully', async () => {
      // Mock service unavailable
      vi.mocked(fetch).mockRejectedValue(new Error('ECONNREFUSED'));

      const isHealthy = await client.checkHealth();
      
      expect(isHealthy).toBe(false);
    });

    it('should handle timeout during health check', async () => {
      // Mock timeout
      vi.mocked(fetch).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 100)
        )
      );

      const healthPromise = client.checkHealth();
      
      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const isHealthy = await healthPromise;
      
      expect(isHealthy).toBe(false);
    });
  });

  describe('Language support and configuration', () => {
    it('should get supported languages from service', async () => {
      const mockLanguages = [
        { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
        { id: 71, name: 'Python (3.8.1)' },
        { id: 62, name: 'Java (OpenJDK 13.0.1)' }
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLanguages)
      } as Response);

      const languages = await client.getSupportedLanguages();
      
      expect(languages).toEqual(mockLanguages);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:2358/languages',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-auth-token'
          })
        })
      );
    });

    it('should map language names to Judge0 IDs', () => {
      expect(client.getLanguageId('javascript')).toBe(63);
      expect(client.getLanguageId('python')).toBe(71);
      expect(client.getLanguageId('java')).toBe(62);
      expect(client.getLanguageId('unsupported')).toBeNull();
    });
  });

  describe('Code execution', () => {
    it('should submit code for execution', async () => {
      const mockToken = createId();
      
      // Mock submission response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      } as Response);

      const token = await client.submitExecution({
        sourceCode: 'console.log("Hello World");',
        languageId: 63,
        stdin: '',
        expectedOutput: 'Hello World\n',
        cpuTimeLimit: 2,
        memoryLimit: 128000,
        wallTimeLimit: 5
      });
      
      expect(token).toBe(mockToken);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:2358/submissions?base64_encoded=false&wait=false',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-auth-token'
          }),
          body: JSON.stringify({
            source_code: 'console.log("Hello World");',
            language_id: 63,
            stdin: '',
            expected_output: 'Hello World\n',
            cpu_time_limit: 2,
            memory_limit: 128000,
            wall_time_limit: 5
          })
        })
      );
    });

    it('should poll for execution results', async () => {
      const mockToken = 'test-execution-token';
      const mockResult = {
        token: mockToken,
        status: { id: 3, description: 'Accepted' },
        stdout: 'Hello World\n',
        stderr: null,
        compile_output: null,
        message: null,
        time: '0.001',
        memory: 15360
      };

      // Mock polling responses - first in queue, then completed
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            ...mockResult,
            status: { id: 2, description: 'Processing' }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResult)
        } as Response);

      const resultPromise = client.getExecutionResult(mockToken);
      
      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const result = await resultPromise;
      
      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle execution timeout', async () => {
      const mockToken = 'timeout-test-token';
      
      // Mock timeout response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          status: { id: 5, description: 'Time Limit Exceeded' },
          stdout: null,
          stderr: null,
          time: '2.0',
          memory: 0
        })
      } as Response);

      const result = await client.getExecutionResult(mockToken);
      
      expect(result.status.description).toBe('Time Limit Exceeded');
    });

    it('should handle compilation errors', async () => {
      const mockToken = 'compile-error-token';
      
      // Mock compilation error response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          status: { id: 6, description: 'Compilation Error' },
          stdout: null,
          stderr: null,
          compile_output: 'SyntaxError: Unexpected token',
          message: null,
          time: null,
          memory: null
        })
      } as Response);

      const result = await client.getExecutionResult(mockToken);
      
      expect(result.status.description).toBe('Compilation Error');
      expect(result.compile_output).toContain('SyntaxError');
    });
  });

  describe('Retry mechanism and error handling', () => {
    it('should retry on network failures', async () => {
      const mockSubmission = {
        sourceCode: 'print("test")',
        languageId: 71,
        stdin: '',
        expectedOutput: 'test\n',
        cpuTimeLimit: 2,
        memoryLimit: 128000,
        wallTimeLimit: 5
      };

      // Mock network failures then success
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'retry-success-token' })
        } as Response);

      const tokenPromise = client.submitExecution(mockSubmission);
      
      // Run all pending timers
      await vi.runAllTimersAsync();
      
      const token = await tokenPromise;
      
      expect(token).toBe('retry-success-token');
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries exceeded', async () => {
      const mockSubmission = {
        sourceCode: 'print("test")',
        languageId: 71,
        stdin: '',
        expectedOutput: 'test\n',
        cpuTimeLimit: 2,
        memoryLimit: 128000,
        wallTimeLimit: 5
      };

      // Mock continuous failures
      vi.mocked(fetch).mockRejectedValue(new Error('Persistent network error'));

      // Use Promise.allSettled to ensure all promises are handled
      const [submitResult] = await Promise.allSettled([
        client.submitExecution(mockSubmission),
        vi.runAllTimersAsync()
      ]);

      expect(submitResult.status).toBe('rejected');
      if (submitResult.status === 'rejected') {
        expect(submitResult.reason.message).toContain('Judge0 service unavailable after 3 retries');
      }
      
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle rate limiting gracefully', async () => {
      // Mock rate limit response
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'Retry-After': '60' })
      } as Response);

      await expect(client.submitExecution({
        sourceCode: 'test',
        languageId: 63,
        stdin: '',
        expectedOutput: '',
        cpuTimeLimit: 2,
        memoryLimit: 128000,
        wallTimeLimit: 5
      })).rejects.toThrow('Rate limit exceeded. Retry after 60 seconds');
    });
  });

  describe('Docker-specific functionality', () => {
    it('should work with Docker service names in URLs', () => {
      const dockerConfig: Judge0Config = {
        baseUrl: 'http://judge0:2358', // Docker Compose service name
        timeout: 5000,
        maxRetries: 3,
        enablePolling: true,
        pollingInterval: 1000
      };
      
      const dockerClient = new Judge0Client(dockerConfig);
      expect(dockerClient).toBeInstanceOf(Judge0Client);
    });

    it('should provide container health check endpoint info', () => {
      const healthInfo = client.getHealthCheckInfo();
      
      expect(healthInfo).toEqual({
        endpoint: '/system_info',
        method: 'GET',
        expectedStatus: 200,
        timeout: 5000
      });
    });

    it('should handle Docker network connection issues', async () => {
      // Mock Docker network connection failure
      vi.mocked(fetch).mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND judge0'
      });

      const isHealthy = await client.checkHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe('Environment-based configuration', () => {
    it('should create client from environment variables', () => {
      const envConfig = Judge0Client.fromEnvironment({
        JUDGE0_URL: 'http://judge0:2358',
        JUDGE0_AUTH_TOKEN: 'env-token-123',
        JUDGE0_TIMEOUT: '8000',
        JUDGE0_MAX_RETRIES: '5'
      });
      
      expect(envConfig).toEqual({
        baseUrl: 'http://judge0:2358',
        authToken: 'env-token-123',
        timeout: 8000,
        maxRetries: 5,
        enablePolling: true,
        pollingInterval: 1000 // default
      });
    });

    it('should use defaults for missing environment variables', () => {
      const envConfig = Judge0Client.fromEnvironment({
        JUDGE0_URL: 'http://localhost:2358'
        // Missing other env vars
      });
      
      expect(envConfig).toEqual({
        baseUrl: 'http://localhost:2358',
        authToken: undefined,
        timeout: 10000, // default
        maxRetries: 3, // default
        enablePolling: true,
        pollingInterval: 1000
      });
    });

    it('should validate required environment variables', () => {
      expect(() => {
        Judge0Client.fromEnvironment({
          // Missing JUDGE0_URL
          JUDGE0_AUTH_TOKEN: 'token'
        });
      }).toThrow('JUDGE0_URL environment variable is required');
    });
  });

  describe('Performance and monitoring', () => {
    it('should track execution metrics', async () => {
      const mockToken = 'metrics-test-token';
      const startTime = Date.now();
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          status: { id: 3, description: 'Accepted' },
          stdout: 'result',
          time: '0.045',
          memory: 15360
        })
      } as Response);

      const result = await client.getExecutionResult(mockToken);
      
      expect(result.time).toBe('0.045');
      expect(result.memory).toBe(15360);
    });

    it('should provide client statistics', () => {
      const stats = client.getStats();
      
      expect(stats).toEqual({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        retryCount: 0
      });
    });
  });
});