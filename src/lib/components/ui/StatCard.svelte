<script lang="ts">
  let {
    title,
    value,
    subtitle
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
  } = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow">
  <h3 class="text-sm font-medium text-gray-500">{title}</h3>
  <p class="text-2xl font-bold text-gray-900">{value}</p>
  {#if subtitle}
    <p class="text-sm text-gray-500">{subtitle}</p>
  {/if}
</div>
