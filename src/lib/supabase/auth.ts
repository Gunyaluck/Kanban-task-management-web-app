import { createClient } from "@supabase/supabase-js";

function getSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getUserIdFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return { userId: null, error: "Missing Authorization Bearer token" } as const;
  }
  const token = m[1]!.trim();
  if (!token) {
    return { userId: null, error: "Missing Authorization Bearer token" } as const;
  }

  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) {
    return { userId: null, error: "Invalid or expired token" } as const;
  }

  return { userId: data.user.id, error: null } as const;
}

