<script lang="ts">
  import { enhance } from '$app/forms';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  export let data;
  export let form;

  let showDeleteConfirm = false;
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div class="flex items-center space-x-4">
    <a href="/admin/challenges/{data.challenge.id}" class="text-blue-600 hover:text-blue-500">
      ← Back to Challenge
    </a>
    <h1 class="text-3xl font-bold">Edit Challenge</h1>
  </div>

  <form method="POST" action="?/update" use:enhance class="space-y-6">
    <FormField
      label="Challenge Title"
      name="title"
      value={data.challenge.title}
      required
    />

    <FormField
      label="Description (Markdown)"
      name="description"
      type="textarea"
      rows={10}
      value={data.challenge.descriptionMd}
      required
    />

    <FormField
      label="Supported Languages (comma-separated)"
      name="languages"
      value={data.challenge.languagesCsv}
      required
    />

    <FormField
      label="Starter Code (optional)"
      name="starterCode"
      type="textarea"
      rows={6}
      value={data.challenge.starterCode || ''}
    />

    <FormField
      label="Time Limit (seconds, optional)"
      name="timeLimit"
      type="number"
      value={data.challenge.timeLimitSec || ''}
    />

    <ErrorMessage message={form?.message} />

    <div class="flex justify-between">
      <div class="flex space-x-4">
        <button
          type="submit"
          class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Update Challenge
        </button>
        <a
          href="/admin/challenges/{data.challenge.id}"
          class="rounded-md bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
        >
          Cancel
        </a>
      </div>

      <!-- Delete Section -->
      <div>
        {#if !showDeleteConfirm}
          <button
            type="button"
            on:click={() => (showDeleteConfirm = true)}
            class="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete Challenge
          </button>
        {:else}
          <div class="flex space-x-2">
            <span class="py-2 text-sm text-red-600">Are you sure?</span>
            <form method="POST" action="?/delete" use:enhance class="inline">
              <button
                type="submit"
                class="rounded bg-red-700 px-3 py-1 text-sm text-white hover:bg-red-800"
              >
                Yes, Delete
              </button>
            </form>
            <button
              type="button"
              on:click={() => (showDeleteConfirm = false)}
              class="rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        {/if}
      </div>
    </div>
  </form>
</div>
