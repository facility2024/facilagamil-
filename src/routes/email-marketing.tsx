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

function EmailMarketingPage() {
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [includeUnsubscribe, setIncludeUnsubscribe] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate({ to: "/login" });
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const recipientCount = recipients
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter(Boolean).length;

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
    } catch {
      setError("Falha na conexao. Tente novamente.");
    } finally {
      setSending(false);
    }
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
              <div />
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
              <Mail size={14} />
              Email Marketing
            </div>
            <h1
              className="font-heading text-3xl italic tracking-tight sm:text-4xl"
              style={{ color: "#1e2233" }}
            >
              Disparo de Emails
            </h1>
            <p className="mt-2" style={{ color: "#8b93a7" }}>
              Envie emails personalizados para sua lista de contatos
            </p>
            <a
              href="/email-marketing-stats"
              className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6ea8fe, #8b7cf6)",
                color: "#fff",
                boxShadow: "0 4px 12px -2px rgba(139, 124, 246, 0.4)",
              }}
            >
              <BarChart3 size={14} />
              Ver estatisticas
            </a>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl border p-4"
              style={{ borderColor: "#86efac", background: "#f0fdf4", borderRadius: "20px" }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-green-500" size={20} />
                <div>
                  <p className="font-semibold text-green-600">Envio concluido!</p>
                  <p className="text-sm" style={{ color: "#8b93a7" }}>
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
              style={{ borderColor: "#fca5a5", background: "#fef2f2", borderRadius: "20px" }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 text-red-500" size={20} />
                <div>
                  <p className="font-semibold text-red-600">Erro</p>
                  <p className="text-sm" style={{ color: "#8b93a7" }}>
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-5">
            {/* Destinatarios */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white p-7"
              style={{
                boxShadow: "0 10px 40px -12px rgba(124, 111, 240, 0.15)",
                border: "1px solid #e7ebf5",
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #8ec5fc, #a5d8ff)" }}
                >
                  <Users size={16} style={{ color: "#fff" }} />
                </div>
                <h2 className="text-[15px] font-semibold" style={{ color: "#1e2233" }}>
                  Destinatarios
                </h2>
                <span
                  className="ml-auto rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #e0e7ff, #ede9fe)",
                    color: "#7c6ff0",
                  }}
                >
                  {recipientCount.toLocaleString("pt-BR")} / 3.000
                </span>
              </div>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder={"email1@exemplo.com\nemail2@exemplo.com\nemail3@exemplo.com"}
                rows={5}
                className="w-full resize-none rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                style={
                  {
                    background: "#f5f7ff",
                    borderColor: "#e7ebf5",
                    color: "#1e2233",
                    borderRadius: "14px",
                    "--tw-ring-color": "#8b7cf6",
                  } as React.CSSProperties
                }
              />
              <p className="mt-2 text-xs" style={{ color: "#8b93a7" }}>
                Separe por virgula, ponto-e-virgula ou enter. Maximo 3.000 por envio.
              </p>
            </motion.div>

            {/* Conteudo */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white p-7"
              style={{
                boxShadow: "0 10px 40px -12px rgba(124, 111, 240, 0.15)",
                border: "1px solid #e7ebf5",
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #8ec5fc, #a5d8ff)" }}
                >
                  <FileText size={16} style={{ color: "#fff" }} />
                </div>
                <h2 className="text-[15px] font-semibold" style={{ color: "#1e2233" }}>
                  Conteudo
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: "#1e2233" }}
                  >
                    Assunto do email *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Novidades da Facility"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={
                      {
                        background: "#f5f7ff",
                        borderColor: "#e7ebf5",
                        color: "#1e2233",
                        borderRadius: "14px",
                        "--tw-ring-color": "#8b7cf6",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: "#1e2233" }}
                  >
                    Mensagem *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva a mensagem do email aqui..."
                    rows={8}
                    className="w-full resize-none rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={
                      {
                        background: "#f5f7ff",
                        borderColor: "#e7ebf5",
                        color: "#1e2233",
                        borderRadius: "14px",
                        "--tw-ring-color": "#8b7cf6",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            </motion.div>

            {/* Imagem */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white p-7"
              style={{
                boxShadow: "0 10px 40px -12px rgba(124, 111, 240, 0.15)",
                border: "1px solid #e7ebf5",
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #c4b5fd, #a78bfa)" }}
                >
                  <Image size={16} style={{ color: "#fff" }} />
                </div>
                <h2 className="text-[15px] font-semibold" style={{ color: "#1e2233" }}>
                  Imagem
                </h2>
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "#1e2233" }}
                >
                  URL da imagem
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                  style={
                    {
                      background: "#f5f7ff",
                      borderColor: "#e7ebf5",
                      color: "#1e2233",
                      borderRadius: "14px",
                      "--tw-ring-color": "#8b7cf6",
                    } as React.CSSProperties
                  }
                />
                <p className="mt-1 text-xs" style={{ color: "#8b93a7" }}>
                  Insira a URL de uma imagem hospedada. Ela aparecera no corpo do email.
                </p>
              </div>
            </motion.div>

            {/* Link e Botao */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white p-7"
              style={{
                boxShadow: "0 10px 40px -12px rgba(124, 111, 240, 0.15)",
                border: "1px solid #e7ebf5",
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #8ec5fc, #a5d8ff)" }}
                >
                  <Link2 size={16} style={{ color: "#fff" }} />
                </div>
                <h2 className="text-[15px] font-semibold" style={{ color: "#1e2233" }}>
                  Link e Botao
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: "#1e2233" }}
                  >
                    Texto do botao
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Ex: Saiba Mais"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={
                      {
                        background: "#f5f7ff",
                        borderColor: "#e7ebf5",
                        color: "#1e2233",
                        borderRadius: "14px",
                        "--tw-ring-color": "#8b7cf6",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: "#1e2233" }}
                  >
                    Link do botao
                  </label>
                  <input
                    type="url"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="https://exemplo.com"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={
                      {
                        background: "#f5f7ff",
                        borderColor: "#e7ebf5",
                        color: "#1e2233",
                        borderRadius: "14px",
                        "--tw-ring-color": "#8b7cf6",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            </motion.div>

            {/* Redes Sociais */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white p-7"
              style={{
                boxShadow: "0 10px 40px -12px rgba(124, 111, 240, 0.15)",
                border: "1px solid #e7ebf5",
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #c4b5fd, #a78bfa)" }}
                >
                  <MessageCircle size={16} style={{ color: "#fff" }} />
                </div>
                <h2 className="text-[15px] font-semibold" style={{ color: "#1e2233" }}>
                  Redes Sociais
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: "#1e2233" }}
                  >
                    Link do YouTube
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={
                      {
                        background: "#f5f7ff",
                        borderColor: "#e7ebf5",
                        color: "#1e2233",
                        borderRadius: "14px",
                        "--tw-ring-color": "#8b7cf6",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    style={{ color: "#1e2233" }}
                  >
                    Numero do WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="5511999999999"
                    className="w-full rounded-xl border px-4 py-3 text-sm placeholder:italic focus:outline-none focus:ring-2"
                    style={
                      {
                        background: "#f5f7ff",
                        borderColor: "#e7ebf5",
                        color: "#1e2233",
                        borderRadius: "14px",
                        "--tw-ring-color": "#8b7cf6",
                      } as React.CSSProperties
                    }
                  />
                  <p className="mt-1 text-xs" style={{ color: "#8b93a7" }}>
                    Formato: codigo do pais + DDD + numero
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Cancelamento */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white p-7"
              style={{
                boxShadow: "0 10px 40px -12px rgba(124, 111, 240, 0.15)",
                border: "1px solid #e7ebf5",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg, #8ec5fc, #a5d8ff)" }}
                  >
                    <UserMinus size={16} style={{ color: "#fff" }} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold" style={{ color: "#1e2233" }}>
                      Cancelamento
                    </h2>
                    <p className="text-xs" style={{ color: "#8b93a7" }}>
                      Incluir link de cancelamento no rodape do email
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeUnsubscribe(!includeUnsubscribe)}
                  className="relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300"
                  style={{
                    background: includeUnsubscribe
                      ? "linear-gradient(135deg, #6ea8fe, #8b7cf6)"
                      : "#e7ebf5",
                    boxShadow: includeUnsubscribe
                      ? "0 4px 12px -2px rgba(139, 124, 246, 0.4)"
                      : "none",
                  }}
                >
                  <span
                    className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300"
                    style={{
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      transform: includeUnsubscribe ? "translateX(26px)" : "translateX(4px)",
                    }}
                  />
                </button>
              </div>
            </motion.div>

            {/* Botao Enviar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={sending || !recipients.trim() || !subject.trim() || !message.trim()}
              className="flex w-full items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #6ea8fe, #8b7cf6)",
                borderRadius: "16px",
                boxShadow: "0 8px 24px -8px rgba(139, 124, 246, 0.5)",
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
        </motion.div>
      </div>
    </div>
  );
}
