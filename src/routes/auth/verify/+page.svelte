<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	// Get token and email from URL params
	const token = $page.url.searchParams.get('token') || '';
	const email = $page.url.searchParams.get('email') || '';
</script>

<svelte:head>
	<title>Verify Magic Link</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<div class="text-center">
			<h2 class="mt-6 text-3xl font-extrabold text-gray-900">
				Magic Link Verification
			</h2>
			<p class="mt-2 text-sm text-gray-600">
				Verifying your invitation link...
			</p>
		</div>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
			{#if token && email}
				<!-- Auto-submit form with URL parameters -->
				<form method="POST" use:enhance class="space-y-6">
					<input type="hidden" name="token" value={token} />
					<input type="hidden" name="email" value={email} />
					
					<div class="text-center">
						<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						<p class="mt-4 text-sm text-gray-600">
							Authenticating your account...
						</p>
					</div>

					<noscript>
						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Verify Magic Link
						</button>
					</noscript>
				</form>

				<!-- Auto-submit the form with JavaScript -->
				<script>
					// Auto-submit form when page loads
					document.addEventListener('DOMContentLoaded', function() {
						const form = document.querySelector('form');
						if (form) {
							setTimeout(() => form.submit(), 1000);
						}
					});
				</script>
			{:else}
				<!-- Manual form for missing parameters -->
				<div class="text-center mb-6">
					<div class="rounded-md bg-yellow-50 p-4 mb-4">
						<div class="flex">
							<div class="ml-3">
								<h3 class="text-sm font-medium text-yellow-800">
									Missing Information
								</h3>
								<div class="mt-2 text-sm text-yellow-700">
									<p>Your magic link appears to be incomplete. Please enter the details manually:</p>
								</div>
							</div>
						</div>
					</div>
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
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
								placeholder="Token from your email"
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Verify Magic Link
						</button>
					</div>
				</form>
			{/if}

			{#if form?.message}
				<div class="mt-4 rounded-md bg-red-50 p-4">
					<div class="flex">
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">
								Verification Failed
							</h3>
							<div class="mt-2 text-sm text-red-700">
								<p>{form.message}</p>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="mt-6">
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300" />
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-gray-50 text-gray-500">
						Need help? Contact your administrator
					</span>
				</div>
			</div>
		</div>
	</div>
</div>