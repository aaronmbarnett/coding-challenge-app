<script lang="ts">
  let { challenge }: { challenge: any } = $props();
</script>

<div class="space-y-6 lg:col-span-2">
  <!-- Description -->
  <div class="rounded-lg bg-white p-6 shadow">
    <h2 class="mb-4 text-xl font-semibold">Description</h2>
    <div class="leading-relaxed whitespace-pre-wrap text-gray-700">
      {challenge.descriptionMd}
    </div>
  </div>

  <!-- Starter Code -->
  {#if challenge.starterCode}
    <div class="rounded-lg bg-white p-6 shadow">
      <h2 class="mb-4 text-xl font-semibold">Starter Code</h2>
      <pre class="overflow-x-auto rounded border bg-gray-50 p-4"><code>{challenge.starterCode}</code
        ></pre>
    </div>
  {/if}

  <!-- Test Cases -->
  <div class="rounded-lg bg-white p-6 shadow">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">Test Cases</h2>
      <a
        href="/admin/challenges/{challenge.id}/tests"
        class="text-sm text-blue-600 hover:text-blue-500"
      >
        Manage Test Cases →
      </a>
    </div>

    <slot name="testCases" />
  </div>
</div>
