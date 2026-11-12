import "server-only";
import { db } from "@/lib/db";
import type { Prisma, ExperienceStatus, PaymentMethod } from "@/generated/prisma/client";
import { SEAT_HOLDING_STATUSES } from "@/lib/registration-rules";
import { statusAfterCapacityChange } from "@/lib/admin-rules";
import {
  amountPaid,
  needsSeat,
  nextStatuses,
  seatBlocker,
  statusAfterPayment,
  type RegistrationStatus,
} from "@/lib/registration-admin-rules";

type Tx = Prisma.TransactionClient;
type LockedExperience = { id: string; slug: string; status: ExperienceStatus; capacity: number };

/** Bloquea la fila de la experiencia: el mismo candado que usan las inscripciones públicas. */
async function lockExperience(tx: Tx, experienceId: string) {
  const [exp] = await tx.$queryRaw<LockedExperience[]>`
    SELECT id, slug, status, capacity FROM "Experience" WHERE id = ${experienceId} FOR UPDATE`;
  return exp;
}

const holding = { in: [...SEAT_HOLDING_STATUSES] };

/** Con el candado tomado: deja la experiencia en PUBLICADA o CUPO_COMPLETO según los lugares ocupados. */
async function syncExperienceStatus(tx: Tx, exp: LockedExperience) {
  const taken = await tx.registration.count({ where: { experienceId: exp.id, status: holding } });
  const next = statusAfterCapacityChange(exp.status, taken, exp.capacity);
  if (next !== exp.status) await tx.experience.update({ where: { id: exp.id }, data: { status: next } });
  return next;
}

export type StatusChangeResult =
  | { ok: true; status: RegistrationStatus; slug: string; experienceStatus: ExperienceStatus }
  | { ok: false; reason: "NOT_FOUND" | "NOT_ALLOWED" | "FULL" | "OPTION_FULL" };

/**
 * Cambia el estado de una inscripción respetando el cupo.
 * Cancelar (o mandar a lista de espera) libera el lugar y, si la experiencia estaba completa, la reabre.
 * Pasar a un estado con lugar desde afuera del cupo exige lugar libre (no se sobrevende desde el panel).
 */
export async function changeRegistrationStatus(registrationId: string, to: RegistrationStatus): Promise<StatusChangeResult> {
  const reg = await db.registration.findUnique({ where: { id: registrationId }, select: { experienceId: true } });
  if (!reg) return { ok: false, reason: "NOT_FOUND" };

  return db.$transaction(
    async (tx) => {
      const exp = await lockExperience(tx, reg.experienceId);
      // Releer con el candado tomado: otro cambio pudo pasar entre medio.
      const current = await tx.registration.findUnique({
        where: { id: registrationId },
        select: { status: true, priceOptionId: true, priceOption: { select: { capacity: true } } },
      });
      if (!exp || !current) return { ok: false, reason: "NOT_FOUND" } as const;
      const from = current.status as RegistrationStatus;
      if (!nextStatuses(from).includes(to)) return { ok: false, reason: "NOT_ALLOWED" } as const;

      if (needsSeat(from, to)) {
        const taken = await tx.registration.count({ where: { experienceId: exp.id, status: holding } });
        const optionCapacity = current.priceOption?.capacity;
        const optionTaken =
          optionCapacity != null && current.priceOptionId
            ? await tx.registration.count({ where: { priceOptionId: current.priceOptionId, status: holding } })
            : 0;
        const blocker = seatBlocker({ taken, capacity: exp.capacity, optionTaken, optionCapacity });
        if (blocker) return { ok: false, reason: blocker } as const;
      }

      await tx.registration.update({ where: { id: registrationId }, data: { status: to } });
      const experienceStatus = await syncExperienceStatus(tx, exp);
      return { ok: true, status: to, slug: exp.slug, experienceStatus } as const;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export type PaymentInput = { amount: number; method: PaymentMethod; paidAt: Date; notes?: string | null };

export type PaymentResult =
  | { ok: true; status: RegistrationStatus; statusChanged: boolean; paid: number; slug: string }
  | { ok: false; reason: "NOT_FOUND" };

/**
 * Registra un pago manual (transferencia o efectivo) como aprobado y sube el estado si corresponde:
 * pago parcial → SEÑADA, total → CONFIRMADA. Nunca baja el estado ni toca lista de espera o canceladas.
 */
export async function recordPayment(registrationId: string, input: PaymentInput): Promise<PaymentResult> {
  return db.$transaction(async (tx) => {
    const reg = await tx.registration.findUnique({
      where: { id: registrationId },
      select: { status: true, priceOption: { select: { price: true } }, experience: { select: { slug: true } } },
    });
    if (!reg) return { ok: false, reason: "NOT_FOUND" } as const;

    await tx.payment.create({
      data: {
        registrationId,
        amount: input.amount,
        method: input.method,
        status: "APROBADO",
        paidAt: input.paidAt,
        notes: input.notes || null,
      },
    });
    const payments = await tx.payment.findMany({ where: { registrationId }, select: { amount: true, status: true } });
    const paid = amountPaid(payments);
    const from = reg.status as RegistrationStatus;
    const status = statusAfterPayment(from, reg.priceOption?.price, paid);
    if (status !== from) await tx.registration.update({ where: { id: registrationId }, data: { status } });
    return { ok: true, status, statusChanged: status !== from, paid, slug: reg.experience.slug } as const;
  });
}

/** Borra un pago cargado por error. No cambia el estado: eso lo decide Gabriela con los botones. */
export async function deletePayment(registrationId: string, paymentId: string) {
  const { count } = await db.payment.deleteMany({ where: { id: paymentId, registrationId } });
  return count > 0;
}

/** Lugares libres y primera persona en lista de espera (para sugerir a quién llamar). */
export async function waitlistSuggestion(experienceId: string, capacity: number) {
  const [taken, first] = await Promise.all([
    db.registration.count({ where: { experienceId, status: holding } }),
    db.registration.findFirst({
      where: { experienceId, status: "LISTA_ESPERA" },
      orderBy: { createdAt: "asc" },
      select: { id: true, createdAt: true, player: { select: { firstName: true, lastName: true } } },
    }),
  ]);
  const free = Math.max(0, capacity - taken);
  return free > 0 && first ? { free, first } : null;
}
