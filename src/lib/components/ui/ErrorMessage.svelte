<script lang="ts">
  let { message, type = 'error' }: { message?: string; type?: 'error' | 'warning' | 'info' } =
    $props();

  function getStyles(type: string) {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-700';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      default:
        return 'border-red-200 bg-red-50 text-red-700';
    }
  }
</script>

{#if message}
  <div class="rounded-md border p-3 {getStyles(type)}">
    <p>{message}</p>
  </div>
{/if}
