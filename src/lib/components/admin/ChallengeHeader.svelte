<script lang="ts">
  export let challenge: any;
  function handleDelete() {
    if (confirm('Are you sure you want to delete this challenge?')) {
      alert('Delete functionality coming soon!');
    }
  }
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
    <button
      class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      on:click={handleDelete}
    >
      Delete
    </button>
  </div>
</div>
