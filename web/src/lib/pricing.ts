/**
 * Rentabilidad de una experiencia (reglas puras, testeables). Todo es interno del panel.
 *
 * El % de ganancia es sobre el PRECIO FINAL (margen): con 30 %, de cada $100 que paga la persona,
 * $30 son ganancia y $70 cubren costos. Precio = costo / (1 − %).
 */

export type CostItemLike = { amount: number; kind: "TOTAL" | "PER_PERSON" };

/** Máximo permitido: con 100 % el precio sería infinito. */
export const MAX_EARNINGS_PERCENT = 90;

/** Costo grupal por persona: los totales se reparten entre la asistencia esperada; los "por persona" se suman. */
export function sharedCostPerPerson(items: CostItemLike[], attendance: number) {
  const people = Math.max(1, attendance);
  const total = items.filter((i) => i.kind === "TOTAL").reduce((s, i) => s + i.amount, 0);
  const perPerson = items.filter((i) => i.kind === "PER_PERSON").reduce((s, i) => s + i.amount, 0);
  return total / people + perPerson;
}

/** Precio sugerido para cubrir el costo y dejar el % de ganancia, redondeado hacia arriba a $1.000. */
export function suggestedPrice(costPerPerson: number, earningsPercent: number | null | undefined, roundTo = 1000) {
  if (earningsPercent == null || earningsPercent < 0 || earningsPercent > MAX_EARNINGS_PERCENT) return null;
  if (costPerPerson <= 0) return null;
  const raw = costPerPerson / (1 - earningsPercent / 100);
  // Se resta un epsilon para que 130000.00000001 (error de coma flotante) no salte a 131000.
  return Math.ceil(raw / roundTo - 1e-9) * roundTo;
}

/** Ganancia por persona y % real sobre el precio. Sin precio cargado → null. */
export function earningsFor(price: number | null | undefined, costPerPerson: number) {
  if (price == null || price <= 0) return null;
  const amount = Math.round(price - costPerPerson);
  return { amount, percent: (amount / price) * 100 };
}

/**
 * Resultado con las inscripciones actuales (con lugar): ingresos por los precios de cada una
 * menos los costos reales para esa cantidad de personas. Los costos totales se cuentan completos
 * (se pagan igual aunque vengan menos personas).
 */
export function projectedResult({
  items,
  registrations,
}: {
  items: CostItemLike[];
  /** Una entrada por inscripción con lugar: precio y costo propio de su opción. */
  registrations: { price: number | null; optionCost: number | null }[];
}) {
  const people = registrations.length;
  const fixed = items.filter((i) => i.kind === "TOTAL").reduce((s, i) => s + i.amount, 0);
  const perPerson = items.filter((i) => i.kind === "PER_PERSON").reduce((s, i) => s + i.amount, 0);
  const optionCosts = registrations.reduce((s, r) => s + (r.optionCost ?? 0), 0);
  const revenue = registrations.reduce((s, r) => s + (r.price ?? 0), 0);
  const costs = fixed + perPerson * people + optionCosts;
  const missingPrices = registrations.filter((r) => r.price == null).length;
  return { people, revenue, costs, earnings: revenue - costs, missingPrices };
}

/** "30", "30 %", "30%" → 30. Vacío → null. Inválido (decimales, fuera de rango) → undefined. */
export function parsePercent(raw: string | null | undefined): number | null | undefined {
  const v = (raw ?? "").trim().replace(/\s*%$/, "");
  if (v === "") return null;
  if (!/^\d{1,2}$/.test(v)) return undefined;
  const n = Number(v);
  return n <= MAX_EARNINGS_PERCENT ? n : undefined;
}
