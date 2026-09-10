import { defineEventHandler, setResponseStatus } from "h3";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_KEY || "placeholder",
  );
}

export default defineEventHandler(async (event) => {
  const supabase = getSupabase();

  try {
    const { data: campaigns, error } = await supabase
      .from("email_campaigns")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50);

    if (error) {
      setResponseStatus(event, 500);
      return { error: error.message };
    }

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

    return { campaigns: campaignsWithStats };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao buscar estatisticas";
    setResponseStatus(event, 500);
    return { error: msg };
  }
});
