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
  RefreshCw,
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

const cardStyle = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "20px",
};

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
    <div className="min-h-screen" style={{ background: "#0f172a" }}>
      <div className="mx-auto max-w-[900px] px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate({ to: "/email-marketing" })}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:scale-105"
              style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
            >
              <ArrowLeft size={14} />
              Voltar
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:scale-105"
              style={{ background: "#1e293b", color: "#f87171", border: "1px solid #7f1d1d" }}
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>

          {/* Title */}
          <div className="mb-8 text-center">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ background: "#1e293b", color: "#8b7cf6", border: "1px solid #334155" }}
            >
              <BarChart3 size={14} />
              Relatorio
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Estatisticas de Envio
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Acompanhe aberturas e cliques das suas campanhas
            </p>
          </div>

          {/* Refresh */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
              style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>

          {/* Loading */}
          {loading && stats.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-slate-500" />
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl border p-4"
              style={{ borderColor: "#7f1d1d", background: "#450a0a", borderRadius: "20px" }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 text-red-400" size={20} />
                <div>
                  <p className="font-semibold text-red-400">Erro</p>
                  <p className="text-sm text-slate-400">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty */}
          {!loading && !error && stats.length === 0 && (
            <div className="rounded-3xl py-20 text-center" style={cardStyle}>
              <Mail size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="font-semibold text-white">Nenhuma campanha encontrada</p>
              <p className="mt-1 text-sm text-slate-500">
                Envie seu primeiro email e volte aqui para acompanhar os resultados.
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((s, i) => (
              <motion.div
                key={s.campaign_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-3xl p-6"
                style={cardStyle}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-white">
                      {s.subject}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
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
                    className="ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: "#0f172a", color: "#8b7cf6", border: "1px solid #4c1d95" }}
                  >
                    {s.total_recipients} destinatarios
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl p-3 text-center" style={{ background: "#0f172a", border: "1px solid #1e3a5f" }}>
                    <Eye size={16} className="mx-auto mb-1 text-blue-400" />
                    <p className="text-lg font-bold text-white">{s.unique_opens}</p>
                    <p className="text-xs text-slate-500">Aberturas</p>
                    <p className="mt-0.5 text-xs font-medium text-blue-400">
                      {s.total_recipients > 0
                        ? ((s.unique_opens / s.total_recipients) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>

                  <div className="rounded-xl p-3 text-center" style={{ background: "#0f172a", border: "1px solid #14532d" }}>
                    <MousePointerClick size={16} className="mx-auto mb-1 text-green-400" />
                    <p className="text-lg font-bold text-white">{s.unique_clicks}</p>
                    <p className="text-xs text-slate-500">Cliques</p>
                    <p className="mt-0.5 text-xs font-medium text-green-400">
                      {s.unique_opens > 0
                        ? ((s.unique_clicks / s.unique_opens) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>

                  <div className="rounded-xl p-3 text-center" style={{ background: "#0f172a", border: "1px solid #713f12" }}>
                    <AlertTriangle size={16} className="mx-auto mb-1 text-yellow-400" />
                    <p className="text-lg font-bold text-white">
                      {s.total_recipients - s.unique_opens}
                    </p>
                    <p className="text-xs text-slate-500">Nao abriu</p>
                    <p className="mt-0.5 text-xs font-medium text-yellow-400">
                      {s.total_recipients > 0
                        ? (
                            ((s.total_recipients - s.unique_opens) / s.total_recipients) *
                            100
                          ).toFixed(1)
                        : 0}%
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
