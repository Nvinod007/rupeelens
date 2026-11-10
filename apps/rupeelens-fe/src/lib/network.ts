export const OFFLINE_MESSAGE =
  "You're offline. Check your connection and try again.";

export const TIMEOUT_MESSAGE =
  'Request timed out. Check your connection and try again.';

export const API_REQUEST_TIMEOUT_MS = 20_000;

export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

export function assertBrowserOnline(): void {
  if (isBrowserOffline()) {
    throw new Error(OFFLINE_MESSAGE);
  }
}

export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('offline') ||
      msg.includes("can't reach") ||
      msg.includes('timed out') ||
      msg.includes('failed to fetch')
    );
  }
  return false;
}

export function toUserNetworkError(error: unknown): Error {
  if (error instanceof Error && error.name === 'AbortError') {
    return new Error(TIMEOUT_MESSAGE);
  }
  if (isNetworkFailure(error)) {
    return new Error(OFFLINE_MESSAGE);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error('Something went wrong');
}
