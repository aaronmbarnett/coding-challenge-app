<script lang="ts">
  import { enhance } from '$app/forms';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';

  let { 
    challengeId, 
    form = null, 
    onCancel 
  }: { 
    challengeId: string; 
    form?: any; 
    onCancel: () => void; 
  } = $props();

  let testKind = $state<'io' | 'harness'>('io');
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
        <FormField
          label="Input"
          name="input"
          type="textarea"
          rows={4}
          placeholder="[1, 2, 3]"
          required
        />

        <FormField
          label="Expected Output"
          name="expectedOutput"
          type="textarea"
          rows={4}
          placeholder="6"
          required
        />
      </div>
    {:else}
      <FormField
        label="Test Harness Code"
        name="harnessCode"
        type="textarea"
        rows={6}
        placeholder="assert solution([1,2,3]) == 6"
        required
      />
    {/if}

    <div class="grid grid-cols-2 gap-4">
      <FormField
        label="Weight"
        name="weight"
        type="number"
        value="1"
      />

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
