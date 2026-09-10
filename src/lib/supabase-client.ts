import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase env vars missing: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set at build time.",
    );
  }

  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key",
  );
}

export const supabase = createSupabaseClient();
