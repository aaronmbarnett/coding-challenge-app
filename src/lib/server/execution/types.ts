/**
 * Represents a code submission from a candidate
 */
export interface CodeSubmission {
  /** ID of the attempt this submission belongs to */
  attemptId: string;
  
  /** The source code to execute */
  code: string;
  
  /** Programming language of the code */
  language: string;
}

/**
 * Result of executing a single test case
 */
export interface TestCaseResult {
  /** ID of the test case that was executed */
  testCaseId: string;
  
  /** Whether the test case passed */
  passed: boolean;
  
  /** Expected output from test case */
  expectedOutput: string;
  
  /** Actual output from code execution */
  actualOutput: string;
  
  /** Execution time in milliseconds */
  executionTime: number;
  
  /** Weight/points for this test case */
  weight: number;
  
  /** Error message if execution failed */
  error?: string;
}

/**
 * Complete result of executing code against all test cases
 */
export interface ExecutionResult {
  /** ID of the created submission record */
  submissionId: string;
  
  /** Total number of test cases */
  totalTests: number;
  
  /** Number of test cases that passed */
  passedTests: number;
  
  /** Results for each individual test case */
  testResults: TestCaseResult[];
  
  /** Weighted score achieved (sum of passed test weights) */
  score: number;
  
  /** Maximum possible weighted score */
  maxScore: number;
  
  /** Total execution time across all tests */
  totalExecutionTime: number;
  
  /** Compilation error message if code failed to compile */
  compilationError?: string;
  
  /** Whether execution timed out */
  executionTimeout?: boolean;
  
  /** Service error if execution system is unavailable */
  serviceError?: string;
}

/**
 * Configuration for code execution
 */
export interface ExecutionConfig {
  /** Maximum execution time per test case in seconds */
  timeLimit: number;
  
  /** Maximum memory usage in MB */
  memoryLimit: number;
  
  /** CPU time limit in seconds */
  cpuTimeLimit: number;
}

/**
 * Judge0 API response structure
 */
export interface Judge0Response {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
}

/**
 * Judge0 submission payload
 */
export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
  cpu_time_limit: number;
  memory_limit: number;
  wall_time_limit: number;
}

/**
 * Language mappings for Judge0 API
 */
export interface LanguageMapping {
  name: string;
  judge0Id: number;
  fileExtension: string;
}

/**
 * Execution statistics for monitoring
 */
export interface ExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  timeouts: number;
  errors: number;
}