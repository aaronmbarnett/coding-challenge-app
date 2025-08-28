<script lang="ts">
  export let challenge: any;
</script>

<div class="space-y-6">
  <!-- Challenge Info -->
  <div class="rounded-lg bg-white p-6 shadow">
    <h3 class="mb-4 text-lg font-semibold">Challenge Info</h3>
    <dl class="space-y-3 text-sm">
      <div>
        <dt class="font-medium text-gray-700">Languages</dt>
        <dd class="mt-1">
          {#each challenge.languagesCsv.split(',') as lang}
            <span class="mr-1 mb-1 inline-block rounded bg-gray-100 px-2 py-1 text-xs">
              {lang.trim()}
            </span>
          {/each}
        </dd>
      </div>

      {#if challenge.timeLimitSec}
        <div>
          <dt class="font-medium text-gray-700">Time Limit</dt>
          <dd class="mt-1">{challenge.timeLimitSec} seconds</dd>
        </div>
      {/if}

      <div>
        <dt class="font-medium text-gray-700">Created</dt>
        <dd class="mt-1">{new Date(challenge.createdAt).toLocaleDateString()}</dd>
      </div>
    </dl>
  </div>

  <!-- Stats -->
  <div class="rounded-lg bg-white p-6 shadow">
    <h3 class="mb-4 text-lg font-semibold">Statistics</h3>
    <dl class="space-y-3 text-sm">
      <div class="flex justify-between">
        <dt>Total Attempts</dt>
        <dd class="font-medium">0</dd>
      </div>
      <div class="flex justify-between">
        <dt>Success Rate</dt>
        <dd class="font-medium">N/A</dd>
      </div>
      <div class="flex justify-between">
        <dt>Avg Time</dt>
        <dd class="font-medium">N/A</dd>
      </div>
    </dl>
  </div>
</div>
