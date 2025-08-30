<script>
  import { enhance } from '$app/forms';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  let { form } = $props();
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
    <FormField
      label="Challenge Title"
      name="title"
      placeholder="e.g., Two Sum Problem"
      required
    />

    <FormField
      label="Description (Markdown)"
      name="description"
      type="textarea"
      rows={10}
      placeholder="## Problem Description&#10;&#10;Write a function that..."
      required
    />

    <FormField
      label="Supported Languages (comma-separated)"
      name="languages"
      placeholder="javascript,python,java"
      required
    />

    <FormField
      label="Starter Code (optional)"
      name="starterCode"
      type="textarea"
      rows={6}
      placeholder="TODO: REPLACE THIS PLACE HOLDER"
    />

    <FormField
      label="Time Limit (seconds, optional)"
      name="timeLimit"
      type="number"
      placeholder="1800"
    />

    <ErrorMessage message={form?.message} />

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
