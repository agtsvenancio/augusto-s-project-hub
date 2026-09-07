import type { Database } from "@/integrations/supabase/types";

export type ProjectType = Database["public"]["Enums"]["project_type"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type ProductionStatus = Database["public"]["Enums"]["production_status"];
export type FinancialStatus = Database["public"]["Enums"]["financial_status"];
export type MaintenanceType = Database["public"]["Enums"]["maintenance_type"];
export type MaintenanceStatus = Database["public"]["Enums"]["maintenance_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Maintenance = Database["public"]["Tables"]["maintenance"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type HistoryEntry = Database["public"]["Tables"]["project_history"]["Row"];

type Tone = "cream" | "gold" | "blue" | "mint" | "amber" | "orange" | "red" | "faint";

export const projectTypeLabels: Record<ProjectType, string> = {
  landing_page: "Landing Page",
  site_institucional: "Site Institucional",
  ecommerce: "E-commerce",
  pagina_campanha: "Página de campanha",
  sistema_web: "Sistema Web",
  manutencao: "Manutenção",
  outro: "Outro",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  orcamento: "Orçamento",
  aguardando_aprovacao: "Aguardando aprovação",
  aguardando_informacoes: "Aguardando informações",
  em_desenvolvimento: "Em desenvolvimento",
  em_revisao: "Em revisão",
  ajustes: "Ajustes",
  pronto: "Pronto",
  publicado: "Publicado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const projectStatusTone: Record<ProjectStatus, Tone> = {
  orcamento: "faint",
  aguardando_aprovacao: "amber",
  aguardando_informacoes: "blue",
  em_desenvolvimento: "cream",
  em_revisao: "blue",
  ajustes: "amber",
  pronto: "gold",
  publicado: "mint",
  concluido: "mint",
  cancelado: "red",
};

export const productionStatusLabels: Record<ProductionStatus, string> = {
  nao_iniciado: "Não iniciado",
  desenvolvimento: "Desenvolvimento",
  preview: "Preview",
  em_producao: "Em produção",
};

export const productionStatusTone: Record<ProductionStatus, Tone> = {
  nao_iniciado: "faint",
  desenvolvimento: "cream",
  preview: "blue",
  em_producao: "mint",
};

export const financialStatusLabels: Record<FinancialStatus, string> = {
  nao_faturado: "Não faturado",
  aguardando_pagamento: "Aguardando pagamento",
  parcialmente_pago: "Parcialmente pago",
  pago: "Pago",
  atrasado: "Atrasado",
};

export const financialStatusTone: Record<FinancialStatus, Tone> = {
  nao_faturado: "faint",
  aguardando_pagamento: "orange",
  parcialmente_pago: "amber",
  pago: "mint",
  atrasado: "red",
};

export const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  correcao_bug: "Correção de bug",
  alteracao_conteudo: "Alteração de conteúdo",
  alteracao_visual: "Alteração visual",
  alteracao_layout: "Alteração de layout",
  integracao: "Integração",
  configuracao_dominio: "Configuração de domínio",
  hospedagem: "Hospedagem",
  seo_tecnico: "SEO técnico",
  performance: "Performance",
  atualizacao: "Atualização",
  outro: "Outro",
};

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  solicitada: "Solicitada",
  aguardando_informacoes: "Aguardando informações",
  em_andamento: "Em andamento",
  aguardando_aprovacao: "Aguardando aprovação",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const maintenanceStatusTone: Record<MaintenanceStatus, Tone> = {
  solicitada: "faint",
  aguardando_informacoes: "blue",
  em_andamento: "cream",
  aguardando_aprovacao: "amber",
  concluida: "mint",
  cancelada: "red",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  boleto: "Boleto",
  outro: "Outro",
};

export const historyEventLabels: Record<string, string> = {
  projeto_criado: "Projeto criado",
  status_alterado: "Status alterado",
  producao_alterada: "Produção alterada",
  financeiro_alterado: "Status financeiro alterado",
  pagamento_registrado: "Pagamento registrado",
};

export const kanbanColumns: { status: ProjectStatus; label: string }[] = [
  { status: "orcamento", label: "Orçamento" },
  { status: "aguardando_informacoes", label: "Aguardando informações" },
  { status: "em_desenvolvimento", label: "Desenvolvimento" },
  { status: "em_revisao", label: "Revisão" },
  { status: "ajustes", label: "Ajustes" },
  { status: "pronto", label: "Pronto" },
  { status: "publicado", label: "Produção" },
  { status: "concluido", label: "Concluído" },
];

export const openProjectStatuses: ProjectStatus[] = [
  "orcamento",
  "aguardando_aprovacao",
  "aguardando_informacoes",
  "em_desenvolvimento",
  "em_revisao",
  "ajustes",
  "pronto",
];

export function enumOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
