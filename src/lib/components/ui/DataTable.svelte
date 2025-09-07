<script lang="ts">
  interface Column {
    key: string;
    label: string;
    class?: string;
  }

  interface Props {
    columns: Column[];
    data: any[];
    emptyMessage?: string;
    emptyActionHref?: string;
    emptyActionText?: string;
    children?: import('svelte').Snippet;
  }

  let {
    columns,
    data,
    emptyMessage = 'No data available',
    emptyActionHref,
    emptyActionText,
    children
  }: Props = $props();
</script>

{#if data.length === 0}
  <div class="py-12 text-center">
    <p class="mb-4 text-gray-500">{emptyMessage}</p>
    {#if emptyActionHref && emptyActionText}
      <a href={emptyActionHref} class="text-blue-600 hover:text-blue-500">
        {emptyActionText}
      </a>
    {/if}
  </div>
{:else}
  <div class="overflow-hidden rounded-lg bg-white shadow">
    <table class="min-w-full">
      <thead class="bg-gray-50">
        <tr>
          {#each columns as column}
            <th
              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase {column.class ||
                ''}"
            >
              {column.label}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        {@render children?.()}
      </tbody>
    </table>
  </div>
{/if}
