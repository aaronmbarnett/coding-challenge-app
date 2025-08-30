<script lang="ts">
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  let { data } = $props();

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  function formatDateTime(timestamp: number | Date) {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    return date.toLocaleString();
  }
</script>

<div class="space-y-6">
  <!-- header -->
  <div class="flex items-center justify-between">
    <div>
      <nav class="mb-4">
        <a href="/admin" class="text-blue-600 hover:text-blue-500">← Back to Dashboard</a>
      </nav>
      <h1 class="text-3xl font-bold">Exam Sessions</h1>
    </div>
    <a
      href="/admin/sessions/new"
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Create Session
    </a>
  </div>

  <!-- stats -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <StatCard title="Total Sessions" value={data.sessions.length} />
    <StatCard title="Available Challenges" value={data.stats.totalChallenges} />
    <StatCard title="Total Candidates" value={data.stats.totalCandidates} />
  </div>

  <!-- sessions list -->
  <div class="overflow-hidden rounded-lg bg-white shadow">
    {#if data.sessions.length === 0}
      <div class="py-12 text-center">
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
                <StatusBadge status={session.status} type="session" />
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
