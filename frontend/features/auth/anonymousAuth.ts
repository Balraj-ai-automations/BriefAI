import { supabase, isSupabaseMisconfigured } from '@/lib/supabase';

// Fallback dev user ID used when Supabase is not yet configured.
// This allows all UI pages to render and be tested without a real backend.
const DEV_FALLBACK_USER_ID = 'dev-anonymous-user-placeholder';

/**
 * Ensures a valid Supabase anonymous session exists.
 * - If Supabase is not configured (missing env vars), returns a dev fallback ID
 *   and logs a clear warning — this lets the UI work for local development.
 * - If a valid session already exists, returns the existing user UUID.
 * - Otherwise, signs in anonymously and returns the new user UUID.
 */
export async function ensureAnonymousSession(): Promise<string> {
  if (isSupabaseMisconfigured) {
    console.warn(
      '[BriefAI] Using fallback dev user ID because Supabase is not configured.\n' +
      'Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable real auth.'
    );
    return DEV_FALLBACK_USER_ID;
  }

  try {
    // 1. Check for existing session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) console.warn('[BriefAI] Error checking session:', sessionError.message);
    if (session?.user?.id) return session.user.id;

    // 2. No valid session — sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw new Error(`Anonymous auth failed: ${error.message}`);
    if (!data.user?.id) throw new Error('Anonymous auth returned no user ID');

    return data.user.id;
  } catch (err) {
    // If Supabase call fails for any reason, use fallback so UI doesn't break
    console.warn('[BriefAI] Auth error, using fallback ID:', err);
    return DEV_FALLBACK_USER_ID;
  }
}

/**
 * Get the current user ID from the active Supabase session.
 * Returns the dev fallback ID if Supabase is not configured.
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (isSupabaseMisconfigured) return DEV_FALLBACK_USER_ID;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? DEV_FALLBACK_USER_ID;
  } catch {
    return DEV_FALLBACK_USER_ID;
  }
}
