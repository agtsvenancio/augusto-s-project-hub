import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field } from "@/components/ui-kit";
import { GhostButton, PrimaryButton } from "@/components/app-shell";
import { useUpsert } from "@/lib/api";
import {
  enumOptions,
  financialStatusLabels,
  maintenanceStatusLabels,
  maintenanceTypeLabels,
  paymentMethodLabels,
  productionStatusLabels,
  projectStatusLabels,
  projectTypeLabels,
  type Client,
  type Maintenance,
  type Project,
  type Service,
} from "@/lib/domain";
import { todayISO } from "@/lib/format";

const inputClass =
  "h-9 w-full rounded-md bg-panel2 px-3 text-[13px] text-cream outline-none ring-1 ring-edge/70 focus:ring-gold/60";
const textareaClass =
  "min-h-20 w-full rounded-md bg-panel2 px-3 py-2 text-[13px] text-cream outline-none ring-1 ring-edge/70 focus:ring-gold/60";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={textareaClass} />;
}

function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitting,
  children,
  submitLabel = "Salvar",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: () => void;
  submitting: boolean;
  children: ReactNode;
  submitLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-edge bg-panel sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="font-mono text-[11px] text-faint">{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          {children}
          <DialogFooter className="gap-2">
            <GhostButton onClick={() => onOpenChange(false)}>Cancelar</GhostButton>
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "Salvando…" : submitLabel}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDelete({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-edge bg-panel">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-mute">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-panel2 text-mute">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red text-ink hover:bg-red/90">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const text = (max: number) => z.string().trim().max(max);
const money = z
  .string()
  .trim()
  .refine((v) => v === "" || !Number.isNaN(Number(v.replace(",", "."))), "Valor inválido");

function toNumber(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function orNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/* ---------------------------------- Client --------------------------------- */

const clientSchema = z.object({
  name: text(120).min(1, "Informe o nome do cliente"),
  contact_name: text(120),
  email: z.union([z.string().trim().email("E-mail inválido").max(255), z.literal("")]),
  phone: text(30),
  whatsapp: text(30),
  document: text(30),
  notes: text(2000),
});

export function ClientDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}) {
  const upsert = useUpsert("clients");
  const [form, setForm] = useState({
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    document: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: client?.name ?? "",
      contact_name: client?.contact_name ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      whatsapp: client?.whatsapp ?? "",
      document: client?.document ?? "",
      notes: client?.notes ?? "",
    });
  }, [open, client]);

  function submit() {
    const parsed = clientSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    const values = {
      name: parsed.data.name,
      contact_name: orNull(parsed.data.contact_name),
      email: orNull(parsed.data.email),
      phone: orNull(parsed.data.phone),
      whatsapp: orNull(parsed.data.whatsapp),
      document: orNull(parsed.data.document),
      notes: orNull(parsed.data.notes),
    };
    upsert.mutate(
      { id: client?.id, values },
      {
        onSuccess: () => {
          toast.success(client ? "Cliente atualizado" : "Cliente cadastrado");
          onOpenChange(false);
        },
        onError: () => toast.error("Não foi possível salvar o cliente"),
      },
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={client ? "Editar cliente" : "Novo cliente"}
      onSubmit={submit}
      submitting={upsert.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Empresa / cliente">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
        </Field>
        <Field label="Responsável">
          <TextInput
            value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            maxLength={120}
          />
        </Field>
        <Field label="E-mail">
          <TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
        </Field>
        <Field label="Telefone">
          <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} />
        </Field>
        <Field label="WhatsApp">
          <TextInput
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            maxLength={30}
          />
        </Field>
        <Field label="CNPJ / CPF (opcional)">
          <TextInput
            value={form.document}
            onChange={(e) => setForm({ ...form, document: e.target.value })}
            maxLength={30}
          />
        </Field>
      </div>
      <Field label="Observações">
        <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={2000} />
      </Field>
    </FormDialog>
  );
}

/* --------------------------------- Service --------------------------------- */

