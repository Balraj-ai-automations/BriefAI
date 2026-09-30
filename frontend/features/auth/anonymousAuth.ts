import { supabase } from '@/lib/supabase';

/**
 * Ensures a valid Supabase Auth session exists.
 *
 * - Restores an existing session if one exists.
 * - Creates a new anonymous session only when no session exists.
 * - Never creates a fake/local user ID.
 */
export async function ensureAnonymousSession(): Promise<string> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log(
    '[BriefAI] ensureAnonymousSession - existing session user ID:',
    session?.user?.id ?? 'NONE'
  );

  if (sessionError) {
    console.warn(
      '[BriefAI] Error checking Supabase session:',
      sessionError.message
    );
  }

  // Existing session — reuse the SAME user ID.
  if (session?.user?.id) {
    console.log(
      '[BriefAI] Reusing existing Supabase user:',
      session.user.id
    );

    return session.user.id;
  }

  // No session — create one.
  console.log(
    '[BriefAI] No Supabase session found. Creating anonymous session...'
  );

  const {
    data,
    error,
  } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error(
      '[BriefAI] Anonymous authentication failed:',
      error.message
    );

    throw new Error(
      `Anonymous auth failed: ${error.message}`
    );
  }

  if (!data.user?.id) {
    console.error(
      '[BriefAI] Anonymous auth returned no user ID.'
    );

    throw new Error(
      'Anonymous auth returned no user ID'
    );
  }

  console.log(
    '[BriefAI] Created new anonymous Supabase user:',
    data.user.id
  );

  return data.user.id;
}

/**
 * Returns the current authenticated user's UUID.
 *
 * This function DOES NOT create a session.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  console.log(
    '[BriefAI] getCurrentUserId - user ID:',
    session?.user?.id ?? 'NONE'
  );

  console.log(
    '[BriefAI] getCurrentUserId - session exists:',
    !!session
  );

  if (error) {
    console.warn(
      '[BriefAI] getCurrentUserId - session error:',
      error.message
    );
  }

  return session?.user?.id ?? null;
}