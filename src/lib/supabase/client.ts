import { createClient } from "@supabase/supabase-js";

type GlobalSupabase = {
  supabaseBrowserClient?: ReturnType<typeof createClient>;
};

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const globalForSupabase = globalThis as unknown as GlobalSupabase;
  if (!globalForSupabase.supabaseBrowserClient) {
    globalForSupabase.supabaseBrowserClient = createClient(url, anonKey);
  }
  return globalForSupabase.supabaseBrowserClient;
}