export function ServiceDialog({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
}) {
  const upsert = useUpsert("services");
  const [form, setForm] = useState({
    name: "",
    category: "",
    default_price: "",
    unit: "projeto",
    description: "",
    active: true,
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: service?.name ?? "",
      category: service?.category ?? "",
      default_price: service ? String(service.default_price) : "",
      unit: service?.unit ?? "projeto",
      description: service?.description ?? "",
      active: service?.active ?? true,
    });
  }, [open, service]);

  function submit() {
    const parsed = z
      .object({ name: text(120).min(1, "Informe o nome do serviço"), default_price: money })
      .safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    upsert.mutate(
      {
        id: service?.id,
        values: {
          name: form.name.trim(),
          category: orNull(form.category),
          default_price: toNumber(form.default_price),
          unit: orNull(form.unit),
          description: orNull(form.description),
          active: form.active,
        },
      },
      {
        onSuccess: () => {
          toast.success(service ? "Serviço atualizado" : "Serviço cadastrado");
          onOpenChange(false);
        },
        onError: () => toast.error("Não foi possível salvar o serviço"),
      },
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={service ? "Editar serviço" : "Novo serviço"}
      description="O preço cadastrado é apenas uma referência; cada projeto guarda o valor realmente cobrado."
      onSubmit={submit}
      submitting={upsert.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do serviço">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
        </Field>
        <Field label="Categoria">
          <TextInput
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            maxLength={60}
          />
        </Field>
        <Field label="Preço padrão (R$)">
          <TextInput
            inputMode="decimal"
            value={form.default_price}
            onChange={(e) => setForm({ ...form, default_price: e.target.value })}
          />
        </Field>
        <Field label="Unidade">
          <TextInput value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} maxLength={30} />
        </Field>
      </div>
      <Field label="Descrição">
        <TextArea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={2000}
        />
      </Field>
      <label className="flex items-center gap-2 font-mono text-[11px] text-mute">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="size-3.5 accent-current"
        />
        Serviço ativo
      </label>
    </FormDialog>
  );
}

/* --------------------------------- Project --------------------------------- */

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  clients,
  services,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  clients: Client[];
  services: Service[];
}) {
  const upsert = useUpsert("projects");
  const [form, setForm] = useState({
    name: "",
    client_id: "",
    service_id: "",
    type: "landing_page",
    description: "",
    amount: "",
    contracted_at: todayISO(),
    due_date: "",
    delivered_at: "",
    status: "orcamento",
    production_status: "nao_iniciado",
    financial_status: "nao_faturado",
    domain: "",
    production_url: "",
    preview_url: "",
    repository_url: "",
    hosting: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: project?.name ?? "",
      client_id: project?.client_id ?? "",
      service_id: project?.service_id ?? "",
      type: project?.type ?? "landing_page",
      description: project?.description ?? "",
      amount: project ? String(project.amount) : "",
      contracted_at: project?.contracted_at ?? todayISO(),
      due_date: project?.due_date ?? "",
      delivered_at: project?.delivered_at ?? "",
      status: project?.status ?? "orcamento",
      production_status: project?.production_status ?? "nao_iniciado",
      financial_status: project?.financial_status ?? "nao_faturado",
      domain: project?.domain ?? "",
      production_url: project?.production_url ?? "",
      preview_url: project?.preview_url ?? "",
      repository_url: project?.repository_url ?? "",
      hosting: project?.hosting ?? "",
      notes: project?.notes ?? "",
    });
  }, [open, project]);

  function pickService(serviceId: string) {
    const service = services.find((s) => s.id === serviceId);
    setForm((prev) => ({
      ...prev,
      service_id: serviceId,
      amount: prev.amount === "" && service ? String(service.default_price) : prev.amount,
    }));
  }

  function submit() {
    const parsed = z.object({ name: text(160).min(1, "Informe o nome do projeto"), amount: money }).safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    upsert.mutate(
      {
        id: project?.id,
        values: {
          name: form.name.trim(),
          client_id: orNull(form.client_id),
          service_id: orNull(form.service_id),
          type: form.type,
          description: orNull(form.description),
          amount: toNumber(form.amount),
          contracted_at: orNull(form.contracted_at),
          due_date: orNull(form.due_date),
          delivered_at: orNull(form.delivered_at),
          status: form.status,
          production_status: form.production_status,
          financial_status: form.financial_status,
          domain: orNull(form.domain),
          production_url: orNull(form.production_url),
          preview_url: orNull(form.preview_url),
          repository_url: orNull(form.repository_url),
          hosting: orNull(form.hosting),
          notes: orNull(form.notes),
        },
      },
      {
        onSuccess: () => {
          toast.success(project ? "Projeto atualizado" : "Projeto criado");
          onOpenChange(false);
        },
        onError: () => toast.error("Não foi possível salvar o projeto"),
      },
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={project ? "Editar projeto" : "Novo projeto"}
      onSubmit={submit}
      submitting={upsert.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do projeto" className="sm:col-span-2">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={160} />
        </Field>
        <Field label="Cliente">
          <SelectInput
            value={form.client_id}
            onChange={(value) => setForm({ ...form, client_id: value })}
            options={clients.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Sem cliente"
          />
        </Field>
        <Field label="Serviço de referência">
          <SelectInput
            value={form.service_id}
            onChange={pickService}
            options={services.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Nenhum"
          />
        </Field>
        <Field label="Tipo de projeto">
          <SelectInput
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
            options={enumOptions(projectTypeLabels)}
          />
        </Field>
        <Field label="Valor contratado (R$)">
          <TextInput
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </Field>
        <Field label="Data de contratação">
          <TextInput
            type="date"
            value={form.contracted_at}
            onChange={(e) => setForm({ ...form, contracted_at: e.target.value })}
          />
        </Field>
        <Field label="Prazo de entrega">
          <TextInput
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
        </Field>
        <Field label="Data de entrega real">
          <TextInput
            type="date"
            value={form.delivered_at}
            onChange={(e) => setForm({ ...form, delivered_at: e.target.value })}
          />
        </Field>
        <Field label="Status do projeto">
          <SelectInput
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value })}
            options={enumOptions(projectStatusLabels)}
          />
        </Field>
        <Field label="Status de produção">
          <SelectInput
            value={form.production_status}
            onChange={(value) => setForm({ ...form, production_status: value })}
            options={enumOptions(productionStatusLabels)}
          />
        </Field>
        <Field label="Status financeiro">
          <SelectInput
            value={form.financial_status}
            onChange={(value) => setForm({ ...form, financial_status: value })}
            options={enumOptions(financialStatusLabels)}
          />
        </Field>
        <Field label="Domínio">
          <TextInput value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} maxLength={160} />
        </Field>
        <Field label="Hospedagem">
          <TextInput
            value={form.hosting}
            onChange={(e) => setForm({ ...form, hosting: e.target.value })}
            maxLength={80}
          />
        </Field>
        <Field label="URL de produção">
          <TextInput
            value={form.production_url}
            onChange={(e) => setForm({ ...form, production_url: e.target.value })}
            maxLength={300}
          />
        </Field>
        <Field label="URL de preview">
          <TextInput
            value={form.preview_url}
            onChange={(e) => setForm({ ...form, preview_url: e.target.value })}
            maxLength={300}
          />
        </Field>
        <Field label="Repositório GitHub" className="sm:col-span-2">
          <TextInput
            value={form.repository_url}
            onChange={(e) => setForm({ ...form, repository_url: e.target.value })}
            maxLength={300}
          />
        </Field>
      </div>
      <Field label="Descrição">
        <TextArea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={2000}
        />
      </Field>
      <Field label="Observações">
        <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={2000} />
      </Field>
    </FormDialog>
  );
}

