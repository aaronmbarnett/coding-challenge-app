<script lang="ts">
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import { formatDuration, formatDateTime } from '$lib/utils/datetime';

  let { data } = $props();

  const tableColumns = [
    { key: 'candidate', label: 'Candidate' },
    { key: 'duration', label: 'Duration' },
    { key: 'status', label: 'Status' },
    { key: 'startedAt', label: 'Started At' },
    { key: 'actions', label: 'Actions' }
  ];
</script>

<div class="space-y-6">
  <PageHeader
    title="Exam Sessions"
    backHref="/admin"
    backText="← Back to Dashboard"
    actionHref="/admin/sessions/new"
    actionText="Create Session"
  />

  <!-- stats -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <StatCard title="Total Sessions" value={data.sessions.length} />
    <StatCard title="Available Challenges" value={data.stats.totalChallenges} />
    <StatCard title="Total Candidates" value={data.stats.totalCandidates} />
  </div>

  <!-- sessions list -->
  <DataTable
    columns={tableColumns}
    data={data.sessions}
    emptyMessage="No exam sessions yet."
    emptyActionHref="/admin/sessions/new"
    emptyActionText="Create your first session"
  >
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
          <a href="/admin/sessions/{session.id}/edit" class="text-green-600 hover:text-green-500">
            Edit
          </a>
        </td>
      </tr>
    {/each}
  </DataTable>
</div>
