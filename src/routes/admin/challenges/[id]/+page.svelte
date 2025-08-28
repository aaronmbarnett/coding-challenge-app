<script>
  import TestCaseForm from '$lib/components/admin/TestCaseForm.svelte';
  import TestCaseList from '$lib/components/admin/TestCaseList.svelte';

  export let data;
  export let form;
  let showForm = false;
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <a href="/admin/challenges" class="text-blue-600 hover:text-blue-500">
        ← Back to Challenges
      </a>
      <h1 class="text-3xl font-bold">Test Cases: {data.challenge.title}</h1>
    </div>

    <button
      on:click={() => (showForm = !showForm)}
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      {showForm ? 'Cancel' : '+ Add Test Case'}
    </button>
  </div>

  {#if showForm}
    <TestCaseForm challengeId={data.challenge.id} {form} onCancel={() => (showForm = false)} />
  {/if}

  <TestCaseList testCases={data.testCases} challengeId={data.challenge.id} />
</div>
