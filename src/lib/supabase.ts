import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client or throw later if env vars are truly missing at runtime
    // For build time, we just need it to not crash the module evaluation
    console.warn('Supabase credentials missing. Client will be initialized with empty values.');
    return createClient('https://placeholder.supabase.co', 'placeholder');
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return _supabase;
};

// Export as a proxy to maintain compatibility with existing imports
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});

export default supabase;
