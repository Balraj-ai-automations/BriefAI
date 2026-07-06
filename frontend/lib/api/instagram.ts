// Instagram integration — isolated boundary module
// No verified backend endpoints exist yet. No real implementation.
// This file is a placeholder so imports don't break future integration.

export const INSTAGRAM_ENABLED = false;

// Future: typed request/response shapes for when endpoints are verified
export interface InstagramConnectionStatus {
  connected: boolean;
  username?: string;
  expiredAt?: string;
}

// Future stub — do not call until backend endpoints are verified
export async function getInstagramStatus(_userId: string): Promise<InstagramConnectionStatus> {
  return { connected: false };
}
