import { defineEventHandler } from "h3";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return { error: "SUPABASE_URL or SUPABASE_SERVICE_KEY not set", url: !!url, key: !!key };
  }

  const supabase = createClient(url, key);

  const results: Record<string, unknown> = {};

  // Test each table
  for (const table of ["email_campaigns", "email_tracks", "user_settings"]) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        results[table] = { exists: false, error: error.message, code: error.code };
      } else {
        results[table] = { exists: true, rowCount: data?.length || 0 };
      }
    } catch (err: unknown) {
      results[table] = { exists: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return { url, keyPreview: key.substring(0, 10) + "...", tables: results };
});
