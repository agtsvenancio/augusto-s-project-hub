import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, GhostButton, PrimaryButton } from "@/components/app-shell";
import { Panel, PanelHeader } from "@/components/ui-kit";
import { useDemoData } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Augusto.dev Manager" },
      { name: "description", content: "Conta e dados de demonstração." },
      { property: "og:title", content: "Configurações — Augusto.dev Manager" },
      { property: "og:description", content: "Conta e dados de demonstração." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const { seed, clear } = useDemoData();

  return (
    <AppShell title="Configurações" subtitle="Conta e dados">
      <Panel>
        <PanelHeader title="Conta" />
        <p className="px-4 py-4 font-mono text-[12px] text-mute">Conectado como {user.email}</p>
      </Panel>
      <Panel spec>
        <PanelHeader title="Dados de demonstração" subtitle="Exemplos fictícios para conhecer o sistema" />
        <div className="flex flex-wrap gap-2 p-4">
          <PrimaryButton
            disabled={seed.isPending}
            onClick={() => seed.mutate(undefined, { onSuccess: () => toast.success("Dados de exemplo carregados"), onError: () => toast.error("Falha ao carregar exemplos") })}
          >
            Carregar exemplos
          </PrimaryButton>
          <GhostButton
            disabled={clear.isPending}
            onClick={() => clear.mutate(undefined, { onSuccess: () => toast.success("Exemplos removidos"), onError: () => toast.error("Falha ao remover exemplos") })}
          >
            Remover exemplos
          </GhostButton>
        </div>
        <p className="px-4 pb-4 font-mono text-[11px] text-faint">Remover exemplos apaga apenas os dados fictícios; seus cadastros reais ficam intactos.</p>
      </Panel>
    </AppShell>
  );
}
