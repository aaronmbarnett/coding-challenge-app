<script lang="ts">
  import ChallengeHeader from '$lib/components/admin/ChallengeHeader.svelte';
  import ChallengeContent from '$lib/components/admin/ChallengeContent.svelte';
  import ChallengeSidebar from '$lib/components/admin/ChallengeSidebar.svelte';
  import TestCasesPreview from '$lib/components/admin/TestCasesPreview.svelte';

  let { data } = $props();
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <ChallengeHeader challenge={data.challenge} />

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    {#snippet testCasesSlot()}
      <TestCasesPreview testCases={data.testCases} challengeId={data.challenge.id} />
    {/snippet}
    
    <ChallengeContent challenge={data.challenge} testCasesContent={testCasesSlot}></ChallengeContent>

    <ChallengeSidebar challenge={data.challenge} />
  </div>
</div>
