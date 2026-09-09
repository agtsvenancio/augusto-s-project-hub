import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  spec = false,
}: {
  children: ReactNode;
  className?: string;
  spec?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-lg bg-panel ring-1 ring-cream/5 overflow-hidden",
        spec && "spec",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge/50 px-4 py-3">
      <div>
        <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-0.5 font-mono text-[11px] text-faint">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function KpiStrip({ children }: { children: ReactNode }) {
  return (
    <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-edge/60 ring-1 ring-cream/5 sm:grid-cols-3 xl:grid-cols-7">
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "gold" | "mint" | "red" | "orange" | "blue";
  hint?: string;
}) {
  const tones = {
    gold: "text-gold",
    mint: "text-mint",
    red: "text-red",
    orange: "text-orange",
    blue: "text-blue",
  } as const;
  const toneClass = tone ? tones[tone] : "text-cream";
  return (
    <div className="bg-panel px-4 py-3.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</p>
      <p className={cn("mt-2 font-mono text-[19px] font-medium tracking-tight", toneClass)}>{value}</p>
      {hint ? <p className="mt-1 font-mono text-[10px] text-faint">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-4 py-8 text-center font-mono text-[12px] text-faint">{message}</p>;
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</span>
      {children}
    </label>
  );
}
