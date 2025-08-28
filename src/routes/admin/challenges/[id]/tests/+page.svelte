<script>
  import { enhance } from '$app/forms';
  export let data;
  export let form;
  let showForm = false;
  let testKind = 'io';
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <a href="/admin/challenges/{data.challenge.id}" class="text-blue-600 hover:text-blue-500">
        ← Back to Challenge
      </a>
      <h1 class="text-3xl font-bold">Test Cases: {data.challenge.title}</h1>
    </div>

    <button
      on:click={() => (showForm = !showForm)}
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      {showForm ? 'Cancel' : '+ Add Test Case'}
    </button>
  </div>
  <!-- Add Test Case Form -->
  {#if showForm}
    <div class="rounded-lg bg-white p-6 shadow">
      <h2 class="mb-4 text-xl font-semibold">Add New Test Case</h2>

      <form method="POST" action="?/create" use:enhance class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Test Type</label>
          <div class="flex space-x-4">
            <label class="flex items-center">
              <input type="radio" bind:group={testKind} value="io" name="kind" class="mr-2" />
              Input/Output
            </label>
            <label class="flex items-center">
              <input type="radio" bind:group={testKind} value="harness" name="kind" class="mr-2" />
              Test Harness
            </label>
          </div>
        </div>

        {#if testKind === 'io'}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="input" class="mb-1 block text-sm font-medium text-gray-700">
                Input
              </label>
              <textarea
                id="input"
                name="input"
                rows="4"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="[1, 2, 3]"
              ></textarea>
            </div>

            <div>
              <label for="expectedOutput" class="mb-1 block text-sm font-medium text-gray-700">
                Expected Output
              </label>
              <textarea
                id="expectedOutput"
                name="expectedOutput"
                rows="4"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="6"
              ></textarea>
            </div>
          </div>
        {:else}
          <div>
            <label for="harnessCode" class="mb-1 block text-sm font-medium text-gray-700">
              Test Harness Code
            </label>
            <textarea
              id="harnessCode"
              name="harnessCode"
              rows="6"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="assert solution([1,2,3]) == 6"
            ></textarea>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="weight" class="mb-1 block text-sm font-medium text-gray-700">
              Weight
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              min="1"
              value="1"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-center">
            <input type="checkbox" id="hidden" name="hidden" class="mr-2" />
            <label for="hidden" class="text-sm font-medium text-gray-700">
              Hidden from candidates
            </label>
          </div>
        </div>

        {#if form?.message}
          <div class="rounded-md border border-red-200 bg-red-50 p-3">
            <p class="text-red-700">{form.message}</p>
          </div>
        {/if}

        <div class="flex space-x-4">
          <button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Add Test Case
          </button>
          <button
            type="button"
            on:click={() => (showForm = false)}
            class="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Test Cases List -->
  <div class="rounded-lg bg-white shadow">
    {#if data.testCases.length === 0}
      <div class="p-8 text-center">
        <p class="text-gray-500">No test cases yet. Add some to validate candidate solutions.</p>
      </div>
    {:else}
      <div class="p-6">
        <h2 class="mb-4 text-xl font-semibold">Test Cases ({data.testCases.length})</h2>

        <div class="space-y-4">
          {#each data.testCases as testCase, i}
            <div class="rounded-lg border p-4">
              <div class="mb-3 flex items-start justify-between">
                <div class="flex items-center space-x-3">
                  <span class="font-medium">Test Case #{i + 1}</span>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                      {testCase.kind === 'io'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'}"
                  >
                    {testCase.kind.toUpperCase()}
                  </span>
                  <span class="text-sm text-gray-500">Weight: {testCase.weight}</span>
                  {#if testCase.hidden}
                    <span
                      class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                    >
                      Hidden
                    </span>
                  {/if}
                </div>

                <form method="POST" action="?/delete" use:enhance class="inline">
                  <input type="hidden" name="testId" value={testCase.id} />
                  <input type="hidden" name="challengeId" value={data.challenge.id} />
                  <button
                    type="submit"
                    class="text-sm text-red-600 hover:text-red-800"
                    on:click={() => confirm('Delete this test case?')}
                  >
                    Delete
                  </button>
                </form>
              </div>

              {#if testCase.kind === 'io'}
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h4 class="mb-1 text-sm font-medium text-gray-700">Input:</h4>
                    <pre class="overflow-x-auto rounded bg-gray-50 p-2 text-sm"><code
                        >{testCase.input}</code
                      ></pre>
                  </div>
                  <div>
                    <h4 class="mb-1 text-sm font-medium text-gray-700">Expected Output:</h4>
                    <pre class="overflow-x-auto rounded bg-gray-50 p-2 text-sm"><code
                        >{testCase.expectedOutput}</code
                      ></pre>
                  </div>
                </div>
              {:else}
                <div>
                  <h4 class="mb-1 text-sm font-medium text-gray-700">Test Harness:</h4>
                  <pre class="overflow-x-auto rounded bg-gray-50 p-2 text-sm"><code
                      >{testCase.harnessCode}</code
                    ></pre>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
