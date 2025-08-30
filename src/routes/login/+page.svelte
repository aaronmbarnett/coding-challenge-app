<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
</script>

<form method="POST" use:enhance>
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  <!-- Make sure this exists -->
  <button type="submit">Login</button>
</form>
