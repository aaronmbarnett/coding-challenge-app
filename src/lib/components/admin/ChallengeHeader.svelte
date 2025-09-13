<script lang="ts">
  import type { Challenge } from '$lib/server/db/schema';
  import { enhance } from '$app/forms';

  let { challenge }: { challenge: Challenge } = $props();
  let showDeleteConfirm = $state(false);
</script>

<div class="flex items-center justify-between">
  <div class="flex items-center space-x-4">
    <a href="/admin/challenges" class="text-blue-600 hover:text-blue-500"> ← Back to Challenges </a>
    <h1 class="text-3xl font-bold">{challenge.title}</h1>
  </div>

  <div class="flex space-x-3">
    <a
      href="/admin/challenges/{challenge.id}/edit"
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Edit Challenge
    </a>

    {#if showDeleteConfirm}
      <div class="flex items-center space-x-2 rounded bg-red-50 p-2">
        <span class="text-sm text-red-800">Are you sure?</span>
        <form method="POST" action="?/delete" use:enhance>
          <button
            type="submit"
            class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Yes, Delete
          </button>
        </form>
        <button
          class="rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400"
          onclick={() => (showDeleteConfirm = false)}
        >
          Cancel
        </button>
      </div>
    {:else}
      <button
        class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        onclick={() => (showDeleteConfirm = true)}
      >
        Delete
      </button>
    {/if}
  </div>
</div>
