import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Mail,
  Server,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const cardStyle = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "20px",
};

const inputStyle = {
  background: "#0f172a",
  borderColor: "#334155",
  color: "#e2e8f0",
  borderRadius: "14px",
  "--tw-ring-color": "#8b7cf6",
} as React.CSSProperties;

function SettingsPage() {
  const navigate = useNavigate();
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      loadSettings();
    });
  }, [navigate]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSmtpHost(data.settings.smtp_host || "");
        setSmtpPort(data.settings.smtp_port || "465");
        setSmtpUser(data.settings.smtp_user || "");
        setSmtpPassword(data.settings.smtp_password || "");
        setSmtpFromName(data.settings.smtp_from_name || "");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          smtp_user: smtpUser,
          smtp_password: smtpPassword,
          smtp_from_name: smtpFromName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar");
        return;
      }

      setSaved(true);
    } catch {
      setError("Falha na conexao. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#0f172a" }}>
        <Loader2 size={32} className="animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0f172a" }}>
      <div className="mx-auto max-w-[700px] px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/email-marketing" })}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
              style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
            >
              <ArrowLeft size={14} />
              Voltar
            </button>
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Settings size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Configuracoes SMTP</h1>
            </div>
          </div>

          <p className="mb-8 text-sm text-slate-400">
            Configure as credenciais do servidor de email para enviar campanhas.
          </p>

          {/* Alerts */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl border p-4"
              style={{ borderColor: "#166534", background: "#052e16", borderRadius: "20px" }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-green-400" size={20} />
                <div>
                  <p className="font-semibold text-green-400">Configuracoes salvas!</p>
                  <p className="text-sm text-slate-400">As credenciais SMTP foram atualizadas.</p>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl border p-4"
              style={{ borderColor: "#7f1d1d", background: "#450a0a", borderRadius: "20px" }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 text-red-400" size={20} />
                <div>
                  <p className="font-semibold text-red-400">Erro</p>
                  <p className="text-sm text-slate-400">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SMTP Form */}
          <div className="space-y-5">
            {/* Servidor */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7"
              style={cardStyle}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <Server size={16} className="text-white" />
                </div>
                <h2 className="text-[15px] font-semibold text-white">Servidor SMTP</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Host *
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.exemplo.com"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Porta
                  </label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="465"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
              </div>
            </motion.div>

            {/* Credenciais */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7"
              style={cardStyle}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
                >
                  <Key size={16} className="text-white" />
                </div>
                <h2 className="text-[15px] font-semibold text-white">Credenciais</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
              </div>
            </motion.div>

            {/* Remetente */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7"
              style={cardStyle}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <Mail size={16} className="text-white" />
                </div>
                <h2 className="text-[15px] font-semibold text-white">Remetente</h2>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Nome do remetente
                </label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  placeholder="Minha Empresa"
                  className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                  style={inputStyle}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Nome que aparece como remetente dos emails enviados.
                </p>
              </div>
            </motion.div>

            {/* Botao Salvar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving || !smtpHost.trim() || !smtpUser.trim() || !smtpPassword.trim()}
              className="flex w-full items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "16px",
                boxShadow: "0 8px 24px -8px rgba(139, 92, 246, 0.5)",
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar configuracoes
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
