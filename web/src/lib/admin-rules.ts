/** Reglas puras del panel admin (testeables). */

/**
 * Precio escrito a mano → entero en pesos. Acepta "850000", "850.000", "$ 850.000".
 * Vacío → null ("Consultar"). Con centavos o texto → undefined (inválido).
 */
export function parsePrice(raw: string | null | undefined): number | null | undefined {
  const value = (raw ?? "").trim();
  if (value === "") return null;
  const cleaned = value.replace(/^\$\s*/, "").replace(/\s/g, "");
  if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(cleaned)) return undefined;
  const n = Number(cleaned.replace(/\./g, ""));
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
}

type Status = "BORRADOR" | "PUBLICADA" | "CUPO_COMPLETO" | "FINALIZADA" | "CANCELADA";

/** Tras cambiar el cupo: una publicada se completa o se reabre según los lugares ocupados. */
export function statusAfterCapacityChange(status: Status, taken: number, capacity: number): Status {
  if (status === "PUBLICADA" && taken >= capacity) return "CUPO_COMPLETO";
  if (status === "CUPO_COMPLETO" && taken < capacity) return "PUBLICADA";
  return status;
}

/** Al publicar un borrador: si ya está lleno (caso raro), entra como CUPO_COMPLETO. */
export function statusOnPublish(taken: number, capacity: number): Status {
  return taken >= capacity ? "CUPO_COMPLETO" : "PUBLICADA";
}
