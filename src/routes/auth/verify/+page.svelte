<script lang="ts">
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import Alert from '$lib/components/ui/Alert.svelte';

  export let form: ActionData;

  // Get token and email from URL params
  const token = $page.url.searchParams.get('token') || '';
  const email = $page.url.searchParams.get('email') || '';
</script>

<svelte:head>
  <title>Verify Magic Link</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div class="text-center">
      <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Magic Link Verification</h2>
      <p class="mt-2 text-sm text-gray-600">Verifying your invitation link...</p>
    </div>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
      {#if token && email}
        <!-- Auto-submit form with URL parameters -->
        <form method="POST" use:enhance class="space-y-6">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />

          <div class="text-center">
            <div
              class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
            ></div>
            <p class="mt-4 text-sm text-gray-600">Authenticating your account...</p>
          </div>

          <noscript>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Verify Magic Link
            </button>
          </noscript>
        </form>

        <!-- Auto-submit the form with JavaScript -->
        <script>
          // Auto-submit form when page loads
          document.addEventListener('DOMContentLoaded', function () {
            const form = document.querySelector('form');
            if (form) {
              setTimeout(() => form.submit(), 1000);
            }
          });
        </script>
      {:else}
        <!-- Manual form for missing parameters -->
        <div class="mb-6 text-center">
          <Alert
            type="warning"
            title="Missing Information"
            message="Your magic link appears to be incomplete. Please enter the details manually:"
          />
        </div>

        <form method="POST" use:enhance class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label for="token" class="block text-sm font-medium text-gray-700">
              Verification Token
            </label>
            <div class="mt-1">
              <input
                id="token"
                name="token"
                type="text"
                required
                value={token}
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 font-mono text-xs placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                placeholder="Token from your email"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Verify Magic Link
            </button>
          </div>
        </form>
      {/if}

      {#if form?.message}
        <div class="mt-4">
          <Alert type="error" title="Verification Failed" message={form.message} />
        </div>
      {/if}
    </div>

    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-gray-50 px-2 text-gray-500"> Need help? Contact your administrator </span>
        </div>
      </div>
    </div>
  </div>
</div>
