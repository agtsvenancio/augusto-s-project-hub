import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PrimaryButton } from "@/components/app-shell";
import { EmptyState, Panel, PanelHeader } from "@/components/ui-kit";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDelete, MaintenanceDialog, PaymentDialog, SelectInput } from "@/components/forms";
import { useClients, useMaintenances, usePayments, useProjects, useRemove, useServices } from "@/lib/api";
import {
  enumOptions,
  financialStatusLabels,
  financialStatusTone,
  maintenanceStatusLabels,
  maintenanceStatusTone,
  maintenanceTypeLabels,
  type Maintenance,
} from "@/lib/domain";
import { formatCurrency, formatDate, plainText } from "@/lib/format";
import { pendingAmount, receivedByMaintenance } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/manutencoes")({
  head: () => ({
    meta: [
      { title: "Manutenções — Augusto.dev Manager" },
      { name: "description", content: "Solicitações de manutenção, prazos e cobranças." },
      { property: "og:title", content: "Manutenções — Augusto.dev Manager" },
      { property: "og:description", content: "Solicitações de manutenção, prazos e cobranças." },
    ],
  }),
  component: MaintenancePage,
});

function MaintenancePage() {
  const maintenances = useMaintenances();
  const clients = useClients();
  const projects = useProjects();
  const services = useServices();
  const payments = usePayments();
  const remove = useRemove("maintenance");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Maintenance | null>(null);
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState<Maintenance | null>(null);
  const [deleting, setDeleting] = useState<Maintenance | null>(null);

  const names = Object.fromEntries((clients.data ?? []).map((c) => [c.id, c.name])) as Record<string, string>;
  const received = receivedByMaintenance(payments.data ?? []);
  const rows = (maintenances.data ?? []).filter((m) => status === "" || m.status === status);

  return (
    <AppShell
      title="Manutenções"
      subtitle={`${rows.length} solicitação(ões)`}
      actions={<PrimaryButton onClick={() => { setEditing(null); setOpen(true); }}>Nova manutenção</PrimaryButton>}
    >
      <Panel>
        <div className="p-4 sm:max-w-xs">
          <SelectInput value={status} onChange={setStatus} options={enumOptions(maintenanceStatusLabels)} placeholder="Todos os status" />
        </div>
      </Panel>
      <Panel>
        <PanelHeader title="Solicitações" />
        {maintenances.isLoading ? (
          <EmptyState message="Carregando…" />
        ) : rows.length === 0 ? (
          <EmptyState message="Nenhuma manutenção encontrada." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-edge/50 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  <th className="px-4 py-2.5 font-normal">Manutenção</th>
                  <th className="px-4 py-2.5 font-normal">Cliente</th>
                  <th className="px-4 py-2.5 font-normal">Status</th>
                  <th className="px-4 py-2.5 font-normal">Financeiro</th>
                  <th className="px-4 py-2.5 font-normal">Prazo</th>
                  <th className="px-4 py-2.5 text-right font-normal">Valor</th>
                  <th className="px-4 py-2.5 text-right font-normal">Pendente</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/40">
                {rows.map((m) => {
                  const pending = pendingAmount(Number(m.amount), received[m.id] ?? 0);
                  return (
                    <tr key={m.id} className="hover:bg-panel2/50">
                      <td className="px-4 py-2.5">
                        <p className="text-[13px] text-cream">{plainText(m.title, 80)}</p>
                        <p className="font-mono text-[10px] text-faint">{maintenanceTypeLabels[m.type]}</p>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-mute">{m.client_id ? (names[m.client_id] ?? "—") : "—"}</td>
                      <td className="px-4 py-2.5"><StatusBadge label={maintenanceStatusLabels[m.status]} tone={maintenanceStatusTone[m.status]} /></td>
                      <td className="px-4 py-2.5"><StatusBadge label={financialStatusLabels[m.financial_status]} tone={financialStatusTone[m.financial_status]} /></td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-mute">{formatDate(m.due_date)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-[12px] text-cream">{formatCurrency(Number(m.amount))}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-[12px] text-orange">{formatCurrency(pending)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1.5">
                          <button aria-label="Registrar pagamento" onClick={() => setPaying(m)} className="rounded p-1.5 text-faint hover:text-mint"><Wallet className="size-3.5" /></button>
                          <button aria-label="Editar" onClick={() => { setEditing(m); setOpen(true); }} className="rounded p-1.5 text-faint hover:text-cream"><Pencil className="size-3.5" /></button>
                          <button aria-label="Excluir" onClick={() => setDeleting(m)} className="rounded p-1.5 text-faint hover:text-red"><Trash2 className="size-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <MaintenanceDialog open={open} onOpenChange={setOpen} maintenance={editing} clients={clients.data ?? []} projects={projects.data ?? []} services={services.data ?? []} />
      <PaymentDialog
        open={paying !== null}
        onOpenChange={(v) => !v && setPaying(null)}
        maintenanceId={paying?.id}
        suggestedAmount={paying ? pendingAmount(Number(paying.amount), received[paying.id] ?? 0) : undefined}
      />
      <ConfirmDelete
        open={deleting !== null}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Excluir manutenção"
        description="Esta ação não pode ser desfeita."
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => toast.success("Manutenção excluída"),
            onError: () => toast.error("Não foi possível excluir. Remova antes os pagamentos vinculados."),
          });
          setDeleting(null);
        }}
      />
    </AppShell>
  );
}
