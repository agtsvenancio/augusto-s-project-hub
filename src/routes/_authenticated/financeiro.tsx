import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Kpi, KpiStrip, Panel, PanelHeader } from "@/components/ui-kit";
import { ConfirmDelete } from "@/components/forms";
import { useMaintenances, usePayments, useProjects, useRemove } from "@/lib/api";
import { paymentMethodLabels, type Payment } from "@/lib/domain";
import { formatCurrency, formatDate, monthKey, plainText, todayISO } from "@/lib/format";
import { sumBy } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Augusto.dev Manager" },
      { name: "description", content: "Recebimentos, valores a receber e histórico de pagamentos." },
      { property: "og:title", content: "Financeiro — Augusto.dev Manager" },
      { property: "og:description", content: "Recebimentos, valores a receber e histórico de pagamentos." },
    ],
  }),
  component: FinancePage,
});

function FinancePage() {
  const payments = usePayments();
  const projects = useProjects();
  const maintenances = useMaintenances();
  const remove = useRemove("payments");
  const [deleting, setDeleting] = useState<Payment | null>(null);

  const list = payments.data ?? [];
  const projectNames = Object.fromEntries((projects.data ?? []).map((p) => [p.id, p.name])) as Record<string, string>;
  const maintNames = Object.fromEntries((maintenances.data ?? []).map((m) => [m.id, m.title])) as Record<string, string>;
  const contracted =
    sumBy(projects.data ?? [], (p) => Number(p.amount)) + sumBy(maintenances.data ?? [], (m) => Number(m.amount));
  const received = sumBy(list, (p) => Number(p.amount));
  const thisMonth = monthKey(todayISO());
  const monthReceived = sumBy(list.filter((p) => monthKey(p.paid_at) === thisMonth), (p) => Number(p.amount));
  const year = todayISO().slice(0, 4);
  const yearReceived = sumBy(list.filter((p) => p.paid_at.startsWith(year)), (p) => Number(p.amount));

  return (
    <AppShell title="Financeiro" subtitle="Pagamentos registrados em projetos e manutenções">
      <KpiStrip>
        <Kpi label="Total contratado" value={formatCurrency(contracted)} tone="gold" />
        <Kpi label="Total recebido" value={formatCurrency(received)} tone="mint" />
        <Kpi label="A receber" value={formatCurrency(Math.max(contracted - received, 0))} tone="orange" />
        <Kpi label="Recebido no mês" value={formatCurrency(monthReceived)} tone="mint" />
        <Kpi label="Recebido no ano" value={formatCurrency(yearReceived)} />
        <Kpi label="Pagamentos" value={String(list.length)} />
        <Kpi label="Ticket médio" value={formatCurrency(list.length ? received / list.length : 0)} tone="blue" />
      </KpiStrip>
      <Panel>
        <PanelHeader title="Pagamentos" subtitle="Registre novos pagamentos na página do projeto ou da manutenção" />
        {list.length === 0 ? (
          <EmptyState message="Nenhum pagamento registrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-edge/50 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  <th className="px-4 py-2.5 font-normal">Data</th>
                  <th className="px-4 py-2.5 font-normal">Referente a</th>
                  <th className="px-4 py-2.5 font-normal">Forma</th>
                  <th className="px-4 py-2.5 font-normal">Observação</th>
                  <th className="px-4 py-2.5 text-right font-normal">Valor</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/40">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-panel2/50">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-mute">{formatDate(p.paid_at)}</td>
                    <td className="px-4 py-2.5 text-[13px] text-cream">
                      {plainText(p.project_id ? projectNames[p.project_id] : p.maintenance_id ? maintNames[p.maintenance_id] : "", 80) || "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-mute">{paymentMethodLabels[p.method]}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-faint">{plainText(p.notes, 80) || "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] text-mint">{formatCurrency(Number(p.amount))}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button aria-label="Excluir pagamento" onClick={() => setDeleting(p)} className="rounded p-1.5 text-faint hover:text-red"><Trash2 className="size-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <ConfirmDelete
        open={deleting !== null}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Excluir pagamento"
        description="O valor deixa de contar como recebido."
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => toast.success("Pagamento excluído"),
            onError: () => toast.error("Não foi possível excluir"),
          });
          setDeleting(null);
        }}
      />
    </AppShell>
  );
}
