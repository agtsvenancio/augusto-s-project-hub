import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projetos", label: "Projetos" },
  { to: "/producao", label: "Produção" },
  { to: "/manutencoes", label: "Manutenções" },
  { to: "/clientes", label: "Clientes" },
  { to: "/servicos", label: "Serviços" },
  { to: "/financeiro", label: "Financeiro" },
  { to: "/relatorios", label: "Relatórios" },
  { to: "/configuracoes", label: "Configurações" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex-1 space-y-0.5 px-3 py-4 text-sm">
      {navItems.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 transition-transform",
              active
                ? "bg-panel text-cream ring-1 ring-cream/5"
                : "text-mute hover:translate-x-0.5 hover:text-cream",
            )}
          >
            <span className={cn("size-1.5 rounded-full", active ? "bg-gold" : "bg-edge")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-ink text-cream">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-edge/70 bg-surface/60 lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-edge/60 px-5">
          <div className="grid size-7 place-items-center rounded-md bg-cream text-sm font-semibold text-ink">A</div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold tracking-tight">Augusto.dev</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Manager</p>
          </div>
        </div>
        <NavLinks />
        <div className="border-t border-edge/60 p-3">
          <button
            onClick={handleSignOut}
            className="w-full rounded-md px-3 py-2 text-left font-mono text-[11px] text-faint transition-colors hover:text-cream"
          >
            Sair da conta
          </button>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink/80" onClick={() => setOpen(false)} />
          <aside className="relative flex w-64 flex-col border-r border-edge/70 bg-surface">
            <div className="flex h-16 items-center justify-between border-b border-edge/60 px-5">
              <p className="text-[13px] font-semibold">Augusto.dev</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu">
                <X className="size-4 text-mute" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="border-t border-edge/60 p-3">
              <button
                onClick={handleSignOut}
                className="w-full rounded-md px-3 py-2 text-left font-mono text-[11px] text-faint"
              >
                Sair da conta
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-edge/60 bg-surface/40 px-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="size-5 text-mute" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
              {subtitle ? <p className="mt-0.5 truncate font-mono text-[11px] text-faint">{subtitle}</p> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </header>
        <div className="space-y-5 px-4 py-5 lg:px-8 lg:py-6">{children}</div>
      </main>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-9 rounded-md bg-cream px-3 text-[13px] font-medium text-ink ring-1 ring-cream/40 transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-9 rounded-md bg-panel2 px-3 font-mono text-[11px] text-mute ring-1 ring-edge/70 transition-colors hover:text-cream disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
