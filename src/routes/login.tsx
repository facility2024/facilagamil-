import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email ou senha invalidos"
          : authError.message,
      );
      setLoading(false);
      return;
    }

    navigate({ to: "/email-marketing" });
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #eef4ff 0%, #f5eeff 50%, #f8faff 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "linear-gradient(135deg, #e0e7ff, #ede9fe)",
              color: "#7c6ff0",
            }}
          >
            <Lock size={14} />
            Acesso Restrito
          </div>
          <h1
            className="font-heading text-3xl italic tracking-tight"
            style={{ color: "#1e2233" }}
          >
            Entrar
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8b93a7" }}>
            Faca login para acessar o painel de email marketing
          </p>
        </div>

        <motion.form
          onSubmit={handleLogin}
          className="rounded-3xl bg-white p-8"
          style={{
            boxShadow: "0 10px 40px -12px rgba(124, 111, 240, 0.15)",
            border: "1px solid #e7ebf5",
          }}
        >
          {error && (
            <div
              className="mb-4 flex items-center gap-2 rounded-xl p-3 text-sm"
              style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1e2233" }}>
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#8b93a7" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm placeholder:italic focus:outline-none focus:ring-2"
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

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1e2233" }}>
              Senha
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#8b93a7" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm placeholder:italic focus:outline-none focus:ring-2"
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

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !email || !password}
            className="flex w-full items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #6ea8fe, #8b7cf6)",
              borderRadius: "14px",
              boxShadow: "0 8px 24px -8px rgba(139, 124, 246, 0.5)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Entrar
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
