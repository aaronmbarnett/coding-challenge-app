<script lang="ts">
  import { enhance } from '$app/forms';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';

  export let data;
  export let form;

  let selectedChallenges: string[] = [];

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  function toggleChallenge(challengeId: string) {
    if (selectedChallenges.includes(challengeId)) {
      selectedChallenges = selectedChallenges.filter((id) => id !== challengeId);
    } else {
      selectedChallenges = [...selectedChallenges, challengeId];
    }
  }
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div class="flex items-center space-x-4">
    <a href="/admin/sessions" class="text-blue-600 hover:text-blue-500"> ← Back to Sessions </a>
    <h1 class="text-3xl font-bold">Create New Session</h1>
  </div>

  <form method="POST" use:enhance class="space-y-6">
    <!-- Candidate Selection -->
    <FormField
      label="Select Candidate"
      name="candidateId"
      type="select"
      options={[
        { value: '', label: 'Choose a candidate...' },
        ...data.candidates.map(c => ({ value: c.id, label: c.email }))
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
    <div>
      <label class="mb-3 block text-sm font-medium text-gray-700"> Select Challenges </label>

      {#if data.challenges.length === 0}
        <p class="text-sm text-gray-500">
          No challenges available. <a
            href="/admin/challenges/new"
            class="text-blue-600 hover:text-blue-500">Create one first</a
          >.
        </p>
      {:else}
        <div class="max-h-64 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
          {#each data.challenges as challenge}
            <label class="flex cursor-pointer items-start space-x-3 rounded p-2 hover:bg-gray-50">
              <input
                type="checkbox"
                name="challengeIds"
                value={challenge.id}
                checked={selectedChallenges.includes(challenge.id)}
                on:change={() => toggleChallenge(challenge.id)}
                class="mt-0.5"
              />
              <div class="min-w-0 flex-1">
                <div class="font-medium text-gray-900">{challenge.title}</div>
                {#if challenge.timeLimitSec}
                  <div class="text-sm text-gray-500">
                    Individual time limit: {formatDuration(challenge.timeLimitSec)}
                  </div>
                {/if}
              </div>
            </label>
          {/each}
        </div>

        <p class="mt-2 text-sm text-gray-600">
          Selected: {selectedChallenges.length} challenge{selectedChallenges.length === 1
            ? ''
            : 's'}
        </p>
      {/if}
    </div>

    <ErrorMessage message={form?.message} />

    <div class="flex space-x-4">
      <button
        type="submit"
        disabled={data.challenges.length === 0}
        class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Create Session
      </button>
      <a
        href="/admin/sessions"
        class="rounded-md bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
      >
        Cancel
      </a>
    </div>
  </form>
</div>
