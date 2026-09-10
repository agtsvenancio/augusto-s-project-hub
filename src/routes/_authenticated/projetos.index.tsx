import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PrimaryButton } from "@/components/app-shell";
import { EmptyState, Panel, PanelHeader } from "@/components/ui-kit";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDelete, ProjectDialog, SelectInput, TextInput } from "@/components/forms";
import { useClients, usePayments, useProjects, useRemove, useServices } from "@/lib/api";
import {
  enumOptions,
  financialStatusLabels,
  financialStatusTone,
  productionStatusLabels,
  productionStatusTone,
  projectStatusLabels,
  projectStatusTone,
  projectTypeLabels,
  type Project,
} from "@/lib/domain";
import { formatCurrency, formatDate, plainText } from "@/lib/format";
import { pendingAmount, receivedByProject } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/projetos/")({
  head: () => ({
    meta: [
      { title: "Projetos — Augusto.dev Manager" },
      { name: "description", content: "Lista completa de sites e landing pages contratados." },
      { property: "og:title", content: "Projetos — Augusto.dev Manager" },
      { property: "og:description", content: "Lista completa de sites e landing pages contratados." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = useProjects();
  const clients = useClients();
  const services = useServices();
  const payments = usePayments();
  const remove = useRemove("projects");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [financial, setFinancial] = useState("");
  const [clientId, setClientId] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const clientList = clients.data ?? [];
  const clientNames = useMemo(
    () => Object.fromEntries(clientList.map((c) => [c.id, c.name])) as Record<string, string>,
    [clientList],
  );
  const received = receivedByProject(payments.data ?? []);

  const rows = (projects.data ?? []).filter((project) => {
    const term = search.trim().toLowerCase();
    const clientName = project.client_id ? (clientNames[project.client_id] ?? "") : "";
    const matchesTerm =
      term === "" ||
      project.name.toLowerCase().includes(term) ||
      clientName.toLowerCase().includes(term);
    return (
      matchesTerm &&
      (status === "" || project.status === status) &&
      (financial === "" || project.financial_status === financial) &&
      (clientId === "" || project.client_id === clientId)
    );
  });

  return (
    <AppShell
      title="Projetos"
      subtitle={`${rows.length} de ${(projects.data ?? []).length} projeto(s)`}
      actions={
        <PrimaryButton
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Novo projeto
        </PrimaryButton>
      }
    >
      <Panel>
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <TextInput
            placeholder="Buscar por projeto ou cliente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={80}
          />
          <SelectInput
            value={status}
            onChange={setStatus}
            options={enumOptions(projectStatusLabels)}
            placeholder="Todos os status"
          />
          <SelectInput
            value={financial}
            onChange={setFinancial}
            options={enumOptions(financialStatusLabels)}
            placeholder="Todo status financeiro"
          />
          <SelectInput
            value={clientId}
            onChange={setClientId}
            options={clientList.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Todos os clientes"
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Lista de projetos" subtitle="Clique no nome para ver os detalhes" />
        {projects.isLoading ? (
          <EmptyState message="Carregando…" />
        ) : rows.length === 0 ? (
          <EmptyState message="Nenhum projeto encontrado com esses filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-edge/50 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  <th className="px-4 py-2.5 font-normal">Projeto</th>
                  <th className="px-4 py-2.5 font-normal">Cliente</th>
                  <th className="px-4 py-2.5 font-normal">Tipo</th>
                  <th className="px-4 py-2.5 font-normal">Status</th>
                  <th className="px-4 py-2.5 font-normal">Produção</th>
                  <th className="px-4 py-2.5 font-normal">Financeiro</th>
                  <th className="px-4 py-2.5 font-normal">Prazo</th>
                  <th className="px-4 py-2.5 text-right font-normal">Valor</th>
                  <th className="px-4 py-2.5 text-right font-normal">Pendente</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/40">
                {rows.map((project) => (
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
                    <td className="px-4 py-2.5 font-mono text-[11px] text-mute">
                      {projectTypeLabels[project.type]}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        label={projectStatusLabels[project.status]}
                        tone={projectStatusTone[project.status]}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        label={productionStatusLabels[project.production_status]}
                        tone={productionStatusTone[project.production_status]}
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
                      {formatCurrency(Number(project.amount))}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[12px] text-orange">
                      {formatCurrency(pendingAmount(Number(project.amount), received[project.id] ?? 0))}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          aria-label="Editar projeto"
                          onClick={() => {
                            setEditing(project);
                            setDialogOpen(true);
                          }}
                          className="rounded p-1.5 text-faint transition-colors hover:text-cream"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          aria-label="Excluir projeto"
                          onClick={() => setDeleting(project)}
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

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editing}
        clients={clientList}
        services={services.data ?? []}
      />

      <ConfirmDelete
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir projeto"
        description="Esta ação remove o projeto e não pode ser desfeita. Pagamentos vinculados permanecem no histórico financeiro."
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => toast.success("Projeto excluído"),
            onError: () => toast.error("Não foi possível excluir. Remova antes os pagamentos vinculados."),
          });
          setDeleting(null);
        }}
      />
    </AppShell>
  );
}
