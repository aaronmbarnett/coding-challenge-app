<script lang="ts">
  import TestCaseManager from '$lib/components/admin/TestCaseManager.svelte';

  let { data, form } = $props();
</script>

<TestCaseManager challenge={data.challenge} testCases={data.testCases} {form} />
