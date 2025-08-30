<script lang="ts">
  export let data;
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">Challenges</h1>
    <a
      href="/admin/challenges/new"
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >Create Challenge
    </a>
  </div>

  {#if data.challenges.length === 0}
    <div class="py-12 text-center">
      <p class="text-gray-500">No challenges yet. Create your first one!</p>
    </div>
  {:else}
    <div class="overflow-hidden rounded-lg bg-white shadow">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Language</th
            >
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each data.challenges as challenge}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{challenge.title}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{challenge.languagesCsv}</td>
              <td class="text-sm text-gray-500 px-6 py-4">
                {new Date(challenge.createdAt).toLocaleDateString()}
              </td>
              <td class="space-x-2 px-6 py-4 text-sm">
                <a
                  href="/admin/challenges/{challenge.id}"
                  class="text-blue-600 hover:text-blue-500"
                >
                  View
                </a>
                <a
                  href="/admin/challenges/{challenge.id}/edit"
                  class="text-green-600 hover:text-green-500">Edit</a
                >
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
