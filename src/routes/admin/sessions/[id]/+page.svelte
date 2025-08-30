<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
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

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getAttemptStatusColor(status: string) {
    switch (status) {
      case 'locked':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <span
        class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {getStatusColor(
          data.session.status
        )}"
      >
        {data.session.status.toUpperCase()}
      </span>

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
          <button class="hover:bg-red-700 rounded bg-red-600 px-4 py-2 text-white">
            Stop Session
          </button>
        </form>
      {/if}
    </div>
  </div>

  <!-- error messages -->
  {#if form?.message}
    <div class="rounded-md bg-red-50 p-4">
      <p class="text-sm text-red-800">{form.message}</p>
    </div>
  {/if}

  <!-- session info -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <div class="rounded-lg bg-white p-6 shadow">
      <h3 class="text-sm font-medium text-gray-500">Total Duration</h3>
      <p class="text-2xl font-bold text-gray-900">
        {formatDuration(data.session.totalDurationSec)}
      </p>
    </div>

    <div class="rounded-lg bg-white p-6 shadow">
      <h3 class="text-sm font-medium text-gray-500">Started At</h3>
      <p class="text-2xl font-bold text-gray-900">
        {formatDateTime(data.session.startedAt)}
      </p>
    </div>

    <div class="rounded-lg bg-white p-6 shadow">
      <h3 class="text-sm font-medium text-gray-500">
        {#if remainingSeconds !== null}
          Time Remaining
        {:else}
          Ends At
        {/if}
      </h3>
      <p class="text-2xl font-bold text-gray-900">
        {#if remainingSeconds !== null}
          {formatDuration(remainingSeconds)}
        {:else}
          {formatDateTime(data.session.endsAt)}
        {/if}
      </p>
    </div>
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
                <span
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {getAttemptStatusColor(
                    attempt.status
                  )}"
                >
                  {attempt.status.replace('_', ' ')}
                </span>

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
