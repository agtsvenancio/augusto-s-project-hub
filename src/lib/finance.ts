import type { Maintenance, Payment, Project } from "./domain";
import { daysUntil, monthKey } from "./format";

export function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + (Number(pick(item)) || 0), 0);
}

export function receivedByProject(payments: Payment[]): Record<string, number> {
  const map: Record<string, number> = {};
  payments.forEach((payment) => {
    if (!payment.project_id) return;
    map[payment.project_id] = (map[payment.project_id] ?? 0) + Number(payment.amount);
  });
  return map;
}

export function receivedByMaintenance(payments: Payment[]): Record<string, number> {
  const map: Record<string, number> = {};
  payments.forEach((payment) => {
    if (!payment.maintenance_id) return;
    map[payment.maintenance_id] = (map[payment.maintenance_id] ?? 0) + Number(payment.amount);
  });
  return map;
}

export function pendingAmount(contracted: number, received: number): number {
  return Math.max(Number(contracted) - Number(received), 0);
}

export function receivedPercent(contracted: number, received: number): number {
  const total = Number(contracted);
  if (!total) return 0;
  return Math.min(Math.round((Number(received) / total) * 100), 100);
}

export type AlertKind = "atrasado" | "prazo" | "pagamento" | "informacoes" | "concluido";

export type AlertItem = {
  id: string;
  kind: AlertKind;
  title: string;
  subtitle: string;
  href: string;
  badge: string;
};

export function buildAlerts(
  projects: Project[],
  payments: Payment[],
  clientNames: Record<string, string>,
): AlertItem[] {
  const received = receivedByProject(payments);
  const items: AlertItem[] = [];

  projects.forEach((project) => {
    const clientName = project.client_id ? (clientNames[project.client_id] ?? "Sem cliente") : "Sem cliente";
    const days = daysUntil(project.due_date);
    const finished = project.status === "concluido" || project.status === "cancelado";
    const pending = pendingAmount(Number(project.amount), received[project.id] ?? 0);

    if (!finished && days !== null && days < 0) {
      items.push({
        id: `${project.id}-atrasado`,
        kind: "atrasado",
        title: project.name,
        subtitle: `${clientName} · prazo vencido há ${Math.abs(days)} dia(s)`,
        href: project.id,
        badge: "Atrasado",
      });
    } else if (!finished && days !== null && days <= 7) {
      items.push({
        id: `${project.id}-prazo`,
        kind: "prazo",
        title: project.name,
        subtitle: `${clientName} · vence em ${days} dia(s)`,
        href: project.id,
        badge: "Prazo",
      });
    }

    if (pending > 0 && (project.financial_status === "aguardando_pagamento" || project.financial_status === "atrasado" || project.financial_status === "parcialmente_pago")) {
      items.push({
        id: `${project.id}-pagamento`,
        kind: "pagamento",
        title: project.name,
        subtitle: `${clientName} · saldo pendente`,
        href: project.id,
        badge: "Pagamento",
      });
    }

    if (project.status === "aguardando_informacoes") {
      items.push({
        id: `${project.id}-info`,
        kind: "informacoes",
        title: project.name,
        subtitle: `${clientName} · aguardando informações`,
        href: project.id,
        badge: "Info",
      });
    }
  });

  return items.slice(0, 12);
}

export function monthlySeries(
  months: string[],
  projects: Project[],
  maintenances: Maintenance[],
  payments: Payment[],
) {
  return months.map((key) => {
    const faturado =
      sumBy(
        projects.filter((p) => monthKey(p.contracted_at ?? p.created_at) === key),
        (p) => Number(p.amount),
      ) +
      sumBy(
        maintenances.filter((m) => monthKey(m.requested_at ?? m.created_at) === key),
        (m) => Number(m.amount),
      );
    const recebido = sumBy(
      payments.filter((p) => monthKey(p.paid_at) === key),
      (p) => Number(p.amount),
    );
    return { key, faturado, recebido };
  });
}
