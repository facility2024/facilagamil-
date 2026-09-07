import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "SUA_URL_SUPABASE_AQUI";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "SUA_SERVICE_KEY_AQUI";

export function getSupabaseServer() {
  return createClient(supabaseUrl, supabaseServiceKey);
}
