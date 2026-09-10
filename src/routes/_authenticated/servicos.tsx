import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PrimaryButton } from "@/components/app-shell";
import { EmptyState, Panel, PanelHeader } from "@/components/ui-kit";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDelete, ServiceDialog } from "@/components/forms";
import { useRemove, useServices } from "@/lib/api";
import type { Service } from "@/lib/domain";
import { formatCurrency, plainText } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Augusto.dev Manager" },
      { name: "description", content: "Catálogo de serviços e preços de referência." },
      { property: "og:title", content: "Serviços — Augusto.dev Manager" },
      { property: "og:description", content: "Catálogo de serviços e preços de referência." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const services = useServices();
  const remove = useRemove("services");
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Service | null>(null);

  const rows = services.data ?? [];

  return (
    <AppShell
      title="Serviços"
      subtitle="Preços de referência para novos orçamentos"
      actions={
        <PrimaryButton
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Novo serviço
        </PrimaryButton>
      }
    >
      <Panel>
        <PanelHeader title="Catálogo" subtitle={`${rows.length} serviço(s)`} />
        {services.isLoading ? (
          <EmptyState message="Carregando…" />
        ) : rows.length === 0 ? (
          <EmptyState message="Nenhum serviço cadastrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-edge/50 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  <th className="px-4 py-2.5 font-normal">Serviço</th>
                  <th className="px-4 py-2.5 font-normal">Categoria</th>
                  <th className="px-4 py-2.5 font-normal">Unidade</th>
                  <th className="px-4 py-2.5 font-normal">Situação</th>
                  <th className="px-4 py-2.5 text-right font-normal">Preço padrão</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/40">
                {rows.map((service) => (
                  <tr key={service.id} className="transition-colors hover:bg-panel2/50">
                    <td className="px-4 py-2.5">
                      <p className="text-[13px] text-cream">{plainText(service.name, 80)}</p>
                      {service.description ? (
                        <p className="mt-0.5 font-mono text-[11px] text-faint">
                          {plainText(service.description, 90)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-mute">
                      {plainText(service.category, 40) || "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-mute">
                      {plainText(service.unit, 30) || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        label={service.active ? "Ativo" : "Inativo"}
                        tone={service.active ? "mint" : "faint"}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] text-gold">
                      {formatCurrency(Number(service.default_price))}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          aria-label="Editar serviço"
                          onClick={() => {
                            setEditing(service);
                            setOpen(true);
                          }}
                          className="rounded p-1.5 text-faint transition-colors hover:text-cream"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          aria-label="Excluir serviço"
                          onClick={() => setDeleting(service)}
                          className="rounded p-1.5 text-faint transition-colors hover:text-red"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <ServiceDialog open={open} onOpenChange={setOpen} service={editing} />

      <ConfirmDelete
        open={deleting !== null}
        onOpenChange={(value) => !value && setDeleting(null)}
        title="Excluir serviço"
        description="O serviço sai do catálogo. Projetos já criados mantêm seus valores."
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => toast.success("Serviço excluído"),
            onError: () => toast.error("Não foi possível excluir o serviço"),
          });
          setDeleting(null);
        }}
      />
    </AppShell>
  );
}
