import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Tarjeta plegable del panel (cerrada por defecto). El resumen se ve siempre, así en el celular
 * la página queda corta y lo importante se lee sin abrir.
 */
export function CollapsibleCard({ title, summary, children }: { title: string; summary: ReactNode; children: ReactNode }) {
  return (
    <details className="group rounded-sm bg-white p-5 sm:p-7">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="font-serif text-2xl text-navy-900">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{summary}</p>
        </div>
        <ChevronDown aria-hidden className="mt-2 size-5 shrink-0 text-navy-900 transition group-open:rotate-180" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
