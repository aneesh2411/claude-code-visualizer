import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In browser context, missing env vars should not throw at module load time.
  // Errors will surface when the client is actually used.
  console.warn('Supabase browser client: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabaseBrowserClient = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
);
