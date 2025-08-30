<script lang="ts">
  import TestCaseHeader from './TestCaseHeader.svelte';
  import TestCaseForm from './TestCaseForm.svelte';
  import TestCaseList from './TestCaseList.svelte';

  let { 
    challenge, 
    testCases, 
    form = null 
  }: { 
    challenge: any; 
    testCases: any[]; 
    form?: any; 
  } = $props();

  let showForm = $state(false);

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
