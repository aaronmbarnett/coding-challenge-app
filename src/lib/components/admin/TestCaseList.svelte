<script lang="ts">
  import TestCaseItem from './TestCaseItem.svelte';

  export let testCases: any[];
  export let challengeId: string;
</script>

<div class="rounded-lg bg-white shadow">
  {#if testCases.length === 0}
    <div class="p-8 text-center">
      <p class="text-gray-500">No test cases yet. Add some to validate candidate solutions.</p>
    </div>
  {:else}
    <div class="p-6">
      <h2 class="mb-4 text-xl font-semibold">Test Cases ({testCases.length})</h2>

      <div class="space-y-4">
        {#each testCases as testCase, i}
          <TestCaseItem {testCase} index={i} {challengeId} />
        {/each}
      </div>
    </div>
  {/if}
</div>
