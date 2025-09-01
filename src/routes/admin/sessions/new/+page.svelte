<script lang="ts">
  import { enhance } from '$app/forms';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import ChallengeSelector from '$lib/components/ui/ChallengeSelector.svelte';
  import FormActions from '$lib/components/ui/FormActions.svelte';

  let { data, form } = $props();

  let selectedChallenges = $state<string[]>([]);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <PageHeader 
    title="Create New Session" 
    backHref="/admin/sessions" 
    backText="← Back to Sessions" 
  />

  <form method="POST" use:enhance class="space-y-6">
    <!-- Candidate Selection -->
    <FormField
      label="Select Candidate"
      name="candidateId"
      type="select"
      options={[
        { value: '', label: 'Choose a candidate...' },
        ...data.candidates.map((c) => ({ value: c.id, label: c.email }))
      ]}
      required
    />

    <!-- Session Duration -->
    <FormField
      label="Total Session Duration"
      name="totalDurationSec"
      type="select"
      options={[
        { value: '', label: 'Select duration...' },
        { value: '1800', label: '30 minutes' },
        { value: '3600', label: '1 hour' },
        { value: '5400', label: '1.5 hours' },
        { value: '7200', label: '2 hours' },
        { value: '10800', label: '3 hours' }
      ]}
      required
    />

    <!-- Challenge Selection -->
    <ChallengeSelector 
      challenges={data.challenges}
      bind:selectedChallengeIds={selectedChallenges}
      emptyMessage="No challenges available."
      emptyActionHref="/admin/challenges/new"
      emptyActionText="Create one first"
    />

    <ErrorMessage message={form?.message} />

    <FormActions 
      submitText="Create Session"
      submitDisabled={data.challenges.length === 0}
      cancelHref="/admin/sessions"
    />
  </form>
</div>
