import { itinerarySchema, type Itinerary } from "@/lib/itinerary";

/**
 * Reglas puras para crear y editar el contenido de una experiencia desde el panel (testeables).
 */

/** "Experiencia Tenis Gesell", 2026 → "experiencia-tenis-gesell-2026". */
export function slugify(title: string, year?: number) {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");
  const withYear = year && !base.endsWith(String(year)) ? `${base}-${year}` : base;
  return withYear || "experiencia";
}

/** Un slug válido: minúsculas, números y guiones, sin guiones al principio o al final. */
export function isValidSlug(s: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length <= 80;
}

/** Si el slug ya existe, le agrega -2, -3… */
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const set = new Set(taken);
  if (!set.has(base)) return base;
  for (let i = 2; ; i++) if (!set.has(`${base}-${i}`)) return `${base}-${i}`;
}

/** Textarea "una cosa por renglón" → lista sin vacíos, sin viñetas pegadas ("- ", "• ") y sin repetidos. */
export function linesToList(text: string, maxItems = 30, maxLength = 300) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^\s*(?:[-•*·]|\d+[.)])\s+/, "").trim().replace(/\s+/g, " ").slice(0, maxLength);
    if (!line || seen.has(line.toLowerCase())) continue;
    seen.add(line.toLowerCase());
    out.push(line);
    if (out.length >= maxItems) break;
  }
  return out;
}

/**
 * Cronograma enviado por el editor (JSON) → cronograma limpio: sin renglones vacíos ni días vacíos.
 * Devuelve `null` si el JSON no tiene la forma esperada.
 */
export function cleanItinerary(json: string): Itinerary | null {
  let value: unknown;
  try {
    value = JSON.parse(json || "[]");
  } catch {
    return null;
  }
  const parsed = itinerarySchema.safeParse(value);
  if (!parsed.success) return null;
  const clip = (s: string | undefined, n: number) => (s ?? "").trim().replace(/\s+/g, " ").slice(0, n);
  return parsed.data
    .map((d) => {
      const title = clip(d.title, 120);
      return {
        day: clip(d.day, 60),
        ...(title ? { title } : {}),
        items: d.items
          .map((it) => {
            const time = clip(it.time, 40);
            return { ...(time ? { time } : {}), text: clip(it.text, 500) };
          })
          .filter((it) => it.text),
      };
    })
    .filter((d) => d.day || d.items.length)
    .map((d) => ({ ...d, day: d.day || "Día" }))
    .slice(0, 14);
}

/** Input type=date (YYYY-MM-DD) → mediodía de Buenos Aires, igual que el resto de las fechas guardadas. */
export function dateFromInput(raw: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fecha guardada → valor del input date (en hora de Buenos Aires). */
export function dateToInput(d: Date | null | undefined) {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(d);
}

export type DateProblem = "INVALID" | "END_BEFORE_START" | "TOO_LONG";

/** Inicio y fin: válidos, fin ≥ inicio y como mucho 30 días. */
export function checkDates(start: Date | null, end: Date | null): DateProblem | null {
  if (!start || !end) return "INVALID";
  if (end < start) return "END_BEFORE_START";
  if (end.getTime() - start.getTime() > 30 * 24 * 3600 * 1000) return "TOO_LONG";
  return null;
}
