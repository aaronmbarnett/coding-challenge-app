/**
 * Format duration from seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/**
 * Format timestamp to localized date/time string
 */
export function formatDateTime(timestamp: number | Date | null | undefined): string {
  if (!timestamp) return 'Not set';
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return date.toLocaleString();
}

/**
 * Format date only (without time)
 */
export function formatDate(timestamp: number | Date | null | undefined): string {
  if (!timestamp) return 'Not set';
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString();
}