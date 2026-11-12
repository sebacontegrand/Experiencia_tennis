import { adminCopy } from "@/content/admin";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        status === "BORRADOR" && "bg-cream-200 text-ink",
        status === "PUBLICADA" && "bg-emerald-100 text-emerald-900",
        status === "CUPO_COMPLETO" && "bg-amber-100 text-amber-900",
        (status === "FINALIZADA" || status === "CANCELADA") && "bg-slate-100 text-slate-700",
      )}
    >
      {adminCopy.status[status] ?? status}
    </span>
  );
}
