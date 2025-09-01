<script lang="ts">
  interface Props {
    submitText?: string;
    submitDisabled?: boolean;
    cancelHref?: string;
    cancelText?: string;
  }

  let { 
    submitText = 'Submit',
    submitDisabled = false,
    cancelHref,
    cancelText = 'Cancel'
  }: Props = $props();
</script>

<div class="flex space-x-4">
  <button
    type="submit"
    disabled={submitDisabled}
    class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
  >
    {submitText}
  </button>
  
  {#if cancelHref}
    <a
      href={cancelHref}
      class="rounded-md bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
    >
      {cancelText}
    </a>
  {/if}
</div>