<script lang="ts">
  import TestCaseManager from '$lib/components/admin/TestCaseManager.svelte';

  export let data;
  export let form;
</script>

<TestCaseManager challenge={data.challenge} testCases={data.testCases} {form} />
