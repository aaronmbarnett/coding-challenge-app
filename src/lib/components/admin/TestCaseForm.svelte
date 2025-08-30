<script lang="ts">
  import { enhance } from '$app/forms';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';

  export let challengeId: string;
  export let form: any = null;
  export let onCancel: () => void;
  let testKind: 'io' | 'harness' = 'io';
</script>

<div class="rounded-lg bg-white p-6 shadow">
  <h2 class="mb-4 text-xl font-semibold">Add New Test Case</h2>

  <form method="POST" action="?/create" use:enhance class="space-y-4">
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700">Test Type</label>
      <div class="flex space-x-4">
        <label class="flex items-center">
          <input type="radio" bind:group={testKind} value="io" name="kind" class="mr-2" />
          Input/Output
        </label>
        <label class="flex items-center">
          <input type="radio" bind:group={testKind} value="harness" name="kind" class="mr-2" />
          Test Harness
        </label>
      </div>
    </div>

    {#if testKind === 'io'}
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="input" class="mb-1 block text-sm font-medium text-gray-700"> Input </label>
          <textarea
            id="input"
            name="input"
            rows="4"
            required
            class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="[1, 2, 3]"
          ></textarea>
        </div>

        <div>
          <label for="expectedOutput" class="mb-1 block text-sm font-medium text-gray-700">
            Expected Output
          </label>
          <textarea
            id="expectedOutput"
            name="expectedOutput"
            rows="4"
            required
            class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="6"
          ></textarea>
        </div>
      </div>
    {:else}
      <div>
        <label for="harnessCode" class="mb-1 block text-sm font-medium text-gray-700">
          Test Harness Code
        </label>
        <textarea
          id="harnessCode"
          name="harnessCode"
          rows="6"
          required
          class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
          placeholder="assert solution([1,2,3]) == 6"
        ></textarea>
      </div>
    {/if}

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="weight" class="mb-1 block text-sm font-medium text-gray-700"> Weight </label>
        <input
          type="number"
          id="weight"
          name="weight"
          min="1"
          value="1"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="flex items-center">
        <input type="checkbox" id="hidden" name="hidden" class="mr-2" />
        <label for="hidden" class="text-sm font-medium text-gray-700">
          Hidden from candidates
        </label>
      </div>
    </div>

    <ErrorMessage message={form?.message} />

    <div class="flex space-x-4">
      <button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Add Test Case
      </button>
      <button
        type="button"
        on:click={onCancel}
        class="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  </form>
</div>
