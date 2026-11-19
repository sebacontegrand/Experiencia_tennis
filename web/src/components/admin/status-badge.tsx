import { adminCopy } from "@/content/admin";
import { cn } from "@/lib/utils";

/**
 * Estado de una experiencia, de una inscripción o de una consulta (`kind`), con colores de la marca:
 * verde lleno = listo, pelota = requiere atención, verde claro = en curso, ladrillo = en espera, crema = cerrado.
 */
export function StatusBadge({ status, kind = "experience" }: { status: string; kind?: "experience" | "registration" | "lead" }) {
  const labels = kind === "registration" ? adminCopy.registrationStatus : kind === "lead" ? adminCopy.leads.status : adminCopy.status;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
        // Experiencia
        status === "BORRADOR" && "bg-cream-200 text-ink",
        status === "PUBLICADA" && "bg-forest-700 text-paper",
        status === "CUPO_COMPLETO" && "bg-ball/40 text-forest-900",
        status === "FINALIZADA" && "bg-cream-200 text-ink",
        // Inscripción
        status === "PENDIENTE" && "bg-ball/40 text-forest-900",
        status === "SENADA" && "bg-forest-600/15 text-forest-800",
        status === "CONFIRMADA" && "bg-forest-700 text-paper",
        status === "LISTA_ESPERA" && "bg-clay/15 text-clay-deep",
        status === "CANCELADA" && "bg-cream-200 text-ink",
        // Consulta
        status === "NUEVO" && "bg-ball/40 text-forest-900",
        status === "CONTACTADO" && "bg-forest-600/15 text-forest-800",
        status === "EN_CONVERSACION" && "bg-clay/15 text-clay-deep",
        status === "CERRADO" && "bg-cream-200 text-ink",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
