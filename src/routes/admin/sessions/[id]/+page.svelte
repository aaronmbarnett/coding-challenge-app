<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  let { data, form } = $props();

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  function formatDateTime(timestamp: number | Date | null) {
    if (!timestamp) return 'Not set';
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    return date.toLocaleString();
  }

  function getRemainingTime(session: typeof data.session) {
    if (session.status !== 'active' || session.endsAt === null || session.endsAt === undefined) {
      return null;
    }
    const now = Date.now();
    const endsAtTime =
      typeof session.endsAt === 'number' ? session.endsAt : session.endsAt.getTime();
    const remaining = Math.max(0, endsAtTime - now);
    return Math.floor(remaining / 1000);
  }

  let remainingSeconds = $derived(getRemainingTime(data.session));
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <nav class="mb-4">
        <a href="/admin/sessions" class="text-blue-600 hover:text-blue-500">← Back to Sessions</a>
      </nav>
      <h1 class="text-3xl font-bold">Session Details</h1>
      <p class="text-gray-600">{data.candidate?.email ?? 'Unknown Candidate'}</p>
    </div>

    <div class="flex items-center space-x-3">
      <StatusBadge status={data.session.status} type="session" />

      {#if data.session.status === 'pending'}
        <form
          action="?/startSession"
          method="POST"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                await invalidateAll();
              }
            };
          }}
        >
          <button
            class="rounded bg-green-600 px-4 py-3 text-white hover:bg-green-700"
            type="submit"
          >
            Start Session
          </button>
        </form>
      {/if}

      {#if data.session.status === 'active'}
        <form
          action="?/stopSession"
          method="POST"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                await invalidateAll();
              }
            };
          }}
        >
          <button class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            Stop Session
          </button>
        </form>
      {/if}
    </div>
  </div>

  <!-- error messages -->
  <ErrorMessage message={form?.message} />

  <!-- session info -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <StatCard title="Total Duration" value={formatDuration(data.session.totalDurationSec)} />

    <StatCard title="Started At" value={formatDateTime(data.session.startedAt)} />

    <StatCard
      title={remainingSeconds !== null ? 'Time Remaining' : 'Ends At'}
      value={remainingSeconds !== null
        ? formatDuration(remainingSeconds)
        : formatDateTime(data.session.endsAt)}
    />
  </div>

  <!-- challenges/attempts -->
  <div class="overflow-hidden rounded-lg bg-white shadow">
    <div class="border-b border-gray-200 px-6 py-4">
      <h2 class="text-lg font-medium text-gray-900">Challenges</h2>
    </div>

    {#if data.attempts.length === 0}
      <div class="py-12 text-center">
        <p class="text-gray-500">No challenges assigned to this session.</p>
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each data.attempts as attemptData}
          {@const attempt = attemptData.attempt}
          {@const challenge = attemptData.challenge}
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{challenge?.title ?? 'Unknown Challenge'}</h3>
                <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  {#if challenge?.timeLimitSec}
                    <span>Time limit: {formatDuration(challenge.timeLimitSec)}</span>
                  {/if}

                  {#if attempt.startedAt}
                    <span>Started: {formatDateTime(attempt.startedAt)}</span>
                  {/if}

                  {#if attempt.submittedAt}
                    <span>Submitted: {formatDateTime(attempt.submittedAt)}</span>
                  {/if}
                  <span>Test runs: {attempt.testRunCount}</span>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <StatusBadge status={attempt.status} type="attempt" />

                <a
                  href="/admin/challenges/{challenge?.id}"
                  class="text-sm text-blue-600 hover:text-blue-500"
                >
                  View Challenge
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
