import { cn } from "@/lib/utils";

type Tone = "cream" | "gold" | "blue" | "mint" | "amber" | "orange" | "red" | "faint";

const toneClass: Record<Tone, string> = {
  cream: "bg-cream/10 text-cream ring-cream/15",
  gold: "bg-gold/10 text-gold ring-gold/20",
  blue: "bg-blue/10 text-blue ring-blue/20",
  mint: "bg-mint/10 text-mint ring-mint/20",
  amber: "bg-amber/10 text-amber ring-amber/20",
  orange: "bg-orange/10 text-orange ring-orange/20",
  red: "bg-red/10 text-red ring-red/20",
  faint: "bg-faint/10 text-mute ring-edge",
};

export function StatusBadge({
  label,
  tone = "faint",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px] ring-1",
        toneClass[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function Dot({ tone }: { tone: Tone }) {
  const dot: Record<Tone, string> = {
    cream: "bg-cream",
    gold: "bg-gold",
    blue: "bg-blue",
    mint: "bg-mint",
    amber: "bg-amber",
    orange: "bg-orange",
    red: "bg-red",
    faint: "bg-faint",
  };
  return <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", dot[tone])} />;
}
