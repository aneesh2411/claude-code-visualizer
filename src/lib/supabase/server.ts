import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase server client: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseServerClient = createClient(
  supabaseUrl ?? '',
  supabaseServiceRoleKey ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
