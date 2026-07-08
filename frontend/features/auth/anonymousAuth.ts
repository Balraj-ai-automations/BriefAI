import { supabase } from '@/lib/supabase';

/**
 * Ensures a valid Supabase Auth session exists (anonymous or upgraded).
 * Restores an existing session if present; otherwise creates a new
 * anonymous session and returns its UUID. Throws on failure — callers
 * must show a retry UI (see /demo bootstrap step), never fall back to
 * a fake identity.
 */
export async function ensureAnonymousSession(): Promise<string> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.warn('[BriefAI] Error checking session:', sessionError.message);
  }
  if (session?.user?.id) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(`Anonymous auth failed: ${error.message}`);
  if (!data.user?.id) throw new Error('Anonymous auth returned no user ID');

  return data.user.id;
}

/**
 * Returns the current authenticated user's UUID, or null if no session
 * exists yet. Does not create a session — ensureAnonymousSession() runs
 * once during the /demo bootstrap step and the / startup router, so by
 * the time any other screen calls this, a session should already exist.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}
