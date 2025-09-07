<script lang="ts">
  interface Challenge {
    id: string;
    title: string;
    timeLimitSec?: number | null;
  }

  interface Props {
    challenges: Challenge[];
    selectedChallengeIds: string[];
    name?: string;
    emptyMessage?: string;
    emptyActionHref?: string;
    emptyActionText?: string;
  }

  let {
    challenges,
    selectedChallengeIds = $bindable([]),
    name = 'challengeIds',
    emptyMessage = 'No challenges available',
    emptyActionHref,
    emptyActionText
  }: Props = $props();

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  function toggleChallenge(challengeId: string) {
    if (selectedChallengeIds.includes(challengeId)) {
      selectedChallengeIds = selectedChallengeIds.filter((id) => id !== challengeId);
    } else {
      selectedChallengeIds = [...selectedChallengeIds, challengeId];
    }
  }
</script>

<div>
  <div class="mb-3 block text-sm font-medium text-gray-700">Select Challenges</div>

  {#if challenges.length === 0}
    <p class="text-sm text-gray-500">
      {emptyMessage}
      {#if emptyActionHref && emptyActionText}
        <a href={emptyActionHref} class="text-blue-600 hover:text-blue-500">{emptyActionText}</a>.
      {/if}
    </p>
  {:else}
    <div class="max-h-64 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
      {#each challenges as challenge}
        <label class="flex cursor-pointer items-start space-x-3 rounded p-2 hover:bg-gray-50">
          <input
            type="checkbox"
            {name}
            value={challenge.id}
            checked={selectedChallengeIds.includes(challenge.id)}
            onchange={() => toggleChallenge(challenge.id)}
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
      Selected: {selectedChallengeIds.length} challenge{selectedChallengeIds.length === 1
        ? ''
        : 's'}
    </p>
  {/if}
</div>
