<script>
  import { enhance } from '$app/forms';
  export let form;
  function handleSubmit() {
    console.log('Form submit triggered');
  }
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div class="flex items-center space-x-4">
    <a href="/admin/challenges" class="text-blue-600 hover:text-blue-500">← Back to Challenges</a>
    <h1 class="text-3xl font-bold">Create New Challenge</h1>
  </div>

  <form method="POST" use:enhance class="space-y-6" on:submit={handleSubmit}>
    <div>
      <label for="title" class="mb-1 block text-sm font-medium text-gray-700">
        Challenge Title
      </label>
      <input
        type="text"
        id="title"
        name="title"
        required
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="e.g., Two Sum Problem"
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
        placeholder="## Problem Description

  Write a function that..."
      ></textarea>
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
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="javascript,python,java"
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
        placeholder="TODO: REPLACE THIS PLACE HOLDER"
      ></textarea>
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
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="1800"
      />
    </div>

    {#if form?.message}
      <div class="rounded-md border border-red-200 bg-red-50 p-3">
        <p class="text-red-700">{form.message}</p>
      </div>
    {/if}

    <div class="flex space-x-4">
      <button
        type="submit"
        class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        Create Challenge
      </button>
      <a
        href="/admin/challenges"
        class="rounded-md bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
      >
        Cancel
      </a>
    </div>
  </form>
</div>
