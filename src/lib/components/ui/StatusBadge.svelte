<script lang="ts">
  let {
    status,
    type = 'session'
  }: {
    status: string;
    type?: 'session' | 'attempt' | 'testcase';
  } = $props();

  function getStatusColor(status: string, type: string) {
    if (type === 'session') {
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

    if (type === 'attempt') {
      switch (status) {
        case 'locked':
          return 'bg-gray-100 text-gray-800';
        case 'in_progress':
          return 'bg-yellow-100 text-yellow-800';
        case 'submitted':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    if (type === 'testcase') {
      switch (status) {
        case 'io':
          return 'bg-blue-100 text-blue-800';
        case 'harness':
          return 'bg-purple-100 text-purple-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    return 'bg-gray-100 text-gray-800';
  }

  function formatStatus(status: string) {
    return status.replace('_', ' ').toUpperCase();
  }
</script>

<span
  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
    status,
    type
  )}"
>
  {formatStatus(status)}
</span>
