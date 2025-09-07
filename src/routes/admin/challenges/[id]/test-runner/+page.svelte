<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import ChallengeHeader from '$lib/components/admin/ChallengeHeader.svelte';
  import TestCasesPreview from '$lib/components/admin/TestCasesPreview.svelte';
  import CodeEditor from '$lib/components/admin/CodeEditor.svelte';
  import ErrorDisplay from '$lib/components/admin/ErrorDisplay.svelte';
  import TestResultsSummary from '$lib/components/admin/TestResultsSummary.svelte';

  let { data, form } = $props();

  let submitting = $state(false);
  let selectedLanguage = $state('javascript');
  let code = $state('');

  const supportedLanguages = data.challenge.languagesCsv.split(',').map((lang) => lang.trim());

  // Set default starter code based on language
  function getDefaultCode(language: string): string {
    if (language === 'javascript') {
      return (
        data.challenge.starterCode || '// Write your solution here\nfunction solution() {\n  \n}'
      );
    } else if (language === 'python') {
      return '# Write your solution here\ndef solution():\n    pass';
    }
    return '// Write your solution here';
  }

  function handleLanguageChange(language: string) {
    selectedLanguage = language;
    code = getDefaultCode(language);
  }

  // Initialize with default code
  $effect(() => {
    code = getDefaultCode(selectedLanguage);
  });

  // Helper functions for remaining inline code
  function getStatusIcon(passed: boolean): string {
    return passed ? '✅' : '❌';
  }

  function getStatusBadge(passed: boolean): string {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  function formatExecutionTime(ms: number): string {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  }
</script>

<div class="mx-auto max-w-6xl space-y-6">
  <ChallengeHeader challenge={data.challenge} />

  <!-- Navigation breadcrumb -->
  <div class="mb-6">
    <nav class="text-sm text-gray-500">
      <a href="/admin/challenges" class="text-blue-600 hover:text-blue-800">Challenges</a>
      <span class="mx-2">›</span>
      <a href="/admin/challenges/{data.challenge.id}" class="text-blue-600 hover:text-blue-800"
        >{data.challenge.title}</a
      >
      <span class="mx-2">›</span>
      <span>Test Runner</span>
    </nav>
  </div>

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
      <CodeEditor
        {supportedLanguages}
        defaultCode={code}
        bind:selectedLanguage
        bind:submitting
        onLanguageChange={handleLanguageChange}
      />
    </div>

    <!-- Test Results -->
    {#if form}
      <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-semibold">Test Results</h2>

        {#if form.success && form.executionResult}
          {@const result = form.executionResult}

          <!-- Overall Results -->
          <TestResultsSummary executionResult={result} />

          <!-- Error Messages -->
          {#if result.compilationError}
            <ErrorDisplay type="compilation" error={result.compilationError} />
          {/if}

          {#if result.serviceError}
            <ErrorDisplay type="service" error={result.serviceError} />
          {/if}

          {#if result.executionTimeout}
            <ErrorDisplay type="timeout" error="" />
          {/if}

          <!-- Individual Test Results -->
          <div class="space-y-3">
            {#each result.testResults as testResult, index}
              {@const testCase = data.testCases.find((tc) => tc.id === testResult.testCaseId)}

              <details class="rounded-lg border bg-gray-50">
                <summary class="cursor-pointer p-4 hover:bg-gray-100">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{getStatusIcon(testResult.passed)}</span>
                    <span class="font-medium">Test Case #{index + 1}</span>
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadge(
                        testResult.passed
                      )}"
                    >
                      {testResult.passed ? 'PASSED' : 'FAILED'}
                    </span>
                    <span class="text-sm text-gray-500">
                      Weight: {testResult.weight} • {formatExecutionTime(testResult.executionTime)}
                    </span>
                    {#if !testCase?.hidden}
                      <span
                        class="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                        >Public</span
                      >
                    {:else}
                      <span
                        class="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                        >Hidden</span
                      >
                    {/if}
                  </div>
                </summary>
                <div class="border-t bg-white p-4">
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {#if testCase && !testCase.hidden}
                      <div>
                        <h4 class="mb-2 font-semibold text-gray-700">Input</h4>
                        <pre
                          class="overflow-x-auto rounded bg-gray-100 p-3 font-mono text-sm">{testCase.input ||
                            'No input'}</pre>
                      </div>
                    {/if}
                    <div>
                      <h4 class="mb-2 font-semibold text-gray-700">Expected Output</h4>
                      <pre
                        class="overflow-x-auto rounded bg-gray-100 p-3 font-mono text-sm">{testResult.expectedOutput}</pre>
                    </div>
                    <div>
                      <h4 class="mb-2 font-semibold text-gray-700">Your Output</h4>
                      <pre
                        class="overflow-x-auto rounded bg-gray-100 p-3 font-mono text-sm">{testResult.actualOutput ||
                          '(no output)'}</pre>
                    </div>
                    {#if testResult.error}
                      <div>
                        <h4 class="mb-2 font-semibold text-red-600">Error</h4>
                        <pre
                          class="overflow-x-auto rounded border border-red-200 bg-red-50 p-3 font-mono text-sm text-red-800">{testResult.error}</pre>
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
                <svg
                  class="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
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
