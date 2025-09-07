<script lang="ts">
  let {
    message,
    title,
    type = 'info'
  }: {
    message: string;
    title?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  } = $props();

  function getAlertClasses(type: string) {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  }
</script>

<div 
  role="alert" 
  class="rounded-md border p-4 {getAlertClasses(type)}"
>
  {#if title}
    <div class="font-medium text-sm mb-2">
      {title}
    </div>
  {/if}
  
  <div class="text-sm">
    {message || '\u00A0'}
  </div>
</div>