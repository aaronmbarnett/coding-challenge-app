<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';

  export let data: PageData;
  export let form: ActionData;
</script>

<svelte:head>
  <title>Invitations - Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8">
    <h1 class="mb-2 text-3xl font-bold text-gray-900">Magic Link Invitations</h1>
    <p class="text-gray-600">Send secure magic link invitations to candidates.</p>
  </div>

  <!-- Create Invitation Form -->
  <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-xl font-semibold text-gray-900">Create New Invitation</h2>

    <form method="POST" use:enhance class="space-y-4">
      <div>
        <label for="email" class="mb-2 block text-sm font-medium text-gray-700">
          Candidate Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="candidate@example.com"
        />
      </div>

      <button
        type="submit"
        class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      >
        Send Invitation
      </button>
    </form>

    {#if form?.success}
      <div class="mt-4">
        <Alert 
          type="success" 
          message="{form.message} - Invitation sent to {form.invitation?.email}"
        />
      </div>
    {:else if form?.message}
      <div class="mt-4">
        <Alert type="error" message={form.message} />
      </div>
    {/if}
  </div>

  <!-- Existing Invitations -->
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="border-b border-gray-200 px-6 py-4">
      <h2 class="text-xl font-semibold text-gray-900">Recent Invitations</h2>
    </div>

    {#if data.invitations.length === 0}
      <div class="p-6 text-center text-gray-500">No invitations have been created yet.</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Created
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Expires
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            {#each data.invitations as invitation}
              <tr>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {invitation.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge 
                    status={invitation.consumedAt ? 'used' : (new Date() > invitation.expiresAt ? 'expired' : 'pending')}
                    type="invitation" 
                  />
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {new Date(invitation.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

