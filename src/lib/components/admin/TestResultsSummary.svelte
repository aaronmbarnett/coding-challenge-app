<script lang="ts">
  interface ExecutionResult {
    passedTests: number;
    totalTests: number;
    score: number;
    maxScore: number;
    totalExecutionTime: number;
  }

  interface Props {
    executionResult: ExecutionResult;
  }

  let { executionResult }: Props = $props();

  function formatExecutionTime(ms: number): string {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  }
</script>

<!-- Overall Results -->
<div class="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
  <div class="text-center">
    <div class="text-sm text-gray-600">Tests Passed</div>
    <div class="text-2xl font-bold text-gray-900">
      {executionResult.passedTests}/{executionResult.totalTests}
    </div>
  </div>
  <div class="text-center">
    <div class="text-sm text-gray-600">Score</div>
    <div class="text-2xl font-bold text-gray-900">
      {executionResult.score}/{executionResult.maxScore}
    </div>
  </div>
  <div class="text-center">
    <div class="text-sm text-gray-600">Total Time</div>
    <div class="text-lg font-bold text-gray-900">
      {formatExecutionTime(executionResult.totalExecutionTime)}
    </div>
  </div>
</div>
