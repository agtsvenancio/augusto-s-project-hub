import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, PrimaryButton } from "@/components/app-shell";
import { Panel, PanelHeader, Kpi, KpiStrip, EmptyState } from "@/components/ui-kit";
import { StatusBadge, Dot } from "@/components/status-badge";
import { ProjectDialog } from "@/components/forms";
import { useClients, useMaintenances, usePayments, useProjects, useServices } from "@/lib/api";
import {
  financialStatusLabels,
  financialStatusTone,
  openProjectStatuses,
  projectStatusLabels,
  projectStatusTone,
} from "@/lib/domain";
import { formatCurrency, formatDate, lastMonths, monthLabel, plainText } from "@/lib/format";
import {
  buildAlerts,
  monthlySeries,
  pendingAmount,
  receivedByMaintenance,
  receivedByProject,
  sumBy,
} from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Augusto.dev Manager" },
      { name: "description", content: "Visão geral de projetos, prazos e faturamento." },
      { property: "og:title", content: "Dashboard — Augusto.dev Manager" },
      { property: "og:description", content: "Visão geral de projetos, prazos e faturamento." },
    ],
  }),
  component: DashboardPage,
});

const alertTone = {
  atrasado: "red",
  prazo: "amber",
  pagamento: "orange",
  informacoes: "blue",
  concluido: "mint",
} as const;

function DashboardPage() {
  const projects = useProjects();
  const clients = useClients();
  const services = useServices();
  const maintenances = useMaintenances();
  const payments = usePayments();
  const [open, setOpen] = useState(false);

  const projectList = projects.data ?? [];
  const maintenanceList = maintenances.data ?? [];
  const paymentList = payments.data ?? [];
  const clientList = clients.data ?? [];

  const clientNames = useMemo(
    () => Object.fromEntries(clientList.map((c) => [c.id, c.name])) as Record<string, string>,
    [clientList],
  );

  const receivedProjects = receivedByProject(paymentList);
  const receivedMaintenance = receivedByMaintenance(paymentList);

  const contracted =
    sumBy(projectList, (p) => Number(p.amount)) + sumBy(maintenanceList, (m) => Number(m.amount));
  const received = sumBy(paymentList, (p) => Number(p.amount));
  const pending = Math.max(contracted - received, 0);

  const open30 = projectList.filter((p) => openProjectStatuses.includes(p.status));
  const inProduction = projectList.filter((p) => p.production_status === "em_producao");
  const openMaintenance = maintenanceList.filter(
    (m) => m.status !== "concluida" && m.status !== "cancelada",
  );

  const alerts = buildAlerts(projectList, paymentList, clientNames);
  const months = lastMonths(6);
  const series = monthlySeries(months, projectList, maintenanceList, paymentList).map((row) => ({
    ...row,
    label: monthLabel(row.key),
  }));

  const recent = [...projectList].slice(0, 8);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Visão geral da operação"
      actions={<PrimaryButton onClick={() => setOpen(true)}>Novo projeto</PrimaryButton>}
    >
      <KpiStrip>
        <Kpi label="Projetos ativos" value={String(open30.length)} />
        <Kpi label="Em produção" value={String(inProduction.length)} tone="mint" />
        <Kpi label="Manutenções abertas" value={String(openMaintenance.length)} tone="blue" />
        <Kpi label="Clientes" value={String(clientList.length)} />
        <Kpi label="Contratado" value={formatCurrency(contracted)} tone="gold" />
        <Kpi label="Recebido" value={formatCurrency(received)} tone="mint" />
        <Kpi label="A receber" value={formatCurrency(pending)} tone="orange" />
      </KpiStrip>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel spec>
          <PanelHeader title="Faturamento x recebimento" subtitle="Últimos 6 meses" />
          <div className="h-64 px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="faturado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-gold)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-gold)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recebido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-mint)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-mint)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--color-edge)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--color-faint)", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-faint)", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                  tickFormatter={(value: number) => formatCurrency(value).replace("R$", "").trim()}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-panel2)",
                    border: "1px solid var(--color-edge)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--color-mute)" }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
                <Area
                  type="monotone"
                  dataKey="faturado"
                  name="Faturado"
                  stroke="var(--color-gold)"
                  fill="url(#faturado)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="recebido"
                  name="Recebido"
                  stroke="var(--color-mint)"
                  fill="url(#recebido)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Atenção hoje" subtitle={`${alerts.length} item(ns)`} />
          <div className="max-h-64 divide-y divide-edge/40 overflow-y-auto">
            {alerts.length === 0 ? (
              <EmptyState message="Nenhum alerta no momento." />
            ) : (
              alerts.map((alert) => (
                <Link
                  key={alert.id}
                  to="/projetos/$projectId"
                  params={{ projectId: alert.href }}
                  className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-panel2/60"
                >
                  <Dot tone={alertTone[alert.kind]} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-cream">{plainText(alert.title, 80)}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-faint">{alert.subtitle}</p>
                  </div>
                  <StatusBadge label={alert.badge} tone={alertTone[alert.kind]} />
                </Link>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Projetos recentes"
          subtitle="Últimos cadastrados"
          right={
            <Link to="/projetos" className="font-mono text-[11px] text-faint hover:text-cream">
              ver todos →
            </Link>
          }
        />
        {projects.isLoading ? (
          <EmptyState message="Carregando…" />
        ) : recent.length === 0 ? (
          <EmptyState message="Nenhum projeto cadastrado ainda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-edge/50 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  <th className="px-4 py-2.5 font-normal">Projeto</th>
                  <th className="px-4 py-2.5 font-normal">Cliente</th>
                  <th className="px-4 py-2.5 font-normal">Status</th>
                  <th className="px-4 py-2.5 font-normal">Financeiro</th>
                  <th className="px-4 py-2.5 font-normal">Prazo</th>
                  <th className="px-4 py-2.5 text-right font-normal">Pendente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/40">
                {recent.map((project) => (
                  <tr key={project.id} className="transition-colors hover:bg-panel2/50">
                    <td className="px-4 py-2.5">
                      <Link
                        to="/projetos/$projectId"
                        params={{ projectId: project.id }}
                        className="text-[13px] text-cream hover:text-gold"
                      >
                        {plainText(project.name, 80)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-mute">
                      {project.client_id ? (clientNames[project.client_id] ?? "—") : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        label={projectStatusLabels[project.status]}
                        tone={projectStatusTone[project.status]}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        label={financialStatusLabels[project.financial_status]}
                        tone={financialStatusTone[project.financial_status]}
                      />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-mute">
                      {formatDate(project.due_date)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] text-cream">
                      {formatCurrency(
                        pendingAmount(Number(project.amount), receivedProjects[project.id] ?? 0),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Manutenções em aberto" subtitle={`${openMaintenance.length} solicitação(ões)`} />
        {openMaintenance.length === 0 ? (
          <EmptyState message="Nenhuma manutenção em aberto." />
        ) : (
          <ul className="divide-y divide-edge/40">
            {openMaintenance.slice(0, 6).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-cream">{plainText(item.title, 80)}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-faint">
                    {item.client_id ? (clientNames[item.client_id] ?? "Sem cliente") : "Sem cliente"} · prazo{" "}
                    {formatDate(item.due_date)}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[12px] text-cream">
                  {formatCurrency(
                    pendingAmount(Number(item.amount), receivedMaintenance[item.id] ?? 0),
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ProjectDialog
        open={open}
        onOpenChange={setOpen}
        clients={clientList}
        services={services.data ?? []}
      />
    </AppShell>
  );
}
