/** Reglas anti-spam puras (sin base ni headers): compartidas por cliente, servidor y tests. */

/** Nombre del campo trampa. Las personas no lo ven; los bots suelen completarlo. */
export const HONEYPOT_FIELD_NAME = "website";

export function isHoneypotFilled(formData: FormData) {
  const value = formData.get(HONEYPOT_FIELD_NAME);
  return typeof value === "string" && value.trim().length > 0;
}

export type RateLimitOptions = { limit: number; windowMs: number };

/** ¿Se supera el límite con `previousHits` envíos previos dentro de la ventana? */
export function exceedsLimit(previousHits: number, { limit }: RateLimitOptions) {
  return previousHits >= limit;
}

/** 5 envíos cada 10 minutos por formulario e IP. */
export const FORM_RATE_LIMIT: RateLimitOptions = { limit: 5, windowMs: 10 * 60 * 1000 };
