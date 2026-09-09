import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/ui-kit";
import { PrimaryButton } from "@/components/app-shell";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Augusto.dev Manager" },
      { name: "description", content: "Acesso restrito ao painel de controle Augusto.dev Manager." },
      { property: "og:title", content: "Entrar — Augusto.dev Manager" },
      { property: "og:description", content: "Acesso restrito ao painel de controle Augusto.dev Manager." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(255),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
        if (signInError) {
          setError("E-mail ou senha incorretos. Verifique e tente novamente.");
          return;
        }
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          ...parsed.data,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) {
          setError(
            signUpError.message.includes("registered")
              ? "Este e-mail já possui uma conta. Faça login."
              : "Não foi possível criar a conta. Tente novamente.",
          );
          return;
        }
        if (data.session) {
          navigate({ to: "/dashboard", replace: true });
        } else {
          setInfo("Conta criada. Confirme o e-mail enviado para ativar o acesso.");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-10">
      <div className="spec w-full max-w-sm rounded-lg bg-panel p-7 ring-1 ring-cream/5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-md bg-cream text-sm font-semibold text-ink">A</div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-cream">Augusto.dev</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Manager</p>
          </div>
        </div>

        <h1 className="mt-7 text-lg font-semibold tracking-tight text-cream">
          {mode === "login" ? "Entrar no painel" : "Criar acesso de administrador"}
        </h1>
        <p className="mt-1 font-mono text-[11px] text-faint">
          Área restrita · controle de projetos e faturamento
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="E-mail">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className="h-10 w-full rounded-md bg-panel2 px-3 text-sm text-cream outline-none ring-1 ring-edge/70 focus:ring-gold/60"
              placeholder="voce@exemplo.com"
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={72}
              className="h-10 w-full rounded-md bg-panel2 px-3 text-sm text-cream outline-none ring-1 ring-edge/70 focus:ring-gold/60"
              placeholder="••••••••"
            />
          </Field>

          {error ? (
            <p className="rounded-md bg-red/10 px-3 py-2 font-mono text-[11px] text-red ring-1 ring-red/20">{error}</p>
          ) : null}
          {info ? (
            <p className="rounded-md bg-mint/10 px-3 py-2 font-mono text-[11px] text-mint ring-1 ring-mint/20">{info}</p>
          ) : null}

          <PrimaryButton type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" /> Entrando…
              </span>
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Criar conta"
            )}
          </PrimaryButton>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
          className="mt-5 w-full text-center font-mono text-[11px] text-faint transition-colors hover:text-cream"
        >
          {mode === "login" ? "Primeiro acesso? Criar conta de administrador" : "Já tenho conta — entrar"}
        </button>
      </div>
    </div>
  );
}
