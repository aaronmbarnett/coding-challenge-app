<script lang="ts">
  import { enhance } from '$app/forms';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import type { TestCase } from '$lib/server/db/schema';
  
  let { 
    testCase, 
    index, 
    challengeId 
  }: { 
    testCase: TestCase; 
    index: number; 
    challengeId: string; 
  } = $props();

  function confirmDelete() {
    return confirm('Delete this test case?');
  }
</script>

<div class="rounded-lg border p-4">
  <div class="mb-3 flex items-start justify-between">
    <div class="flex items-center space-x-3">
      <span class="font-medium">Test Case #{index + 1}</span>
      <StatusBadge status={testCase.kind} type="testcase" />
      <span class="text-sm text-gray-500">Weight: {testCase.weight}</span>
      {#if testCase.hidden}
        <span
          class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
        >
          Hidden
        </span>
      {/if}
    </div>

    <form method="POST" action="?/delete" use:enhance class="inline">
      <input type="hidden" name="testId" value={testCase.id} />
      <input type="hidden" name="challengeId" value={challengeId} />
      <button
        type="submit"
        class="text-sm text-red-600 hover:text-red-800"
        on:click={confirmDelete}
      >
        Delete
      </button>
    </form>
  </div>

  {#if testCase.kind === 'io'}
    <div class="grid grid-cols-2 gap-4">
      <div>
        <h4 class="mb-1 text-sm font-medium text-gray-700">Input:</h4>
        <pre class="overflow-x-auto rounded bg-gray-50 p-2 text-sm"><code>{testCase.input}</code
          ></pre>
      </div>
      <div>
        <h4 class="mb-1 text-sm font-medium text-gray-700">Expected Output:</h4>
        <pre class="overflow-x-auto rounded bg-gray-50 p-2 text-sm"><code
            >{testCase.expectedOutput}</code
          ></pre>
      </div>
    </div>
  {:else}
    <div>
      <h4 class="mb-1 text-sm font-medium text-gray-700">Test Harness:</h4>
      <pre class="overflow-x-auto rounded bg-gray-50 p-2 text-sm"><code>{testCase.harnessCode}</code
        ></pre>
    </div>
  {/if}
</div>
