<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';

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
      <div class="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
        <p class="text-green-800">{form.message}</p>
        <p class="mt-1 text-sm text-green-600">
          Invitation sent to {form.invitation?.email}
        </p>
      </div>
    {:else if form?.message}
      <div class="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
        <p class="text-red-800">{form.message}</p>
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
                  {#if invitation.consumedAt}
                    <span
                      class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
                    >
                      Used
                    </span>
                  {:else if new Date() > invitation.expiresAt}
                    <span
                      class="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800"
                    >
                      Expired
                    </span>
                  {:else}
                    <span
                      class="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
                    >
                      Pending
                    </span>
                  {/if}
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

