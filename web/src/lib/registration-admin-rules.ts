/** Reglas puras para gestionar inscripciones y pagos desde el panel (testeables, sin base). */
import { SEAT_HOLDING_STATUSES } from "@/lib/registration-rules";

export const REGISTRATION_STATUSES = ["PENDIENTE", "SENADA", "CONFIRMADA", "LISTA_ESPERA", "CANCELADA"] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export function isRegistrationStatus(v: unknown): v is RegistrationStatus {
  return typeof v === "string" && (REGISTRATION_STATUSES as readonly string[]).includes(v);
}

export function holdsSeat(status: string) {
  return (SEAT_HOLDING_STATUSES as readonly string[]).includes(status);
}

/**
 * A qué estados se puede pasar desde cada uno (lo que muestra el panel como botones).
 * Pasar a un estado con lugar desde lista de espera o cancelada exige que haya lugar.
 */
export function nextStatuses(from: RegistrationStatus): RegistrationStatus[] {
  switch (from) {
    case "PENDIENTE":
      return ["SENADA", "CONFIRMADA", "LISTA_ESPERA", "CANCELADA"];
    case "SENADA":
      return ["CONFIRMADA", "PENDIENTE", "CANCELADA"];
    case "CONFIRMADA":
      return ["SENADA", "CANCELADA"];
    case "LISTA_ESPERA":
      return ["PENDIENTE", "CANCELADA"];
    case "CANCELADA":
      return ["PENDIENTE", "LISTA_ESPERA"];
  }
}

/** ¿El cambio necesita un lugar libre? (entra al cupo desde afuera) */
export function needsSeat(from: string, to: string) {
  return !holdsSeat(from) && holdsSeat(to);
}

export type SeatState = {
  /** Lugares ocupados en la experiencia, sin contar esta inscripción. */
  taken: number;
  capacity: number;
  /** Lugares ocupados en la opción elegida, sin contar esta inscripción (si la opción tiene cupo propio). */
  optionTaken?: number;
  optionCapacity?: number | null;
};

/** Motivo por el que no entra al cupo, o null si hay lugar. */
export function seatBlocker({ taken, capacity, optionTaken = 0, optionCapacity }: SeatState) {
  if (taken >= capacity) return "FULL" as const;
  if (optionCapacity != null && optionTaken >= optionCapacity) return "OPTION_FULL" as const;
  return null;
}

type PaymentLike = { amount: number; status: string };

/** Lo cobrado: pagos aprobados. Los rechazados, pendientes o reintegrados no suman. */
export function amountPaid(payments: PaymentLike[]) {
  return payments.filter((p) => p.status === "APROBADO").reduce((sum, p) => sum + p.amount, 0);
}

/** Saldo a cobrar; null si la opción no tiene precio cargado. Nunca negativo. */
export function balanceDue(price: number | null | undefined, paid: number) {
  return price == null ? null : Math.max(0, price - paid);
}

/**
 * Estado sugerido después de registrar un pago. Solo sube (nunca baja) y solo para inscripciones con lugar:
 * pagó el total → CONFIRMADA; pagó algo → SEÑADA. Sin precio cargado, cualquier pago cuenta como seña.
 * Mientras no haya un monto de seña definido, "seña" es lo que Gabriela registre.
 */
export function statusAfterPayment(current: RegistrationStatus, price: number | null | undefined, paid: number): RegistrationStatus {
  if (!holdsSeat(current) || paid <= 0) return current;
  if (price != null && paid >= price) return "CONFIRMADA";
  if (current === "PENDIENTE") return "SENADA";
  return current;
}

/** Número guardado (con espacios, guiones, +) → dígitos para wa.me. Si es un celular argentino sin 54, se lo agrega. */
export function waNumber(raw: string | null | undefined) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("54")) return digits;
  // Local (p. ej. 11 2345 6789 o 011 15 …): prefijo 549 y sin el 0 / 15 iniciales más comunes.
  const local = digits.replace(/^0/, "");
  if (local.length === 10) return `549${local}`;
  return digits;
}
