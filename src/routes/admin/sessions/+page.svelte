<script lang="ts">
  export let data;

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  function formatDateTime(timestamp: number | Date) {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    return date.toLocaleString();
  }
  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="space-y-6">
  <!-- header -->
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">Exam Sessions</h1>
    <a
      href="/admin/sessions/new"
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Create Session
    </a>
  </div>

  <!-- stats -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <div class="rounded-lg bg-white p-6 shadow">
      <h3 class="text-sm font-medium text-gray-500">Total Sessions</h3>
      <p class="text-2xl font-bold text-gray-900">{data.sessions.length}</p>
    </div>

    <div class="rounded-lg bg-white p-6 shadow">
      <h3 class="text-sm font-medium text-gray-500">Available Challenges</h3>
      <p class="text-2xl font-bold text-gray-900">{data.stats.totalChallenges}</p>
    </div>

    <div class="rounded-lg bg-white p-6 shadow">
      <h3 class="text-sm font-medium text-gray-500">Total Sessions</h3>
      <p class="text-2xl font-bold text-gray-900">{data.stats.totalCandidates}</p>
    </div>
  </div>

  <!-- sessions list -->
  <div class="overflow-hidden rounded-lg bg-white shadow">
    {#if data.sessions.length === 0}
      <div class="py12 text-center">
        <p class="mb-4 text-gray-500">No exam sessions yet.</p>
        <a href="/admin/sessions/new" class="text-blue-600 hover:text-blue-500">
          Create your first session
        </a>
      </div>
    {:else}
      <!-- else content here -->
      <table class="min-w-full">
        <thead class="bg-gray-50"></thead>
        <tbody class="divide-y divide-gray-200">
          {#each data.sessions as sessionData}
            {@const session = sessionData.session}
            {@const candidate = sessionData.candidate}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">
                  {candidate?.email || 'Unknown Candidate'}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {formatDuration(session.totalDurationSec)}
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
                    session.status
                  )}"
                >
                  {session.status}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {#if session.startedAt}
                  {formatDateTime(session.startedAt)}
                {:else}
                  Not started
                {/if}
              </td>
              <td class="space-x-2 px-6 py-4 text-sm">
                <a href="/admin/sessions/{session.id}" class="text-blue-600 hover:text-blue-500">
                  View
                </a>
                <a
                  href="/admin/sessions/{session.id}/edit"
                  class="text-green-600 hover:text-green-500"
                >
                  Edit
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
