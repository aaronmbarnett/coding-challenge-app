<script lang="ts">
  import { enhance } from '$app/forms';

  interface Props {
    supportedLanguages: string[];
    defaultCode: string;
    submitting?: boolean;
    selectedLanguage?: string;
    onLanguageChange?: (language: string) => void;
  }

  let {
    supportedLanguages,
    defaultCode,
    submitting = $bindable(false),
    selectedLanguage = $bindable(supportedLanguages[0] || 'javascript'),
    onLanguageChange
  }: Props = $props();

  let code = $state(defaultCode);

  // Update code when language changes
  $effect(() => {
    onLanguageChange?.(selectedLanguage);
  });

  // Update code when defaultCode prop changes
  $effect(() => {
    code = defaultCode;
  });
</script>

<div class="rounded-lg bg-white p-6 shadow">
  <h2 class="mb-6 text-xl font-semibold">Test Your Solution</h2>

  <form
    method="post"
    action="?/runTest"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        submitting = false;
        await update();
      };
    }}
  >
    <!-- Language Selection -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700" for="language"> Language </label>
      <select
        id="language"
        name="language"
        bind:value={selectedLanguage}
        class="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        required
      >
        {#each supportedLanguages as lang}
          <option value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
        {/each}
      </select>
    </div>

    <!-- Code Editor -->
    <div class="mb-6">
      <label class="mb-2 block text-sm font-medium text-gray-700" for="code"> Your Code </label>
      <textarea
        id="code"
        name="code"
        bind:value={code}
        class="h-64 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        placeholder="Write your solution here..."
        required
      ></textarea>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end">
      <button
        type="submit"
        class="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={submitting}
      >
        {#if submitting}
          <span
            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
          ></span>
          Running Tests...
        {:else}
          🏃 Run Tests
        {/if}
      </button>
    </div>
  </form>
</div>
