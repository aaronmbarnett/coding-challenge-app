<script lang="ts">
  interface Props {
    title: string;
    backHref?: string;
    backText?: string;
    actionHref?: string;
    actionText?: string;
    subtitle?: string;
  }

  let { 
    title, 
    backHref, 
    backText = '← Back', 
    actionHref, 
    actionText,
    subtitle 
  }: Props = $props();
</script>

<div class="flex items-center justify-between">
  <div>
    {#if backHref}
      <nav class="mb-4">
        <a href={backHref} class="text-blue-600 hover:text-blue-500">{backText}</a>
      </nav>
    {/if}
    <h1 class="text-3xl font-bold">{title}</h1>
    {#if subtitle}
      <p class="text-gray-600">{subtitle}</p>
    {/if}
  </div>

  {#if actionHref && actionText}
    <a
      href={actionHref}
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      {actionText}
    </a>
  {/if}
</div>