import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Mail,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/email-marketing-stats")({
  component: EmailMarketingStatsPage,
});

interface CampaignStat {
  campaign_id: string;
  subject: string;
  sent_at: string;
  total_recipients: number;
  opens: number;
  unique_opens: number;
  clicks: number;
  unique_clicks: number;
}

function EmailMarketingStatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      fetchStats();
    });
  }, [navigate]);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/track-stats");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao carregar estatisticas");
      } else {
        setStats(data.campaigns || []);
      }
    } catch {
      setError("Falha na conexao");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #eef4ff 0%, #f5eeff 50%, #f8faff 100%)",
      }}
    >
      <div className="mx-auto max-w-[760px] px-4 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-10 text-center">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => navigate({ to: "/email-marketing" })}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: "#f5f7ff",
                  color: "#8b7cf6",
                  border: "1px solid #e7ebf5",
                }}
              >
                <ArrowLeft size={14} />
                Voltar
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                }}
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                background: "linear-gradient(135deg, #e0e7ff, #ede9fe)",
                color: "#7c6ff0",
              }}
            >
              <BarChart3 size={14} />
              Estatisticas
            </div>
            <h1
              className="font-heading text-3xl italic tracking-tight sm:text-4xl"
              style={{ color: "#1e2233" }}
            >
              Estatisticas de Envio
            </h1>
            <p className="mt-2" style={{ color: "#8b93a7" }}>
              Acompanhe aberturas e cliques das suas campanhas
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: "#8b7cf6" }} />
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl border p-4"
              style={{ borderColor: "#fca5a5", background: "#fef2f2", borderRadius: "20px" }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 text-red-500" size={20} />
                <div>
                  <p className="font-semibold text-red-600">Erro</p>
                  <p className="text-sm" style={{ color: "#8b93a7" }}>
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && !error && stats.length === 0 && (
            <div className="py-20 text-center">
              <Mail size={48} style={{ color: "#c4b5fd", margin: "0 auto 16px" }} />
              <p className="font-semibold" style={{ color: "#1e2233" }}>
                Nenhuma campanha encontrada
              </p>
              <p className="mt-1 text-sm" style={{ color: "#8b93a7" }}>
                Envie seu primeiro email e volte aqui para acompanhar os resultados.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.campaign_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-3xl bg-white p-6"
                style={{
                  boxShadow: "0 10px 40px -12px rgba(124, 111, 240, 0.15)",
                  border: "1px solid #e7ebf5",
                }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "#1e2233" }}>
                      {s.subject}
                    </h3>
                    <p className="mt-1 text-xs" style={{ color: "#8b93a7" }}>
                      Enviado em{" "}
                      {new Date(s.sent_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #e0e7ff, #ede9fe)",
                      color: "#7c6ff0",
                    }}
                  >
                    {s.total_recipients} destinatarios
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
                  >
                    <Eye size={18} className="mx-auto mb-1" style={{ color: "#0ea5e9" }} />
                    <p className="text-lg font-bold" style={{ color: "#0c4a6e" }}>
                      {s.unique_opens}
                    </p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      Aberturas unicas
                    </p>
                    <p className="mt-0.5 text-xs font-medium" style={{ color: "#0ea5e9" }}>
                      {s.total_recipients > 0
                        ? ((s.unique_opens / s.total_recipients) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: "#f0fdf4", border: "1px solid #86efac" }}
                  >
                    <MousePointerClick
                      size={18}
                      className="mx-auto mb-1"
                      style={{ color: "#22c55e" }}
                    />
                    <p className="text-lg font-bold" style={{ color: "#14532d" }}>
                      {s.unique_clicks}
                    </p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      Cliques unicos
                    </p>
                    <p className="mt-0.5 text-xs font-medium" style={{ color: "#22c55e" }}>
                      {s.unique_opens > 0
                        ? ((s.unique_clicks / s.unique_opens) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: "#fefce8", border: "1px solid #fde047" }}
                  >
                    <AlertTriangle
                      size={18}
                      className="mx-auto mb-1"
                      style={{ color: "#eab308" }}
                    />
                    <p className="text-lg font-bold" style={{ color: "#713f12" }}>
                      {s.total_recipients - s.unique_opens}
                    </p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      Nao abriu
                    </p>
                    <p className="mt-0.5 text-xs font-medium" style={{ color: "#eab308" }}>
                      {s.total_recipients > 0
                        ? (
                            ((s.total_recipients - s.unique_opens) / s.total_recipients) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
