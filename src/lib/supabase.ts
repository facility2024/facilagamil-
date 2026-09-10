import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export function getSupabaseServer(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "Supabase server env vars missing: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.",
    );
  }

  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseServiceKey || "placeholder-key",
  );
}
