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
    onsubmit={onSubmit}
  >
    <!-- Language Selection -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2" for="language">
        Language
      </label>
      <select 
        id="language"
        name="language" 
        bind:value={selectedLanguage}
        class="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        required
      >
        {#each supportedLanguages as lang}
          <option value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
        {/each}
      </select>
    </div>

    <!-- Code Editor -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2" for="code">
        Your Code
      </label>
      <textarea 
        id="code"
        name="code" 
        bind:value={code}
        class="w-full h-64 font-mono text-sm rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Write your solution here..."
        required
      ></textarea>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end">
      <button 
        type="submit" 
        class="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={submitting}
      >
        {#if submitting}
          <span class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          Running Tests...
        {:else}
          🏃 Run Tests
        {/if}
      </button>
    </div>
  </form>
</div>