import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GhostButton } from "@/components/app-shell";
import { Kpi, KpiStrip, Panel, PanelHeader } from "@/components/ui-kit";
import { TextInput } from "@/components/forms";
import { useClients, useMaintenances, usePayments, useProjects } from "@/lib/api";
import { projectTypeLabels, type ProjectType } from "@/lib/domain";
import { formatCurrency, todayISO } from "@/lib/format";
import { sumBy } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Augusto.dev Manager" },
      { name: "description", content: "Relatórios de faturamento por período, cliente e tipo." },
      { property: "og:title", content: "Relatórios — Augusto.dev Manager" },
      { property: "og:description", content: "Relatórios de faturamento por período, cliente e tipo." },
    ],
  }),
  component: ReportsPage,
});

function inRange(date: string | null, from: string, to: string) {
  if (!date) return false;
  const d = date.slice(0, 10);
  return d >= from && d <= to;
}

function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function ReportsPage() {
  const projects = useProjects();
  const maintenances = useMaintenances();
  const payments = usePayments();
  const clients = useClients();
  const [from, setFrom] = useState(`${todayISO().slice(0, 4)}-01-01`);
  const [to, setTo] = useState(todayISO());

  const proj = (projects.data ?? []).filter((p) => inRange(p.contracted_at ?? p.created_at, from, to));
  const maint = (maintenances.data ?? []).filter((m) => inRange(m.requested_at ?? m.created_at, from, to));
  const pays = (payments.data ?? []).filter((p) => inRange(p.paid_at, from, to));
  const billed = sumBy(proj, (p) => Number(p.amount)) + sumBy(maint, (m) => Number(m.amount));
  const received = sumBy(pays, (p) => Number(p.amount));

  const byClient = (clients.data ?? [])
    .map((c) => ({
      name: c.name,
      total:
        sumBy(proj.filter((p) => p.client_id === c.id), (p) => Number(p.amount)) +
        sumBy(maint.filter((m) => m.client_id === c.id), (m) => Number(m.amount)),
    }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);

  const byType = (Object.keys(projectTypeLabels) as ProjectType[])
    .map((type) => ({
      name: projectTypeLabels[type],
      count: proj.filter((p) => p.type === type).length,
      total: sumBy(proj.filter((p) => p.type === type), (p) => Number(p.amount)),
    }))
    .filter((r) => r.count > 0);

  function exportCsv() {
    const lines = [
      ["Cliente", "Faturado"].map(csvCell).join(";"),
      ...byClient.map((r) => [r.name, r.total.toFixed(2)].map(csvCell).join(";")),
    ];
    const blob = new Blob([`\ufeff${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faturamento_${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="Relatórios" subtitle="Escolha o período para analisar" actions={<GhostButton onClick={exportCsv}>Exportar CSV</GhostButton>}>
      <Panel>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:max-w-md">
          <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Data inicial" />
          <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Data final" />
        </div>
      </Panel>
      <KpiStrip>
        <Kpi label="Faturado" value={formatCurrency(billed)} tone="gold" />
        <Kpi label="Recebido" value={formatCurrency(received)} tone="mint" />
        <Kpi label="Diferença" value={formatCurrency(Math.max(billed - received, 0))} tone="orange" />
        <Kpi label="Projetos" value={String(proj.length)} />
        <Kpi label="Manutenções" value={String(maint.length)} tone="blue" />
        <Kpi label="Pagamentos" value={String(pays.length)} />
        <Kpi label="Clientes ativos" value={String(byClient.length)} />
      </KpiStrip>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Faturamento por cliente" />
          <ul className="divide-y divide-edge/40">
            {byClient.length === 0 ? <li className="px-4 py-6 text-center font-mono text-[12px] text-faint">Sem dados no período.</li> : byClient.map((r) => (
              <li key={r.name} className="flex justify-between px-4 py-2.5 text-[13px]"><span>{r.name}</span><span className="font-mono text-gold">{formatCurrency(r.total)}</span></li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <PanelHeader title="Por tipo de projeto" />
          <ul className="divide-y divide-edge/40">
            {byType.length === 0 ? <li className="px-4 py-6 text-center font-mono text-[12px] text-faint">Sem dados no período.</li> : byType.map((r) => (
              <li key={r.name} className="flex justify-between px-4 py-2.5 text-[13px]"><span>{r.name} <span className="font-mono text-[11px] text-faint">· {r.count}</span></span><span className="font-mono text-gold">{formatCurrency(r.total)}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
