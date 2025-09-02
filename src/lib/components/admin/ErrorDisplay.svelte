<script lang="ts">
  interface Props {
    type: 'compilation' | 'service' | 'timeout' | 'general';
    error: string;
  }

  let { type, error }: Props = $props();

  const errorConfig = {
    compilation: {
      title: 'Compilation Error',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      iconColor: 'text-red-400',
      textColor: 'text-red-800',
      descColor: 'text-red-700',
      icon: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`
    },
    service: {
      title: 'Service Issue',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      iconColor: 'text-yellow-400',
      textColor: 'text-yellow-800',
      descColor: 'text-yellow-700',
      icon: `<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />`
    },
    timeout: {
      title: 'Execution Timeout',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      iconColor: 'text-yellow-400',
      textColor: 'text-yellow-800',
      descColor: 'text-yellow-700',
      icon: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />`
    },
    general: {
      title: 'Error',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      iconColor: 'text-red-400',
      textColor: 'text-red-800',
      descColor: 'text-red-700',
      icon: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`
    }
  };

  const config = errorConfig[type];
</script>

<div class="mb-4 border-l-4 {config.borderColor} {config.bgColor} p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 {config.iconColor}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        {@html config.icon}
      </svg>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium {config.textColor}">{config.title}</h3>
      <div class="mt-2 text-xs {type === 'timeout' ? config.descColor : 'font-mono ' + config.descColor}">
        {#if type === 'timeout'}
          Your code took too long to execute
        {:else}
          {error}
        {/if}
      </div>
    </div>
  </div>
</div>