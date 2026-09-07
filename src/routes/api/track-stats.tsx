import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServer } from "@/lib/supabase";

export const Route = createFileRoute("/api/track-stats")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = getSupabaseServer();

        try {
          const { data: campaigns, error } = await supabase
            .from("email_campaigns")
            .select("*")
            .order("sent_at", { ascending: false })
            .limit(50);

          if (error) throw error;

          const campaignsWithStats = await Promise.all(
            (campaigns || []).map(async (campaign) => {
              const { data: tracks } = await supabase
                .from("email_tracks")
                .select("opened, clicked, unsubscribed")
                .eq("campaign_id", campaign.id);

              const totalRecipients = campaign.total_recipients || tracks?.length || 0;
              const opens = tracks?.filter((t) => t.opened).length || 0;
              const clicks = tracks?.filter((t) => t.clicked).length || 0;
              const unsubs = tracks?.filter((t) => t.unsubscribed).length || 0;

              return {
                campaign_id: campaign.id,
                subject: campaign.subject,
                sent_at: campaign.sent_at,
                total_recipients: totalRecipients,
                opens,
                unique_opens: opens,
                clicks,
                unique_clicks: clicks,
                unsubscribes: unsubs,
              };
            }),
          );

          return new Response(JSON.stringify({ campaigns: campaignsWithStats }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Erro ao buscar estatisticas";
          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
