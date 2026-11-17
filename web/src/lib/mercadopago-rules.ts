/** Reglas puras del pago online con Mercado Pago (testeables, sin base ni red). */
import { amountPaid, balanceDue, holdsSeat } from "@/lib/registration-admin-rules";

type PaymentStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "REINTEGRADO";

/**
 * Estado de un pago de Mercado Pago → estado de nuestro `Payment`.
 * Solo "approved" suma a lo cobrado. Contracargos y devoluciones quedan como REINTEGRADO.
 */
export function mapMercadoPagoStatus(status: string | null | undefined): PaymentStatus {
  switch (status) {
    case "approved":
      return "APROBADO";
    case "refunded":
    case "charged_back":
      return "REINTEGRADO";
    case "rejected":
    case "cancelled":
      return "RECHAZADO";
    default:
      // pending, in_process, authorized, in_mediation o desconocido: todavía no cuenta.
      return "PENDIENTE";
  }
}

export type PayableState =
  | { ok: true; amount: number }
  | { ok: false; reason: "NO_PRICE" | "PAID" | "NO_SEAT" };

/**
 * ¿Puede pagar online y cuánto? Solo inscripciones con lugar (pendiente o señada) y con precio
 * cargado. Se cobra el saldo: el total menos lo que ya se registró como pagado.
 */
export function payableAmount(status: string, price: number | null | undefined, payments: { amount: number; status: string }[]): PayableState {
  if (!holdsSeat(status)) return { ok: false, reason: "NO_SEAT" };
  const due = balanceDue(price, amountPaid(payments));
  if (due == null) return { ok: false, reason: "NO_PRICE" };
  if (due <= 0) return { ok: false, reason: "PAID" };
  return { ok: true, amount: due };
}

/** Mercado Pago informa montos con decimales; guardamos pesos enteros. */
export function toPesos(amount: number | null | undefined) {
  return Math.round(Number(amount ?? 0));
}

/** Mercado Pago solo acepta back_urls y notification_url públicas por HTTPS (no localhost). */
export function isPublicHttpsUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !["localhost", "127.0.0.1"].includes(u.hostname);
  } catch {
    return false;
  }
}

/** Token del link de pago: 32 caracteres URL-safe, imposible de adivinar. */
export function isPayToken(value: string) {
  return /^[A-Za-z0-9_-]{32}$/.test(value);
}
