/** Reglas puras de cupo e inscripción (sin base): testeables y compartidas por sitio y admin. */

/** Estados que ocupan un lugar del cupo. LISTA_ESPERA y CANCELADA no ocupan. */
export const SEAT_HOLDING_STATUSES = ["PENDIENTE", "SENADA", "CONFIRMADA"] as const;

/** Estados de experiencia visibles en el sitio. */
export const VISIBLE_EXPERIENCE_STATUSES = ["PUBLICADA", "CUPO_COMPLETO", "FINALIZADA"] as const;

/** Estados de experiencia que aceptan inscripciones (con cupo completo, van a lista de espera). */
export const OPEN_EXPERIENCE_STATUSES = ["PUBLICADA", "CUPO_COMPLETO"] as const;

export type SeatCheck = {
  /** Lugares ocupados en la experiencia (sin contar esta inscripción). */
  taken: number;
  capacity: number;
  /** Lugares ocupados en la opción de precio elegida, si tiene cupo propio. */
  optionTaken?: number;
  optionCapacity?: number | null;
};

/** ¿Entra con lugar (PENDIENTE) o queda en lista de espera? */
export function decideStatus({ taken, capacity, optionTaken = 0, optionCapacity }: SeatCheck) {
  if (taken >= capacity) return "LISTA_ESPERA" as const;
  if (optionCapacity != null && optionTaken >= optionCapacity) return "LISTA_ESPERA" as const;
  return "PENDIENTE" as const;
}

/** Tras sumar una inscripción con lugar, ¿se completó el cupo? */
export function fillsCapacity(takenBefore: number, capacity: number) {
  return takenBefore + 1 >= capacity;
}

export function seatsLeft(taken: number, capacity: number) {
  return Math.max(0, capacity - taken);
}

export type ClosedReason = "NOT_OPEN" | "DEADLINE_PASSED" | "ALREADY_STARTED";

/** ¿Se puede inscribir hoy? Devuelve el motivo si no. */
export function registrationClosedReason(
  experience: { status: string; startDate: Date; registrationDeadline: Date | null },
  now: Date,
): ClosedReason | null {
  if (!(OPEN_EXPERIENCE_STATUSES as readonly string[]).includes(experience.status)) return "NOT_OPEN";
  if (experience.startDate <= now) return "ALREADY_STARTED";
  if (experience.registrationDeadline && experience.registrationDeadline < now) return "DEADLINE_PASSED";
  return null;
}
