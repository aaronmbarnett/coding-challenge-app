<script lang="ts">
  import TestCaseHeader from './TestCaseHeader.svelte';
  import TestCaseForm from './TestCaseForm.svelte';
  import TestCaseList from './TestCaseList.svelte';

  export let challenge;
  export let testCases: any[];
  export let form: any = null;

  let showForm = false;

  function toggleForm() {
    showForm = !showForm;
  }

  function handleFormCancel() {
    showForm = false;
  }
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <TestCaseHeader
    challengeTitle={challenge.title}
    challengeId={challenge.id}
    {showForm}
    onToggleForm={toggleForm}
  />

  {#if showForm}
    <TestCaseForm challengeId={challenge.id} {form} onCancel={handleFormCancel} />
  {/if}

  <TestCaseList {testCases} challengeId={challenge.id} />
</div>
