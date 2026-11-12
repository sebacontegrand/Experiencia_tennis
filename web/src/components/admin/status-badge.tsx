import { adminCopy } from "@/content/admin";
import { cn } from "@/lib/utils";

/** Estado de una experiencia, de una inscripción o de una consulta (`kind`). */
export function StatusBadge({ status, kind = "experience" }: { status: string; kind?: "experience" | "registration" | "lead" }) {
  const labels = kind === "registration" ? adminCopy.registrationStatus : kind === "lead" ? adminCopy.leads.status : adminCopy.status;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
        // Experiencia
        status === "BORRADOR" && "bg-cream-200 text-ink",
        status === "PUBLICADA" && "bg-emerald-100 text-emerald-900",
        status === "CUPO_COMPLETO" && "bg-amber-100 text-amber-900",
        status === "FINALIZADA" && "bg-slate-100 text-slate-700",
        // Inscripción
        status === "PENDIENTE" && "bg-amber-100 text-amber-900",
        status === "SENADA" && "bg-sky-100 text-sky-900",
        status === "CONFIRMADA" && "bg-emerald-100 text-emerald-900",
        status === "LISTA_ESPERA" && "bg-violet-100 text-violet-900",
        status === "CANCELADA" && "bg-slate-100 text-slate-700",
        // Consulta
        status === "NUEVO" && "bg-amber-100 text-amber-900",
        status === "CONTACTADO" && "bg-sky-100 text-sky-900",
        status === "EN_CONVERSACION" && "bg-violet-100 text-violet-900",
        status === "CERRADO" && "bg-slate-100 text-slate-700",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
