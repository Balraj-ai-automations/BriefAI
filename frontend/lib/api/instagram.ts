import { apiClient } from './client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// Verified real backend endpoints (see backend/api/auth.py and
// backend/api/instagram.py):
//   GET  /api/auth/instagram/login?user_id=...   → redirects to Instagram OAuth
//   GET  /api/auth/instagram/callback             → backend-only; redirects back
//        to /dashboard?instagram_connected=true&handle=... on success, or
//        /settings?instagram_error=... on failure.
//   POST /api/post-instagram                      → posts a campaign

/**
 * Full URL to start the Instagram OAuth flow. Navigate the browser here
 * directly (e.g. `window.location.href = ...`) — the backend handles the
 * rest of the OAuth exchange and redirects back into the app.
 */
export function getInstagramLoginUrl(userId: string): string {
  return `${BASE_URL}/api/auth/instagram/login?user_id=${encodeURIComponent(userId)}`;
}

export interface PostToInstagramRequest {
  campaign_id: string;
  user_id: string;
  image_url: string;
  caption: string;
}

export interface PostToInstagramResponse {
  success: boolean;
  message: string;
  instagram_post_url?: string | null;
}

export async function postToInstagram(
  req: PostToInstagramRequest
): Promise<PostToInstagramResponse> {
  return apiClient.post<PostToInstagramResponse>('/api/post-instagram', req, {
    timeoutMs: 60000,
  });
}

// No GET status endpoint exists on the backend yet — connection state is
// tracked client-side from the OAuth callback redirect (see
// features/instagram/useInstagramConnection.ts). A real
// GET /api/instagram/status endpoint is a recommended backend follow-up.
