<script lang="ts">
  export let testCases: any[];
  export let challengeId: string;
</script>

{#if testCases.length === 0}
  <p class="py-4 text-center text-gray-500">
    No test cases yet. <a
      href="/admin/challenges/{challengeId}/tests"
      class="text-blue-600 hover:text-blue-500">Add some</a
    > to validate solutions.
  </p>
{:else}
  <div class="space-y-3">
    {#each testCases as testCase, i}
      <div class="rounded border p-3">
        <div class="flex items-center justify-between">
          <span class="font-medium">Test Case {i + 1}</span>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500 capitalize">{testCase.kind}</span>
            <span class="text-xs text-gray-500">Weight: {testCase.weight}</span>
            {#if testCase.hidden}
              <span
                class="inline-flex items-center rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800"
              >
                Hidden
              </span>
            {/if}
          </div>
        </div>
        {#if testCase.kind === 'io'}
          <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Input:</span>
              <code class="mt-1 block rounded bg-gray-50 p-2 text-xs">{testCase.input}</code>
            </div>
            <div>
              <span class="font-medium">Expected:</span>
              <code class="mt-1 block rounded bg-gray-50 p-2 text-xs"
                >{testCase.expectedOutput}</code
              >
            </div>
          </div>
        {:else}
          <div class="mt-2 text-sm">
            <span class="font-medium">Harness:</span>
            <code class="mt-1 block rounded bg-gray-50 p-2 text-xs">{testCase.harnessCode}</code>
          </div>
        {/if}
      </div>
    {/each}

    <!-- Summary and link -->
    <div class="mt-4 border-t pt-3">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>{testCases.length} test case{testCases.length === 1 ? '' : 's'} total</span>
        <a href="/admin/challenges/{challengeId}/tests" class="text-blue-600 hover:text-blue-500">
          Manage all test cases →
        </a>
      </div>
    </div>
  </div>
{/if}
