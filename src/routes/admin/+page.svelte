<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">Admin Dashboard</h1>
    <div class="flex items-center space-x-4">
      <a href="/" class="text-blue-600 hover:text-blue-500">← Back to Site</a>
      <span class="text-gray-300">|</span>
      <a href="/admin/challenges/new" class="text-sm text-blue-600 hover:text-blue-500">New Challenge</a>
      <a href="/admin/sessions/new" class="text-sm text-blue-600 hover:text-blue-500">New Session</a>
    </div>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <a href="/admin/challenges" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <h2 class="text-xl font-semibold mb-2">Challenges</h2>
      <p class="text-gray-600">Manage coding challenges</p>
    </a>

    <a href="/admin/sessions" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <h2 class="text-xl font-semibold mb-2">Sessions</h2>
      <p class="text-gray-600">View exam sessions</p>
    </a>

    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Users</h2>
      <p class="text-gray-600">Manage candidates (coming soon)</p>
    </div>
  </div>
</div>
