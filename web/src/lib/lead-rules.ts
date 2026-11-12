/** Reglas puras de la bandeja de consultas (leads) del panel. */

export const LEAD_STATUSES = ["NUEVO", "CONTACTADO", "EN_CONVERSACION", "CERRADO"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_TYPES = ["CLUB", "BARRIO", "HOTEL", "EMPRESA", "SPONSOR", "OTRO"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const isLeadStatus = (v: unknown): v is LeadStatus => typeof v === "string" && (LEAD_STATUSES as readonly string[]).includes(v);
export const isLeadType = (v: unknown): v is LeadType => typeof v === "string" && (LEAD_TYPES as readonly string[]).includes(v);

/** A qué estados se puede mover una consulta: cualquiera menos el actual (es un seguimiento, no un flujo estricto). */
export function leadNextStatuses(from: LeadStatus): LeadStatus[] {
  return LEAD_STATUSES.filter((s) => s !== from);
}

type SearchParams = Record<string, string | string[] | undefined>;

/** ?estado=&tipo= → filtros válidos (lo inválido se ignora). */
export function parseLeadFilters(sp: SearchParams) {
  const estado = typeof sp.estado === "string" && isLeadStatus(sp.estado) ? sp.estado : null;
  const tipo = typeof sp.tipo === "string" && isLeadType(sp.tipo) ? sp.tipo : null;
  return { estado, tipo };
}

export function leadFiltersQuery(f: { estado: LeadStatus | null; tipo: LeadType | null }) {
  const u = new URLSearchParams();
  if (f.estado) u.set("estado", f.estado);
  if (f.tipo) u.set("tipo", f.tipo);
  const qs = u.toString();
  return qs ? `?${qs}` : "";
}