/* ------------------------------- Maintenance ------------------------------- */

export function MaintenanceDialog({
  open,
  onOpenChange,
  maintenance,
  clients,
  projects,
  services,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenance?: Maintenance | null;
  clients: Client[];
  projects: Project[];
  services: Service[];
}) {
  const upsert = useUpsert("maintenance");
  const [form, setForm] = useState({
    title: "",
    client_id: "",
    project_id: "",
    service_id: "",
    type: "correcao_bug",
    description: "",
    requested_at: todayISO(),
    due_date: "",
    completed_at: "",
    amount: "",
    status: "solicitada",
    financial_status: "nao_faturado",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      title: maintenance?.title ?? "",
      client_id: maintenance?.client_id ?? "",
      project_id: maintenance?.project_id ?? "",
      service_id: maintenance?.service_id ?? "",
      type: maintenance?.type ?? "correcao_bug",
      description: maintenance?.description ?? "",
      requested_at: maintenance?.requested_at ?? todayISO(),
      due_date: maintenance?.due_date ?? "",
      completed_at: maintenance?.completed_at ?? "",
      amount: maintenance ? String(maintenance.amount) : "",
      status: maintenance?.status ?? "solicitada",
      financial_status: maintenance?.financial_status ?? "nao_faturado",
      notes: maintenance?.notes ?? "",
    });
  }, [open, maintenance]);

  function submit() {
    const parsed = z.object({ title: text(160).min(1, "Informe a manutenção"), amount: money }).safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    upsert.mutate(
      {
        id: maintenance?.id,
        values: {
          title: form.title.trim(),
          client_id: orNull(form.client_id),
          project_id: orNull(form.project_id),
          service_id: orNull(form.service_id),
          type: form.type,
          description: orNull(form.description),
          requested_at: orNull(form.requested_at),
          due_date: orNull(form.due_date),
          completed_at: orNull(form.completed_at),
          amount: toNumber(form.amount),
          status: form.status,
          financial_status: form.financial_status,
          notes: orNull(form.notes),
        },
      },
      {
        onSuccess: () => {
          toast.success(maintenance ? "Manutenção atualizada" : "Manutenção cadastrada");
          onOpenChange(false);
        },
        onError: () => toast.error("Não foi possível salvar a manutenção"),
      },
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={maintenance ? "Editar manutenção" : "Nova manutenção"}
      onSubmit={submit}
      submitting={upsert.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título" className="sm:col-span-2">
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={160} />
        </Field>
        <Field label="Cliente">
          <SelectInput
            value={form.client_id}
            onChange={(value) => setForm({ ...form, client_id: value })}
            options={clients.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Sem cliente"
          />
        </Field>
        <Field label="Site relacionado">
          <SelectInput
            value={form.project_id}
            onChange={(value) => setForm({ ...form, project_id: value })}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
            placeholder="Nenhum"
          />
        </Field>
        <Field label="Tipo de manutenção">
          <SelectInput
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
            options={enumOptions(maintenanceTypeLabels)}
          />
        </Field>
        <Field label="Serviço de referência">
          <SelectInput
            value={form.service_id}
            onChange={(value) => {
              const service = services.find((s) => s.id === value);
              setForm((prev) => ({
                ...prev,
                service_id: value,
                amount: prev.amount === "" && service ? String(service.default_price) : prev.amount,
              }));
            }}
            options={services.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Nenhum"
          />
        </Field>
        <Field label="Valor (R$)">
          <TextInput
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </Field>
        <Field label="Data da solicitação">
          <TextInput
            type="date"
            value={form.requested_at}
            onChange={(e) => setForm({ ...form, requested_at: e.target.value })}
          />
        </Field>
        <Field label="Prazo">
          <TextInput
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
        </Field>
        <Field label="Conclusão">
          <TextInput
            type="date"
            value={form.completed_at}
            onChange={(e) => setForm({ ...form, completed_at: e.target.value })}
          />
        </Field>
        <Field label="Status">
          <SelectInput
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value })}
            options={enumOptions(maintenanceStatusLabels)}
          />
        </Field>
        <Field label="Status financeiro">
          <SelectInput
            value={form.financial_status}
            onChange={(value) => setForm({ ...form, financial_status: value })}
            options={enumOptions(financialStatusLabels)}
          />
        </Field>
      </div>
      <Field label="Descrição">
        <TextArea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={2000}
        />
      </Field>
      <Field label="Observações">
        <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={2000} />
      </Field>
    </FormDialog>
  );
}

