import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isMissingConfig = !supabaseUrl || !supabaseAnonKey
  || supabaseUrl === 'your_supabase_url_here'
  || supabaseAnonKey === 'your_supabase_anon_key_here';

if (isMissingConfig && typeof window !== 'undefined') {
  console.warn(
    '[BriefAI] Supabase env vars are not configured.\n' +
    'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n' +
    'Anonymous auth will be skipped until then.'
  );
}

// Lazy singleton — only created when env vars are real
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  if (isMissingConfig) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
    );
  }
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'briefai:v1:supabase-session',
    },
  });
  return _supabase;
}

// Named export for direct use (throws if not configured)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});

export { isMissingConfig as isSupabaseMisconfigured };
