import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PrimaryButton } from "@/components/app-shell";
import { EmptyState, Panel, PanelHeader } from "@/components/ui-kit";
import { ClientDialog, ConfirmDelete, TextInput } from "@/components/forms";
import { useClients, useMaintenances, usePayments, useProjects, useRemove } from "@/lib/api";
import type { Client } from "@/lib/domain";
import { formatCurrency, plainText } from "@/lib/format";
import { receivedByProject, sumBy } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Augusto.dev Manager" },
      { name: "description", content: "Cadastro de clientes com contatos e histórico contratado." },
      { property: "og:title", content: "Clientes — Augusto.dev Manager" },
      { property: "og:description", content: "Cadastro de clientes com contatos e histórico contratado." },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const clients = useClients();
  const projects = useProjects();
  const maintenances = useMaintenances();
  const payments = usePayments();
  const remove = useRemove("clients");

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const projectList = projects.data ?? [];
  const maintenanceList = maintenances.data ?? [];
  const received = receivedByProject(payments.data ?? []);

  const rows = (clients.data ?? []).filter((client) => {
    const term = search.trim().toLowerCase();
    return (
      term === "" ||
      client.name.toLowerCase().includes(term) ||
      (client.contact_name ?? "").toLowerCase().includes(term) ||
      (client.email ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <AppShell
      title="Clientes"
      subtitle={`${rows.length} cliente(s)`}
      actions={
        <PrimaryButton
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Novo cliente
        </PrimaryButton>
      }
    >
      <Panel>
        <div className="p-4">
          <TextInput
            placeholder="Buscar cliente, responsável ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={80}
          />
        </div>
      </Panel>

      {clients.isLoading ? (
        <Panel>
          <EmptyState message="Carregando…" />
        </Panel>
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState message="Nenhum cliente cadastrado." />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((client) => {
            const clientProjects = projectList.filter((p) => p.client_id === client.id);
            const clientMaintenances = maintenanceList.filter((m) => m.client_id === client.id);
            const contracted =
              sumBy(clientProjects, (p) => Number(p.amount)) +
              sumBy(clientMaintenances, (m) => Number(m.amount));
            const paid = sumBy(clientProjects, (p) => received[p.id] ?? 0);

            return (
              <Panel key={client.id} spec>
                <div className="flex items-start justify-between gap-2 px-4 pt-4">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold tracking-tight text-cream">
                      {plainText(client.name, 60)}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-faint">
                      {plainText(client.contact_name, 60) || "Sem responsável"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      aria-label="Editar cliente"
                      onClick={() => {
                        setEditing(client);
                        setOpen(true);
                      }}
                      className="rounded p-1.5 text-faint transition-colors hover:text-cream"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      aria-label="Excluir cliente"
                      onClick={() => setDeleting(client)}
                      className="rounded p-1.5 text-faint transition-colors hover:text-red"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <dl className="mt-4 space-y-1.5 px-4 font-mono text-[11px] text-mute">
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">E-mail</dt>
                    <dd className="truncate">{plainText(client.email, 60) || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">WhatsApp</dt>
                    <dd>{plainText(client.whatsapp, 30) || plainText(client.phone, 30) || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Projetos</dt>
                    <dd>{clientProjects.length}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-faint">Manutenções</dt>
                    <dd>{clientMaintenances.length}</dd>
                  </div>
                </dl>

                <div className="mt-4 grid grid-cols-2 gap-px bg-edge/60">
                  <div className="bg-panel px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Contratado</p>
                    <p className="mt-1 font-mono text-[13px] text-gold">{formatCurrency(contracted)}</p>
                  </div>
                  <div className="bg-panel px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Recebido</p>
                    <p className="mt-1 font-mono text-[13px] text-mint">{formatCurrency(paid)}</p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <ClientDialog open={open} onOpenChange={setOpen} client={editing} />

      <ConfirmDelete
        open={deleting !== null}
        onOpenChange={(value) => !value && setDeleting(null)}
        title="Excluir cliente"
        description="O cliente será removido do cadastro. Projetos vinculados ficam sem cliente."
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: () => toast.success("Cliente excluído"),
            onError: () => toast.error("Não foi possível excluir o cliente"),
          });
          setDeleting(null);
        }}
      />
    </AppShell>
  );
}
