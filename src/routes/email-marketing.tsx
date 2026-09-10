import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  Image,
  Link2,
  MessageCircle,
  UserMinus,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
  LogOut,
  Settings,
  Eye,
  MousePointerClick,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/email-marketing")({
  component: EmailMarketingPage,
});

interface SendResult {
  sent: number;
  failed: number;
  errors?: string[];
}

interface CampaignStat {
  campaign_id: string;
  subject: string;
  sent_at: string;
  total_recipients: number;
  opens: number;
  clicks: number;
}

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

function CardHeader({ icon, iconBg, title }: { icon: React.ReactNode; iconBg: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <h2 className="text-[15px] font-semibold text-white">{title}</h2>
    </div>
  );
}

function EmailMarketingPage() {
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [includeUnsubscribe, setIncludeUnsubscribe] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<CampaignStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate({ to: "/login" });
    });
    fetchStats();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const recipientCount = recipients
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter(Boolean).length;

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/track-stats");
      const data = await res.json();
      if (data.campaigns) setStats(data.campaigns);
    } catch {
      // ignore
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/email-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          subject,
          message,
          bannerUrl,
          imageUrl,
          buttonText,
          buttonLink,
          youtubeUrl,
          whatsappNumber,
          includeUnsubscribe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar");
        return;
      }

      setResult(data);
      fetchStats();
    } catch {
      setError("Falha na conexao. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0f172a" }}>
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div />
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate({ to: "/settings" })}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: "#1e293b",
                  color: "#94a3b8",
                  border: "1px solid #334155",
                }}
              >
                <Settings size={14} />
                Configuracoes
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: "#1e293b",
                  color: "#f87171",
                  border: "1px solid #7f1d1d",
                }}
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8 text-center">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ background: "#1e293b", color: "#8b7cf6", border: "1px solid #334155" }}
            >
              <Mail size={14} />
              Email Marketing
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Disparo de Emails
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Envie emails personalizados para sua lista de contatos
            </p>
          </div>

          {/* Alerts */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl border p-4"
              style={{ borderColor: "#166534", background: "#052e16", borderRadius: "20px" }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-green-400" size={20} />
                <div>
                  <p className="font-semibold text-green-400">Envio concluido!</p>
                  <p className="text-sm text-slate-400">
                    {result.sent} email(s) enviado(s)
                    {result.failed > 0 && ` · ${result.failed} falha(s)`}
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-400">
                      Falhas: {result.errors.join(", ")}
                    </p>
                  )}
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

          {/* Grid Layout */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Destinatarios - full width */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7 sm:col-span-2"
              style={cardStyle}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <Users size={16} className="text-white" />
                </div>
                <h2 className="text-[15px] font-semibold text-white">Destinatarios</h2>
                <span
                  className="ml-auto rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "#1e293b", color: "#8b7cf6", border: "1px solid #4c1d95" }}
                >
                  {recipientCount.toLocaleString("pt-BR")} / 3.000
                </span>
              </div>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder={"email1@exemplo.com\nemail2@exemplo.com\nemail3@exemplo.com"}
                rows={4}
                className="w-full resize-none rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                style={inputStyle}
              />
              <p className="mt-2 text-xs text-slate-500">
                Separe por virgula, ponto-e-virgula ou enter. Maximo 3.000 por envio.
              </p>
            </motion.div>

            {/* Conteudo */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7"
              style={cardStyle}
            >
              <CardHeader
                icon={<FileText size={16} className="text-white" />}
                iconBg="linear-gradient(135deg, #6366f1, #8b5cf6)"
                title="Conteudo"
              />
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Assunto do email *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Novidades da Facility"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Mensagem *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva a mensagem do email aqui..."
                    rows={6}
                    className="w-full resize-none rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
              </div>
            </motion.div>

            {/* Banner + Imagem */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7"
              style={cardStyle}
            >
              <CardHeader
                icon={<Image size={16} className="text-white" />}
                iconBg="linear-gradient(135deg, #a855f7, #6366f1)"
                title="Banner e Imagem"
              />
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Banner principal (topo do email)
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://exemplo.com/banner.jpg"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Imagem que aparece no topo do email marketing.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Imagem do corpo
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
              </div>
            </motion.div>

            {/* Link e Botao */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7"
              style={cardStyle}
            >
              <CardHeader
                icon={<Link2 size={16} className="text-white" />}
                iconBg="linear-gradient(135deg, #6366f1, #8b5cf6)"
                title="Link e Botao"
              />
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Texto do botao
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Ex: Saiba Mais"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Link do botao
                  </label>
                  <input
                    type="url"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="https://exemplo.com"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
              </div>
            </motion.div>

            {/* Redes Sociais */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7"
              style={cardStyle}
            >
              <CardHeader
                icon={<MessageCircle size={16} className="text-white" />}
                iconBg="linear-gradient(135deg, #a855f7, #6366f1)"
                title="Redes Sociais"
              />
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Link do YouTube
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Numero do WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="5511999999999"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Formato: codigo do pais + DDD + numero
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Cancelamento */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl p-7"
              style={cardStyle}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  >
                    <UserMinus size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white">Cancelamento</h2>
                    <p className="text-xs text-slate-500">
                      Link de cancelamento no rodape
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeUnsubscribe(!includeUnsubscribe)}
                  className="relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300"
                  style={{
                    background: includeUnsubscribe ? "#8b7cf6" : "#334155",
                  }}
                >
                  <span
                    className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300"
                    style={{
                      transform: includeUnsubscribe ? "translateX(26px)" : "translateX(4px)",
                    }}
                  />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Botao Enviar */}
          <div className="mt-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={sending || !recipients.trim() || !subject.trim() || !message.trim()}
              className="flex w-full items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "16px",
                boxShadow: "0 8px 24px -8px rgba(139, 92, 246, 0.5)",
              }}
            >
              {sending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Enviar para {recipientCount} destinatario(s)
                </>
              )}
            </motion.button>
          </div>

          {/* Estatisticas inline */}
          <div className="mt-10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <BarChart3 size={16} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">Estatisticas</h2>
              </div>
              <button
                onClick={fetchStats}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
              >
                <RefreshCw size={12} />
                Atualizar
              </button>
            </div>

            {loadingStats ? (
              <div className="rounded-3xl p-8 text-center" style={cardStyle}>
                <Loader2 size={24} className="mx-auto animate-spin text-slate-500" />
                <p className="mt-2 text-sm text-slate-500">Carregando...</p>
              </div>
            ) : stats.length === 0 ? (
              <div className="rounded-3xl p-8 text-center" style={cardStyle}>
                <p className="text-sm text-slate-500">Nenhuma campanha enviada ainda.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((s) => {
                  const openRate = s.total_recipients > 0 ? ((s.opens / s.total_recipients) * 100).toFixed(1) : "0";
                  const clickRate = s.total_recipients > 0 ? ((s.clicks / s.total_recipients) * 100).toFixed(1) : "0";
                  return (
                    <div
                      key={s.campaign_id}
                      className="rounded-3xl p-5"
                      style={cardStyle}
                    >
                      <h3 className="mb-3 truncate text-sm font-semibold text-white">
                        {s.subject}
                      </h3>
                      <p className="mb-3 text-xs text-slate-500">
                        {new Date(s.sent_at).toLocaleDateString("pt-BR")} · {s.total_recipients} destinatarios
                      </p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <Eye size={14} className="text-blue-400" />
                          <span className="text-sm font-semibold text-white">{openRate}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MousePointerClick size={14} className="text-purple-400" />
                          <span className="text-sm font-semibold text-white">{clickRate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