/* --------------------------------- Payment --------------------------------- */

export function PaymentDialog({
  open,
  onOpenChange,
  projectId,
  maintenanceId,
  suggestedAmount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string | undefined;
  maintenanceId?: string | undefined;
  suggestedAmount?: number | undefined;
}) {
  const upsert = useUpsert("payments");
  const [form, setForm] = useState({ amount: "", paid_at: todayISO(), method: "pix", notes: "" });

  useEffect(() => {
    if (!open) return;
    setForm({
      amount: suggestedAmount ? String(suggestedAmount) : "",
      paid_at: todayISO(),
      method: "pix",
      notes: "",
    });
  }, [open, suggestedAmount]);

  function submit() {
    const value = toNumber(form.amount);
    if (!(value > 0)) {
      toast.error("Informe um valor maior que zero");
      return;
    }
    upsert.mutate(
      {
        values: {
          project_id: projectId ?? null,
          maintenance_id: maintenanceId ?? null,
          amount: value,
          paid_at: form.paid_at || todayISO(),
          method: form.method,
          notes: orNull(form.notes),
        },
      },
      {
        onSuccess: () => {
          toast.success("Pagamento registrado");
          onOpenChange(false);
        },
        onError: () => toast.error("Não foi possível registrar o pagamento"),
      },
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar pagamento"
      onSubmit={submit}
      submitting={upsert.isPending}
      submitLabel="Registrar"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Valor (R$)">
          <TextInput
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </Field>
        <Field label="Data">
          <TextInput
            type="date"
            value={form.paid_at}
            onChange={(e) => setForm({ ...form, paid_at: e.target.value })}
          />
        </Field>
        <Field label="Forma de pagamento">
          <SelectInput
            value={form.method}
            onChange={(value) => setForm({ ...form, method: value })}
            options={enumOptions(paymentMethodLabels)}
          />
        </Field>
      </div>
      <Field label="Observação">
        <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} />
      </Field>
    </FormDialog>
  );
}
