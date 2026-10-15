import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, Maintenance, Payment, Project, Service, HistoryEntry } from "./domain";

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => unwrap<Client[]>(supabase.from("clients").select("*").order("name")),
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => unwrap<Service[]>(supabase.from("services").select("*").order("name")),
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      unwrap<Project[]>(supabase.from("projects").select("*").order("created_at", { ascending: false })),
  });
}

export function useMaintenances() {
  return useQuery({
    queryKey: ["maintenance"],
    queryFn: () =>
      unwrap<Maintenance[]>(supabase.from("maintenance").select("*").order("created_at", { ascending: false })),
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () =>
      unwrap<Payment[]>(supabase.from("payments").select("*").order("paid_at", { ascending: false })),
  });
}

export function useProjectHistory(projectId: string) {
  return useQuery({
    queryKey: ["history", projectId],
    queryFn: () =>
      unwrap<HistoryEntry[]>(
        supabase
          .from("project_history")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
      ),
  });
}

type TableName = "clients" | "services" | "projects" | "maintenance" | "payments";

const relatedKeys: Record<TableName, string[]> = {
  clients: ["clients"],
  services: ["services"],
  projects: ["projects", "history"],
  maintenance: ["maintenance"],
  payments: ["payments", "projects", "maintenance", "history"],
};

function useInvalidate(table: TableName) {
  const qc = useQueryClient();
  return () => {
    relatedKeys[table].forEach((key) => void qc.invalidateQueries({ queryKey: [key] }));
  };
}

export function useUpsert<T extends Record<string, unknown>>(table: TableName) {
  const invalidate = useInvalidate(table);
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: T }) => {
      const query = id
        ? supabase.from(table).update(values as never).eq("id", id)
        : supabase.from(table).insert(values as never);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useRemove(table: TableName) {
  const invalidate = useInvalidate(table);
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });
}

export function useDemoData() {
  const qc = useQueryClient();
  const refreshAll = () => {
    ["clients", "services", "projects", "maintenance", "payments", "history"].forEach((key) =>
      qc.invalidateQueries({ queryKey: [key] }),
    );
  };
  const seed = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("seed_demo_data");
      if (error) throw new Error(error.message);
    },
    onSuccess: refreshAll,
  });
  const clear = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("clear_demo_data");
      if (error) throw new Error(error.message);
    },
    onSuccess: refreshAll,
  });
  return { seed, clear };
}
