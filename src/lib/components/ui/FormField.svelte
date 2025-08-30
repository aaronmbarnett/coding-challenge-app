<script lang="ts">
  let {
    label,
    name,
    type = 'text',
    value = '',
    placeholder = '',
    required = false,
    rows = 3,
    options = []
  }: {
    label: string;
    name: string;
    type?: 'text' | 'number' | 'textarea' | 'select';
    value?: string | number;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    options?: Array<{ value: string; label: string }>;
  } = $props();

  const baseClasses =
    'w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none';
</script>

<div>
  <label for={name} class="mb-1 block text-sm font-medium text-gray-700">
    {label}
  </label>

  {#if type === 'textarea'}
    <textarea {name} {required} {placeholder} {rows} {value} id={name} class={baseClasses}
    ></textarea>
  {:else if type === 'select'}
    <select {name} {required} {value} class={baseClasses} id={name}>
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  {:else}
    <input {type} {name} id={name} {required} {placeholder} class={baseClasses} {value} />
  {/if}
</div>
