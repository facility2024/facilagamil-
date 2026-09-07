import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServer } from "@/lib/supabase";

export const Route = createFileRoute("/api/track")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const trackId = url.searchParams.get("id");
        const action = url.searchParams.get("action");

        if (!trackId) {
          return new Response(null, { status: 400 });
        }

        const supabase = getSupabaseServer();

        if (action === "unsubscribe") {
          try {
            await supabase
              .from("email_tracks")
              .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
              .eq("id", trackId);
          } catch {
            // ignore
          }
          return new Response(
            `<html><body style="font-family:Arial; text-align:center; padding-top:100px;">
              <h2 style="color:#22c55e;">Cancelamento realizado!</h2>
              <p style="color:#8b93a7;">Voce nao recebera mais nossos emails.</p>
            </body></html>`,
            { status: 200, headers: { "Content-Type": "text/html" } },
          );
        }

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
          // ignore tracking errors
        }

        // Return 1x1 transparent pixel
        const pixel = Buffer.from(
          "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          "base64",
        );

        return new Response(pixel, {
          status: 200,
          headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        });
      },

      POST: async ({ request }: { request: Request }) => {
        const supabase = getSupabaseServer();
        const body = await request.json();
        const { trackId, clickedUrl } = body;

        if (!trackId) {
          return new Response(JSON.stringify({ error: "Missing trackId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const { data: existing } = await supabase
            .from("email_tracks")
            .select("clicked_at")
            .eq("id", trackId)
            .single();

          const updateData: Record<string, unknown> = {
            clicked: true,
            clicked_at: existing?.clicked_at || new Date().toISOString(),
            clicked_url: clickedUrl || null,
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

          await supabase.from("email_tracks").update(updateData).eq("id", trackId);
        } catch {
          // ignore
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
