<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">Admin Dashboard</h1>
    <div class="flex items-center space-x-4">
      <a href="/" class="text-blue-600 hover:text-blue-500">← Back to Site</a>
      <span class="text-gray-300">|</span>
      <a href="/admin/challenges/new" class="text-sm text-blue-600 hover:text-blue-500"
        >New Challenge</a
      >
      <a href="/admin/sessions/new" class="text-sm text-blue-600 hover:text-blue-500">New Session</a
      >
    </div>
  </div>

  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <a
      href="/admin/challenges"
      class="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
    >
      <h2 class="mb-2 text-xl font-semibold">Challenges</h2>
      <p class="text-gray-600">Manage coding challenges</p>
    </a>

    <a
      href="/admin/sessions"
      class="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
    >
      <h2 class="mb-2 text-xl font-semibold">Sessions</h2>
      <p class="text-gray-600">View exam sessions</p>
    </a>

    <div class="rounded-lg bg-white p-6 shadow">
      <h2 class="mb-2 text-xl font-semibold">Users</h2>
      <p class="text-gray-600">Manage candidates (coming soon)</p>
    </div>
  </div>
</div>
