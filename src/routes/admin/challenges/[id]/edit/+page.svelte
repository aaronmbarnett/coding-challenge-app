<script lang="ts">
  import { enhance } from '$app/forms';
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
    <div>
      <label for="title" class="mb-1 block text-sm font-medium text-gray-700">
        Challenge Title
      </label>
      <input
        type="text"
        id="title"
        name="title"
        required
        value={data.challenge.title}
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label for="description" class="mb-1 block text-sm font-medium text-gray-700">
        Description (Markdown)
      </label>
      <textarea
        id="description"
        name="description"
        rows="10"
        required
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >{data.challenge.descriptionMd}</textarea
      >
    </div>

    <div>
      <label for="languages" class="mb-1 block text-sm font-medium text-gray-700">
        Supported Languages (comma-separated)
      </label>
      <input
        type="text"
        id="languages"
        name="languages"
        required
        value={data.challenge.languagesCsv}
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label for="starterCode" class="mb-1 block text-sm font-medium text-gray-700">
        Starter Code (optional)
      </label>
      <textarea
        id="starterCode"
        name="starterCode"
        rows="6"
        class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >{data.challenge.starterCode || ''}</textarea
      >
    </div>

    <div>
      <label for="timeLimit" class="mb-1 block text-sm font-medium text-gray-700">
        Time Limit (seconds, optional)
      </label>
      <input
        type="number"
        id="timeLimit"
        name="timeLimit"
        min="60"
        max="7200"
        value={data.challenge.timeLimitSec || ''}
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    {#if form?.message}
      <div class="rounded-md border border-red-200 bg-red-50 p-3">
        <p class="text-red-700">{form.message}</p>
      </div>
    {/if}

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
