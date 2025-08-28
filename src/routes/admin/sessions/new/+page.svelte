<script lang="ts">
  import { enhance } from '$app/forms';

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
    <div>
      <label for="candidateId" class="mb-1 block text-sm font-medium text-gray-700">
        Select Candidate
      </label>
      <select
        id="candidateId"
        name="candidateId"
        required
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">Choose a candidate...</option>
        {#each data.candidates as candidate}
          <option value={candidate.id}>{candidate.email}</option>
        {/each}
      </select>
    </div>

    <!-- Session Duration -->
    <div>
      <label for="totalDurationSec" class="mb-1 block text-sm font-medium text-gray-700">
        Total Session Duration
      </label>
      <select
        id="totalDurationSec"
        name="totalDurationSec"
        required
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">Select duration...</option>
        <option value="1800">30 minutes</option>
        <option value="3600">1 hour</option>
        <option value="5400">1.5 hours</option>
        <option value="7200">2 hours</option>
        <option value="10800">3 hours</option>
      </select>
    </div>

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

    {#if form?.message}
      <div class="rounded-md border border-red-200 bg-red-50 p-3">
        <p class="text-red-700">{form.message}</p>
      </div>
    {/if}

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
