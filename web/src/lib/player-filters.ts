import type { Prisma } from "@/generated/prisma/client";

/** Filtros de la lista de jugadores. Viven en la URL para que se puedan compartir y funcionen sin JavaScript. */
export type PlayerFilters = {
  q: string;
  city: string;
  club: string;
  level: string;
  /** Solo quienes aceptaron recibir comunicaciones. */
  consent: boolean;
};

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined, max = 100) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function parsePlayerFilters(sp: SearchParams): PlayerFilters {
  return {
    q: one(sp.q),
    city: one(sp.ciudad),
    club: one(sp.club),
    level: one(sp.nivel),
    consent: sp.consentimiento === "1",
  };
}

/** Filtros → query string (sin los vacíos). `override` cambia o quita (`null`) un parámetro. */
export function playerFiltersQuery(f: PlayerFilters, override: Partial<Record<keyof PlayerFilters, string | boolean | null>> = {}) {
  const merged = { ...f, ...override };
  const u = new URLSearchParams();
  if (merged.q) u.set("q", String(merged.q));
  if (merged.city) u.set("ciudad", String(merged.city));
  if (merged.club) u.set("club", String(merged.club));
  if (merged.level) u.set("nivel", String(merged.level));
  if (merged.consent) u.set("consentimiento", "1");
  return u.toString();
}

export function hasActiveFilters(f: PlayerFilters) {
  return Boolean(f.q || f.city || f.club || f.level || f.consent);
}

/**
 * Filtros → `where` de Prisma. Ciudad, club y nivel son coincidencia exacta (sin distinguir mayúsculas)
 * porque salen de un desplegable con los valores que ya existen; la búsqueda libre mira nombre, email,
 * WhatsApp y club.
 */
export function playerWhere(f: PlayerFilters, { onlyConsent = false } = {}): Prisma.PlayerWhereInput {
  const and: Prisma.PlayerWhereInput[] = [];
  if (f.city) and.push({ city: { equals: f.city, mode: "insensitive" } });
  if (f.club) and.push({ club: { equals: f.club, mode: "insensitive" } });
  if (f.level) and.push({ level: f.level });
  if (f.consent || onlyConsent) and.push({ marketingConsent: true });
  if (f.q) {
    const contains = { contains: f.q, mode: "insensitive" as const };
    const digits = f.q.replace(/\D/g, "");
    const or: Prisma.PlayerWhereInput[] = [{ firstName: contains }, { lastName: contains }, { email: contains }, { club: contains }];
    if (digits.length >= 3) or.push({ whatsapp: { contains: digits } });
    // "Ana García": nombre y apellido juntos
    const [first, ...rest] = f.q.split(/\s+/);
    if (rest.length) {
      or.push({ AND: [{ firstName: { contains: first, mode: "insensitive" } }, { lastName: { contains: rest.join(" "), mode: "insensitive" } }] });
    }
    and.push({ OR: or });
  }
  return and.length ? { AND: and } : {};
}

/**
 * Valores distintos para un desplegable: sin vacíos, unificando mayúsculas y espacios
 * ("Pilar", "pilar ", "PILAR" → una sola opción), ordenados alfabéticamente.
 */
export function distinctOptions(values: (string | null)[]) {
  const seen = new Map<string, string>();
  for (const v of values) {
    const t = v?.trim().replace(/\s+/g, " ");
    if (!t) continue;
    const key = t.toLocaleLowerCase("es");
    if (!seen.has(key)) seen.set(key, t);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, "es"));
}
