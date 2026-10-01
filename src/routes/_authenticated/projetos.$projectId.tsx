import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GhostButton, PrimaryButton } from "@/components/app-shell";
import { EmptyState, Kpi, KpiStrip, Panel, PanelHeader } from "@/components/ui-kit";
import { StatusBadge } from "@/components/status-badge";
import { PaymentDialog, ProjectDialog } from "@/components/forms";
import { useClients, usePayments, useProjectHistory, useProjects, useServices } from "@/lib/api";
import {
  financialStatusLabels,
  financialStatusTone,
  historyEventLabels,
  paymentMethodLabels,
  productionStatusLabels,
  productionStatusTone,
  projectStatusLabels,
  projectStatusTone,
  projectTypeLabels,
} from "@/lib/domain";
import { formatCurrency, formatDate, formatDateTime, plainText } from "@/lib/format";
import { pendingAmount, receivedPercent, sumBy } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/projetos/$projectId")({
  head: () => ({
    meta: [
      { title: "Detalhes do projeto — Augusto.dev Manager" },
      { name: "description", content: "Dados, pagamentos e histórico do projeto." },
      { property: "og:title", content: "Detalhes do projeto — Augusto.dev Manager" },
      { property: "og:description", content: "Dados, pagamentos e histórico do projeto." },
    ],
  }),
  component: ProjectDetail,
});

function safeUrl(url: string | null) {
  if (!url) return null;
  const value = url.startsWith("http") ? url : `https://${url}`;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const projects = useProjects();
  const clients = useClients();
  const services = useServices();
  const payments = usePayments();
  const history = useProjectHistory(projectId);
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const project = (projects.data ?? []).find((p) => p.id === projectId);
  if (projects.isLoading) {
    return (
      <AppShell title="Projeto">
        <EmptyState message="Carregando…" />
      </AppShell>
    );
  }
  if (!project) {
    return (
      <AppShell title="Projeto não encontrado">
        <Panel>
          <EmptyState message="Este projeto não existe ou foi excluído." />
          <div className="pb-6 text-center">
            <Link to="/projetos" className="font-mono text-[11px] text-gold">← voltar para projetos</Link>
          </div>
        </Panel>
      </AppShell>
    );
  }

  const client = (clients.data ?? []).find((c) => c.id === project.client_id);
  const projectPayments = (payments.data ?? []).filter((p) => p.project_id === project.id);
  const received = sumBy(projectPayments, (p) => Number(p.amount));
  const pending = pendingAmount(Number(project.amount), received);
  const links = [
    ["Produção", project.production_url],
    ["Preview", project.preview_url],
    ["Repositório", project.repository_url],
  ] as const;

  return (
    <AppShell
      title={plainText(project.name, 80)}
      subtitle={`${client?.name ?? "Sem cliente"} · ${projectTypeLabels[project.type]}`}
      actions={
        <>
          <GhostButton onClick={() => setEditOpen(true)}>Editar</GhostButton>
          <PrimaryButton onClick={() => setPayOpen(true)}>Registrar pagamento</PrimaryButton>
        </>
      }
    >
      <KpiStrip>
        <Kpi label="Contratado" value={formatCurrency(Number(project.amount))} tone="gold" />
        <Kpi label="Recebido" value={formatCurrency(received)} tone="mint" />
        <Kpi label="Pendente" value={formatCurrency(pending)} tone="orange" />
        <Kpi label="% recebido" value={`${receivedPercent(Number(project.amount), received)}%`} />
        <Kpi label="Contratação" value={formatDate(project.contracted_at)} />
        <Kpi label="Prazo" value={formatDate(project.due_date)} tone="blue" />
        <Kpi label="Entrega" value={formatDate(project.delivered_at)} />
      </KpiStrip>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Panel spec>
          <PanelHeader title="Dados do projeto" />
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={projectStatusLabels[project.status]} tone={projectStatusTone[project.status]} />
              <StatusBadge
                label={productionStatusLabels[project.production_status]}
                tone={productionStatusTone[project.production_status]}
              />
              <StatusBadge
                label={financialStatusLabels[project.financial_status]}
                tone={financialStatusTone[project.financial_status]}
              />
            </div>
            <dl className="grid gap-3 font-mono text-[11px] sm:grid-cols-2">
              <div><dt className="text-faint">Domínio</dt><dd className="mt-0.5 text-cream">{plainText(project.domain, 120) || "—"}</dd></div>
              <div><dt className="text-faint">Hospedagem</dt><dd className="mt-0.5 text-cream">{plainText(project.hosting, 80) || "—"}</dd></div>
              {links.map(([label, url]) => {
                const href = safeUrl(url);
                return (
                  <div key={label}>
                    <dt className="text-faint">{label}</dt>
                    <dd className="mt-0.5 truncate">
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">{plainText(url, 120)}</a>
                      ) : (
                        <span className="text-cream">—</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
            {project.description ? (
              <p className="whitespace-pre-wrap text-[13px] text-mute">{plainText(project.description)}</p>
            ) : null}
            {project.notes ? (
              <p className="whitespace-pre-wrap rounded-md bg-panel2 p-3 font-mono text-[11px] text-mute">{plainText(project.notes)}</p>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Histórico" />
          <ul className="max-h-80 divide-y divide-edge/40 overflow-y-auto">
            {(history.data ?? []).length === 0 ? (
              <EmptyState message="Sem eventos registrados." />
            ) : (
              (history.data ?? []).map((entry) => (
                <li key={entry.id} className="px-4 py-2.5">
                  <p className="text-[12px] text-cream">{historyEventLabels[entry.event] ?? entry.event}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-faint">
                    {formatDateTime(entry.created_at)} · {plainText(entry.detail, 120)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Pagamentos" subtitle={`${projectPayments.length} registro(s)`} />
        {projectPayments.length === 0 ? (
          <EmptyState message="Nenhum pagamento registrado." />
        ) : (
          <ul className="divide-y divide-edge/40">
            {projectPayments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="font-mono text-[12px] text-cream">{formatDate(payment.paid_at)} · {paymentMethodLabels[payment.method]}</p>
                  {payment.notes ? <p className="font-mono text-[10px] text-faint">{plainText(payment.notes, 120)}</p> : null}
                </div>
                <span className="font-mono text-[13px] text-mint">{formatCurrency(Number(payment.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project} clients={clients.data ?? []} services={services.data ?? []} />
      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} projectId={project.id} suggestedAmount={pending} />
    </AppShell>
  );
}
