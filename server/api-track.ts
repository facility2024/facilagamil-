import { defineEventHandler, getQuery, setResponseHeaders, setResponseStatus, sendRedirect } from "h3";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_KEY || "placeholder",
  );
}

const UNSUBSCRIBE_HTML = `<!DOCTYPE html>
<html><body style="font-family:Arial; text-align:center; padding-top:100px;">
  <h2 style="color:#22c55e;">Cancelamento realizado!</h2>
  <p style="color:#8b93a7;">Voce nao recebera mais nossos emails.</p>
</body></html>`;

const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

export default defineEventHandler(async (event) => {
  const supabase = getSupabase();
  const query = getQuery(event);
  const action = query.action as string | undefined;
  const trackId = query.id as string | undefined;

  if (action === "unsubscribe" && trackId) {
    try {
      await supabase
        .from("email_tracks")
        .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
        .eq("id", trackId);
    } catch {
      // ignore
    }
    setResponseStatus(event, 200);
    setResponseHeaders(event, { "Content-Type": "text/html; charset=utf-8" });
    return UNSUBSCRIBE_HTML;
  }

  if (action === "click" && trackId) {
    const targetUrl = query.url as string | undefined;
    try {
      const { data: existing } = await supabase
        .from("email_tracks")
        .select("clicked_at")
        .eq("id", trackId)
        .single();

      const updateData: Record<string, unknown> = {
        clicked: true,
        clicked_at: existing?.clicked_at || new Date().toISOString(),
      };

      if (existing?.clicked_at) {
        const { data: track } = await supabase
          .from("email_tracks")
          .select("click_count")
          .eq("id", trackId)
          .single();
        updateData.click_count = (track?.click_count || 1) + 1;
      } else {
        updateData.click_count = 1;
      }

      if (targetUrl) {
        updateData.clicked_url = targetUrl;
      }

      await supabase.from("email_tracks").update(updateData).eq("id", trackId);
    } catch {
      // ignore
    }

    if (targetUrl) {
      return sendRedirect(event, targetUrl);
    }
  }

  if (trackId) {
    try {
      const { data: existing } = await supabase
        .from("email_tracks")
        .select("opened_at")
        .eq("id", trackId)
        .single();

      const updateData: Record<string, unknown> = {
        opened: true,
        opened_at: existing?.opened_at || new Date().toISOString(),
      };

      if (existing?.opened_at) {
        const { data: track } = await supabase
          .from("email_tracks")
          .select("open_count")
          .eq("id", trackId)
          .single();
        updateData.open_count = (track?.open_count || 1) + 1;
      } else {
        updateData.open_count = 1;
      }

      await supabase.from("email_tracks").update(updateData).eq("id", trackId);
    } catch {
      // ignore
    }
  }

  setResponseStatus(event, 200);
  setResponseHeaders(event, {
    "Content-Type": "image/gif",
    "Cache-Control": "no-store, no-cache, must-revalidate",
  });
  return TRACKING_PIXEL;
});
