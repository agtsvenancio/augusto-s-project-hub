import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { useClients, useProjects, useUpsert } from "@/lib/api";
import { financialStatusLabels, financialStatusTone, kanbanColumns, type ProjectStatus } from "@/lib/domain";
import { formatCurrency, formatDate, plainText } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/producao")({
  head: () => ({
    meta: [
      { title: "Produção — Augusto.dev Manager" },
      { name: "description", content: "Quadro Kanban das etapas de produção dos projetos." },
      { property: "og:title", content: "Produção — Augusto.dev Manager" },
      { property: "og:description", content: "Quadro Kanban das etapas de produção dos projetos." },
    ],
  }),
  component: KanbanPage,
});

function KanbanPage() {
  const projects = useProjects();
  const clients = useClients();
  const upsert = useUpsert("projects");
  const [over, setOver] = useState<ProjectStatus | null>(null);
  const names = Object.fromEntries((clients.data ?? []).map((c) => [c.id, c.name])) as Record<string, string>;

  function move(id: string, status: ProjectStatus) {
    const project = (projects.data ?? []).find((p) => p.id === id);
    if (!project || project.status === status) return;
    upsert.mutate(
      { id, values: { status } },
      { onSuccess: () => toast.success("Status atualizado"), onError: () => toast.error("Falha ao mover projeto") },
    );
  }

  return (
    <AppShell title="Produção" subtitle="Arraste os cartões ou use o seletor para mudar a etapa">
      <div className="flex gap-3 overflow-x-auto pb-4">
        {kanbanColumns.map((column) => {
          const items = (projects.data ?? []).filter((p) => p.status === column.status);
          return (
            <div
              key={column.status}
              onDragOver={(e) => { e.preventDefault(); setOver(column.status); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); setOver(null); move(e.dataTransfer.getData("text/plain"), column.status); }}
              className={cn("w-64 shrink-0 rounded-lg bg-surface/60 ring-1 ring-edge/60", over === column.status && "ring-gold/60")}
            >
              <div className="flex items-center justify-between border-b border-edge/50 px-3 py-2.5">
                <p className="text-[12px] font-semibold">{column.label}</p>
                <span className="font-mono text-[10px] text-faint">{items.length}</span>
              </div>
              <div className="min-h-32 space-y-2 p-2">
                {items.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", project.id)}
                    className="cursor-grab rounded-md bg-panel p-3 ring-1 ring-cream/5 active:cursor-grabbing"
                  >
                    <Link to="/projetos/$projectId" params={{ projectId: project.id }} className="text-[13px] text-cream hover:text-gold">
                      {plainText(project.name, 60)}
                    </Link>
                    <p className="mt-0.5 font-mono text-[10px] text-faint">
                      {project.client_id ? (names[project.client_id] ?? "—") : "Sem cliente"} · {formatDate(project.due_date)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <StatusBadge label={financialStatusLabels[project.financial_status]} tone={financialStatusTone[project.financial_status]} />
                      <span className="font-mono text-[11px] text-gold">{formatCurrency(Number(project.amount))}</span>
                    </div>
                    <select
                      aria-label="Mover para"
                      value={project.status}
                      onChange={(e) => move(project.id, e.target.value as ProjectStatus)}
                      className="mt-2 h-7 w-full rounded bg-panel2 px-2 font-mono text-[10px] text-mute ring-1 ring-edge/60 lg:hidden"
                    >
                      {kanbanColumns.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
