import "server-only";
import { db } from "@/lib/db";
import { newPayToken } from "@/lib/pay-token";
import { lockExperience } from "@/lib/registration-admin";
import { amountPaid, holdsSeat, statusAfterPayment, type RegistrationStatus } from "@/lib/registration-admin-rules";
import { mapMercadoPagoStatus } from "@/lib/mercadopago-rules";
import type { MercadoPagoPayment } from "@/lib/mercadopago";


/** Devuelve el token de pago de la inscripción, creándolo si todavía no tiene (inscripciones viejas). */
export async function ensurePayToken(registrationId: string) {
  const reg = await db.registration.findUnique({ where: { id: registrationId }, select: { payToken: true } });
  if (!reg) return null;
  if (reg.payToken) return reg.payToken;
  const token = newPayToken();
  const updated = await db.registration.updateMany({ where: { id: registrationId, payToken: null }, data: { payToken: token } });
  if (updated.count === 1) return token;
  return (await db.registration.findUnique({ where: { id: registrationId }, select: { payToken: true } }))?.payToken ?? null;
}

export type ApplyResult =
  | {
      ok: true;
      /** false si la notificación ya estaba aplicada (Mercado Pago reintenta y duplica). */
      changed: boolean;
      registrationId: string;
      paymentStatus: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "REINTEGRADO";
      /** Primera vez que este pago queda aprobado (para mandar el email una sola vez). */
      newlyApproved: boolean;
      registrationStatus: RegistrationStatus;
      statusChanged: boolean;
      /** Algo que Gabriela tiene que mirar a mano. */
      attention: "NO_SEAT" | "REFUND" | null;
    }
  | { ok: false; reason: "NO_REFERENCE" | "NOT_FOUND" | "CURRENCY" | "CONFLICT" };

/**
 * Aplica el estado de un pago de Mercado Pago a nuestra base, de forma idempotente:
 * un `Payment` por operación (externalRef = id de Mercado Pago). Si queda aprobado, sube la
 * inscripción con las mismas reglas que un pago manual (total → CONFIRMADA). Nunca baja el estado:
 * devoluciones y pagos de inscripciones sin lugar quedan marcados para revisar.
 * Toma el mismo candado de fila que la inscripción y el panel.
 */
export async function applyMercadoPagoPayment(p: MercadoPagoPayment): Promise<ApplyResult> {
  if (!p.externalReference) return { ok: false, reason: "NO_REFERENCE" };
  if (p.currency !== "ARS") return { ok: false, reason: "CURRENCY" };
  const reg = await db.registration.findUnique({ where: { id: p.externalReference }, select: { id: true, experienceId: true } });
  if (!reg) return { ok: false, reason: "NOT_FOUND" };
  const status = mapMercadoPagoStatus(p.status);

  return db.$transaction(
    async (tx) => {
      await lockExperience(tx, reg.experienceId);
      const current = await tx.registration.findUnique({
        where: { id: reg.id },
        select: { status: true, priceOption: { select: { price: true } } },
      });
      if (!current) return { ok: false, reason: "NOT_FOUND" } as const;
      const from = current.status as RegistrationStatus;

      const existing = await tx.payment.findUnique({ where: { externalRef: p.id } });
      if (existing && existing.registrationId !== reg.id) return { ok: false, reason: "CONFLICT" } as const;
      if (existing && existing.status === status && existing.amount === p.amount) {
        return { ok: true, changed: false, registrationId: reg.id, paymentStatus: status, newlyApproved: false, registrationStatus: from, statusChanged: false, attention: null } as const;
      }

      const data = {
        amount: p.amount,
        status,
        paidAt: status === "APROBADO" ? (p.dateApproved ?? new Date()) : null,
        notes: p.statusDetail ? `Mercado Pago: ${p.statusDetail}` : null,
      };
      if (existing) await tx.payment.update({ where: { id: existing.id }, data });
      else await tx.payment.create({ data: { ...data, registrationId: reg.id, method: "MERCADO_PAGO", externalRef: p.id } });

      const payments = await tx.payment.findMany({ where: { registrationId: reg.id }, select: { amount: true, status: true } });
      const to = statusAfterPayment(from, current.priceOption?.price, amountPaid(payments));
      if (to !== from) await tx.registration.update({ where: { id: reg.id }, data: { status: to } });

      const newlyApproved = status === "APROBADO" && existing?.status !== "APROBADO";
      const attention =
        status === "REINTEGRADO" && existing?.status !== "REINTEGRADO" ? "REFUND" : newlyApproved && !holdsSeat(from) ? "NO_SEAT" : null;
      return { ok: true, changed: true, registrationId: reg.id, paymentStatus: status, newlyApproved, registrationStatus: to, statusChanged: to !== from, attention } as const;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

/** Lo que necesita la página de pago a partir del token del link. */
export async function getPayContext(token: string) {
  return db.registration.findUnique({
    where: { payToken: token },
    select: {
      id: true,
      status: true,
      priceOptionId: true,
      priceOption: { select: { label: true, price: true } },
      experience: { select: { slug: true, title: true, startDate: true, endDate: true } },
      player: { select: { firstName: true, lastName: true, email: true } },
      payments: { select: { amount: true, status: true, method: true, externalRef: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });
}
