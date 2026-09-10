import { defineEventHandler, readBody } from "h3";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_KEY || "placeholder",
  );
}

export default defineEventHandler(async (event) => {
  const supabase = getSupabase();
  const method = event.method;

  if (method === "GET") {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return { error: error.message };
    }

    return { settings: data || null };
  }

  if (method === "POST") {
    const body = await readBody(event);

    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("user_settings")
        .update({
          smtp_host: body.smtp_host || "",
          smtp_port: body.smtp_port || "465",
          smtp_user: body.smtp_user || "",
          smtp_password: body.smtp_password || "",
          smtp_from_name: body.smtp_from_name || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("user_settings")
        .insert({
          smtp_host: body.smtp_host || "",
          smtp_port: body.smtp_port || "465",
          smtp_user: body.smtp_user || "",
          smtp_password: body.smtp_password || "",
          smtp_from_name: body.smtp_from_name || "",
        });

      if (error) return { error: error.message };
    }

    return { success: true };
  }

  return { error: "Method not allowed" };
});
