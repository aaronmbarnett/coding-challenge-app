<script lang="ts">
  export let challengeTitle: string;
  export let challengeId: string;
  export let showForm: boolean;
  export let onToggleForm: () => void;
</script>

<div class="flex items-center justify-between">
  <div class="flex items-center space-x-4">
    <a href="/admin/challenges/{challengeId}" class="text-blue-600 hover:text-blue-500">
      ← Back to Challenge
    </a>
    <h1 class="text-3xl font-bold">Test Cases: {challengeTitle}</h1>
  </div>

  <button
    on:click={onToggleForm}
    class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
  >
    {showForm ? 'Cancel' : '+ Add Test Case'}
  </button>
</div>
