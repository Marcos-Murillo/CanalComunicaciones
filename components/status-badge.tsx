import { cn } from "@/lib/utils";
import type { EventStatus } from "@/lib/types";

const statusConfig: Record<
  EventStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-warning/20 text-warning-foreground border-warning/30",
  },
  approved: {
    label: "Aprobado",
    className: "bg-success/20 text-success border-success/30",
  },
  rejected: {
    label: "Rechazado",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  completed: {
    label: "Realizado",
    className: "bg-info/20 text-info border-info/30",
  },
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
