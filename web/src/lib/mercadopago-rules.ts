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

export const MAX_INSTALLMENTS = 6;

export type InstallmentPlan = {
  /** Saldo completo (siempre se puede pagar). */
  balance: number;
  /** Monto de una cuota, o null si hoy solo se puede pagar el total. */
  installment: number | null;
  /** Número de la próxima cuota (1-based) y total de cuotas, para mostrar "Cuota 2 de 3". */
  next: number;
  total: number;
  deadline: Date | null;
};

/**
 * Cuotas iguales del precio total hasta la fecha límite. Cada cuota = precio / cuotas (redondeado
 * hacia arriba al peso). Si el saldo ya es una cuota o menos, o pasó la fecha límite, solo el total.
 * El saldo y las cuotas se calculan siempre con lo cobrado de verdad (pagos aprobados).
 */
export function installmentPlan(args: {
  price: number;
  paid: number;
  installments: number | null | undefined;
  deadline: Date | null | undefined;
  now?: Date;
}): InstallmentPlan {
  const { price, paid, deadline = null, now = new Date() } = args;
  const n = Math.min(MAX_INSTALLMENTS, Math.max(1, args.installments ?? 1));
  const balance = Math.max(0, price - paid);
  const share = Math.ceil(price / n);
  const open = n > 1 && deadline != null && now.getTime() <= deadline.getTime();
  const next = Math.min(n, Math.floor(paid / share) + 1);
  return { balance, installment: open && balance > share ? share : null, next, total: n, deadline };
}

/** ¿Toca el recordatorio? Desde 7 días antes de la fecha límite y mientras no haya vencido. */
export function reminderDue(deadline: Date | null | undefined, now = new Date()) {
  if (!deadline) return false;
  const ms = deadline.getTime() - now.getTime();
  return ms > 0 && ms <= 7 * 24 * 3600_000;
}
