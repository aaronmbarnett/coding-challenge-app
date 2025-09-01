<script>
  import { enhance } from '$app/forms';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import FormActions from '$lib/components/ui/FormActions.svelte';
  
  let { form } = $props();
  
  function handleSubmit() {
    console.log('Form submit triggered');
  }
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <PageHeader 
    title="Create New Challenge" 
    backHref="/admin/challenges" 
    backText="← Back to Challenges" 
  />

  <form method="POST" use:enhance class="space-y-6" onsubmit={handleSubmit}>
    <FormField
      label="Challenge Title"
      name="title"
      placeholder="e.g., Two Sum Problem"
      required
    />

    <FormField
      label="Description (Markdown)"
      name="description"
      type="textarea"
      rows={10}
      placeholder="## Problem Description&#10;&#10;Write a function that..."
      required
    />

    <FormField
      label="Supported Languages (comma-separated)"
      name="languages"
      placeholder="javascript,python,java"
      required
    />

    <FormField
      label="Starter Code (optional)"
      name="starterCode"
      type="textarea"
      rows={6}
      placeholder="TODO: REPLACE THIS PLACE HOLDER"
    />

    <FormField
      label="Time Limit (seconds, optional)"
      name="timeLimit"
      type="number"
      placeholder="1800"
    />

    <ErrorMessage message={form?.message} />

    <FormActions 
      submitText="Create Challenge"
      cancelHref="/admin/challenges"
    />
  </form>
</div>
