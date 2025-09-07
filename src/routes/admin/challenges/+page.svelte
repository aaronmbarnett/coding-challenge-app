<script lang="ts">
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import { formatDate } from '$lib/utils/datetime';

  let { data } = $props();

  const tableColumns = [
    { key: 'title', label: 'Title' },
    { key: 'language', label: 'Language' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];
</script>

<div class="space-y-6">
  <PageHeader
    title="Challenges"
    backHref="/admin"
    backText="← Back to Dashboard"
    actionHref="/admin/challenges/new"
    actionText="Create Challenge"
  />

  <DataTable
    columns={tableColumns}
    data={data.challenges}
    emptyMessage="No challenges yet. Create your first one!"
  >
    {#each data.challenges as challenge}
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4">
          <div class="font-medium text-gray-900">{challenge.title}</div>
        </td>
        <td class="px-6 py-4 text-sm text-gray-500">{challenge.languagesCsv}</td>
        <td class="px-6 py-4 text-sm text-gray-500">
          {formatDate(challenge.createdAt)}
        </td>
        <td class="space-x-2 px-6 py-4 text-sm">
          <a href="/admin/challenges/{challenge.id}" class="text-blue-600 hover:text-blue-500">
            View
          </a>
          <a
            href="/admin/challenges/{challenge.id}/edit"
            class="text-green-600 hover:text-green-500">Edit</a
          >
        </td>
      </tr>
    {/each}
  </DataTable>
</div>
