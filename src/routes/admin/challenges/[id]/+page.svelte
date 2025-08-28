<script>
  export let data;

  function handleDelete() {
    if (confirm('Are you sure?')) {
      alert('Delete functionality coming soon!');
    }
  }
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <a href="/admin/challenges" class="text-blue-600 hover:text-blue-500">
        ← Back to Challenges
      </a>
      <h1 class="text-3xl font-bold">{data.challenge.title}</h1>
    </div>

    <div class="flex space-x-3">
      <a
        href="/admin/challenges/{data.challenge.id}/edit"
        class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Edit Challenge
      </a>
      <button
        class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        on:click={handleDelete}
      >
        Delete
      </button>
    </div>
  </div>

  <!-- Challenge Details -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- Main Content -->
    <div class="space-y-6 lg:col-span-2">
      <!-- Description -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-semibold">Description</h2>
        <div class="leading-relaxed whitespace-pre-wrap text-gray-700">
          {data.challenge.descriptionMd}
        </div>
      </div>

      <!-- Starter Code -->
      {#if data.challenge.starterCode}
        <div class="rounded-lg bg-white p-6 shadow">
          <h2 class="mb-4 text-xl font-semibold">Starter Code</h2>
          <pre class="overflow-x-auto rounded border bg-gray-50 p-4"><code
              >{data.challenge.starterCode}</code
            ></pre>
        </div>
      {/if}

      <!-- Test Cases -->
      <div class="rounded-lg bg-white p-6 shadow">
        {#if data.testCases.length === 0}
          <p class="py-4 text-center text-gray-500">
            No test cases yet. <a
              href="/admin/challenges/{data.challenge.id}/tests"
              class="text-blue-600 hover:text-blue-500">Add some</a
            > to validate solutions.
          </p>
        {:else}
          <div class="space-y-3">
            {#each data.testCases as testCase, i}
              <div class="rounded border p-3">
                <div class="flex items-center justify-between">
                  <span class="font-medium">Test Case {i + 1}</span>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500 capitalize">{testCase.kind}</span>
                    <span class="text-xs text-gray-500">Weight: {testCase.weight}</span>
                    {#if testCase.hidden}
                      <span
                        class="inline-flex items-center rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800"
                      >
                        Hidden
                      </span>
                    {/if}
                  </div>
                </div>
                {#if testCase.kind === 'io'}
                  <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="font-medium">Input:</span>
                      <code class="mt-1 block rounded bg-gray-50 p-2 text-xs">{testCase.input}</code
                      >
                    </div>
                    <div>
                      <span class="font-medium">Expected:</span>
                      <code class="mt-1 block rounded bg-gray-50 p-2 text-xs"
                        >{testCase.expectedOutput}</code
                      >
                    </div>
                  </div>
                {:else}
                  <div class="mt-2 text-sm">
                    <span class="font-medium">Harness:</span>
                    <code class="mt-1 block rounded bg-gray-50 p-2 text-xs"
                      >{testCase.harnessCode}</code
                    >
                  </div>
                {/if}
              </div>
            {/each}

            <!-- Summary and link -->
            <div class="mt-4 border-t pt-3">
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span
                  >{data.testCases.length} test case{data.testCases.length === 1 ? '' : 's'} total</span
                >
                <a
                  href="/admin/challenges/{data.challenge.id}/tests"
                  class="text-blue-600 hover:text-blue-500"
                >
                  Manage all test cases →
                </a>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Challenge Info -->
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-lg font-semibold">Challenge Info</h3>
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="font-medium text-gray-700">Languages</dt>
            <dd class="mt-1">
              {#each data.challenge.languagesCsv.split(',') as lang}
                <span class="mr-1 mb-1 inline-block rounded bg-gray-100 px-2 py-1 text-xs">
                  {lang.trim()}
                </span>
              {/each}
            </dd>
          </div>

          {#if data.challenge.timeLimitSec}
            <div>
              <dt class="font-medium text-gray-700">Time Limit</dt>
              <dd class="mt-1">{data.challenge.timeLimitSec} seconds</dd>
            </div>
          {/if}

          <div>
            <dt class="font-medium text-gray-700">Created</dt>
            <dd class="mt-1">{new Date(data.challenge.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>

      <!-- Stats (placeholder) -->
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
  </div>
</div>
