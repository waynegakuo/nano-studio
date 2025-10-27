export function mapToFriendlyError(err: unknown): string {
  // Keep messages simple for end users; log technical details elsewhere
  const defaultMsg = 'Something went wrong. Please try again.';

  if (!err) return defaultMsg;

  // Firebase-style errors may have a code
  const e = err as { code?: string; message?: string };
  const code = e?.code ?? '';

  // Network issues
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You appear to be offline. Check your internet connection.';
  }

  if (code.includes('permission-denied') || code.includes('auth/')) {
    return 'You do not have permission to perform this action.';
  }

  if (code.includes('unavailable')) {
    return 'The service is temporarily unavailable. Please try again later.';
  }

  return defaultMsg;
}
