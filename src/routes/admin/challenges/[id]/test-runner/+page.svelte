<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import ChallengeHeader from '$lib/components/admin/ChallengeHeader.svelte';
  import TestCasesPreview from '$lib/components/admin/TestCasesPreview.svelte';
  
  let { data, form } = $props();
  
  let submitting = $state(false);
  let selectedLanguage = $state('javascript');
  let code = $state('');
  
  // Set default starter code based on language
  $effect(() => {
    if (selectedLanguage === 'javascript') {
      code = data.challenge.starterCode || '// Write your solution here\nfunction solution() {\n  \n}';
    } else if (selectedLanguage === 'python') {
      code = '# Write your solution here\ndef solution():\n    pass';
    }
  });
  
  const supportedLanguages = data.challenge.languagesCsv.split(',').map(lang => lang.trim());
  
  function formatExecutionTime(ms: number): string {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  }
  
  function getStatusIcon(passed: boolean): string {
    return passed ? '✅' : '❌';
  }
  
  function getStatusBadge(passed: boolean): string {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }
</script>

<div class="mx-auto max-w-6xl space-y-6">
  <ChallengeHeader challenge={data.challenge} />
  
  <!-- Navigation breadcrumb -->
  <div class="mb-6">
    <nav class="text-sm text-gray-500">
      <a href="/admin/challenges" class="text-blue-600 hover:text-blue-800">Challenges</a>
      <span class="mx-2">›</span>
      <a href="/admin/challenges/{data.challenge.id}" class="text-blue-600 hover:text-blue-800">{data.challenge.title}</a>
      <span class="mx-2">›</span>
      <span>Test Runner</span>
    </nav>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Challenge Info & Test Cases -->
    <div class="space-y-6">
      <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-semibold">Challenge Description</h2>
        <div class="leading-relaxed whitespace-pre-wrap text-gray-700">
          {@html data.challenge.descriptionMd}
        </div>
      </div>
      
      <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-semibold">Test Cases</h2>
        <TestCasesPreview testCases={data.testCases} challengeId={data.challenge.id} />
      </div>
    </div>

    <!-- Code Editor & Test Runner -->
    <div class="space-y-6">
      <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="mb-6 text-xl font-semibold">Test Your Solution</h2>
          
          <form 
            method="post" 
            action="?/runTest"
            use:enhance={() => {
              submitting = true;
              return async ({ update }) => {
                submitting = false;
                await update();
              };
            }}
          >
            <!-- Language Selection -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2" for="language">
                Language
              </label>
              <select 
                id="language"
                name="language" 
                bind:value={selectedLanguage}
                class="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                {#each supportedLanguages as lang}
                  <option value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                {/each}
              </select>
            </div>

            <!-- Code Editor -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2" for="code">
                Your Code
              </label>
              <textarea 
                id="code"
                name="code" 
                bind:value={code}
                class="w-full h-64 font-mono text-sm rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Write your solution here..."
                required
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end">
              <button 
                type="submit" 
                class="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {#if submitting}
                  <span class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Running Tests...
                {:else}
                  🏃 Run Tests
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Test Results -->
      {#if form}
        <div class="rounded-lg bg-white p-6 shadow">
          <h2 class="mb-4 text-xl font-semibold">Test Results</h2>
            
            {#if form.success && form.executionResult}
              {@const result = form.executionResult}
              
              <!-- Overall Results -->
              <div class="grid grid-cols-3 gap-4 mb-6 bg-gray-50 rounded-lg p-4">
                <div class="text-center">
                  <div class="text-sm text-gray-600">Tests Passed</div>
                  <div class="text-2xl font-bold text-gray-900">{result.passedTests}/{result.totalTests}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600">Score</div>
                  <div class="text-2xl font-bold text-gray-900">{result.score}/{result.maxScore}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600">Total Time</div>
                  <div class="text-lg font-bold text-gray-900">{formatExecutionTime(result.totalExecutionTime)}</div>
                </div>
              </div>

              <!-- Compilation/Service Errors -->
              {#if result.compilationError}
                <div class="mb-4 border-l-4 border-red-400 bg-red-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">Compilation Error</h3>
                      <div class="mt-2 text-xs font-mono text-red-700">{result.compilationError}</div>
                    </div>
                  </div>
                </div>
              {/if}

              {#if result.serviceError}
                <div class="mb-4 border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-yellow-800">Service Issue</h3>
                      <div class="mt-2 text-xs text-yellow-700">{result.serviceError}</div>
                    </div>
                  </div>
                </div>
              {/if}

              {#if result.executionTimeout}
                <div class="mb-4 border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-yellow-800">Execution Timeout</h3>
                      <div class="mt-2 text-xs text-yellow-700">Your code took too long to execute</div>
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Individual Test Results -->
              <div class="space-y-3">
                {#each result.testResults as testResult, index}
                  {@const testCase = data.testCases.find(tc => tc.id === testResult.testCaseId)}
                  
                  <details class="bg-gray-50 rounded-lg border">
                    <summary class="cursor-pointer p-4 hover:bg-gray-100">
                      <div class="flex items-center gap-3">
                        <span class="text-2xl">{getStatusIcon(testResult.passed)}</span>
                        <span class="font-medium">Test Case #{index + 1}</span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadge(testResult.passed)}">
                          {testResult.passed ? 'PASSED' : 'FAILED'}
                        </span>
                        <span class="text-sm text-gray-500">
                          Weight: {testResult.weight} • {formatExecutionTime(testResult.executionTime)}
                        </span>
                        {#if !testCase?.hidden}
                          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Public</span>
                        {:else}
                          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">Hidden</span>
                        {/if}
                      </div>
                    </summary>
                    <div class="border-t bg-white p-4">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {#if testCase && !testCase.hidden}
                          <div>
                            <h4 class="font-semibold mb-2 text-gray-700">Input</h4>
                            <pre class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">{testCase.input || 'No input'}</pre>
                          </div>
                        {/if}
                        <div>
                          <h4 class="font-semibold mb-2 text-gray-700">Expected Output</h4>
                          <pre class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">{testResult.expectedOutput}</pre>
                        </div>
                        <div>
                          <h4 class="font-semibold mb-2 text-gray-700">Your Output</h4>
                          <pre class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">{testResult.actualOutput || '(no output)'}</pre>
                        </div>
                        {#if testResult.error}
                          <div>
                            <h4 class="font-semibold mb-2 text-red-600">Error</h4>
                            <pre class="bg-red-50 border border-red-200 p-3 rounded text-sm font-mono text-red-800 overflow-x-auto">{testResult.error}</pre>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </details>
                {/each}
              </div>
            {:else if form.message}
              <!-- Error Message -->
              <div class="border-l-4 border-red-400 bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-700">{form.message}</p>
                  </div>
                </div>
              </div>
            {/if}
        </div>
      {/if}
    </div>
  </div>