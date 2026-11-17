import "server-only";
import { after } from "next/server";
import { db } from "@/lib/db";
import { fetchPayment } from "@/lib/mercadopago";
import { applyMercadoPagoPayment, type ApplyResult } from "@/lib/online-payments";
import { adminRecipients, sendEmail } from "@/lib/email/send";
import { AdminNoticeEmail, PaymentApprovedEmail } from "@/lib/email/templates";
import { paymentCopy } from "@/content/payments";
import { experiencesCopy } from "@/content/experiences";
import { whatsappLink } from "@/config/site";
import { formatDateRange, formatPrice } from "@/lib/format";

/**
 * Lee el pago en Mercado Pago, lo aplica (idempotente) y avisa por email una sola vez:
 * al jugador cuando se aprueba y a los administradores si hay algo para revisar.
 * Lo usan el webhook y la página de vuelta de Mercado Pago.
 */
export async function syncMercadoPagoPayment(paymentId: string): Promise<ApplyResult> {
  const payment = await fetchPayment(paymentId);
  const result = await applyMercadoPagoPayment(payment);
  if (result.ok && result.changed && (result.newlyApproved || result.attention)) {
    after(() => notify(result, payment.id, payment.amount));
  }
  return result;
}

async function notify(result: Extract<ApplyResult, { ok: true }>, operation: string, amount: number) {
  const reg = await db.registration.findUnique({
    where: { id: result.registrationId },
    select: {
      player: { select: { firstName: true, lastName: true, email: true } },
      experience: { select: { title: true, startDate: true, endDate: true } },
    },
  });
  if (!reg) return;
  const name = `${reg.player.firstName} ${reg.player.lastName}`;
  const title = reg.experience.title;

  if (result.newlyApproved && !result.attention) {
    await sendEmail({
      to: reg.player.email,
      subject: paymentCopy.email.subject(title),
      react: PaymentApprovedEmail({
        firstName: reg.player.firstName,
        title,
        dates: formatDateRange(reg.experience.startDate, reg.experience.endDate),
        amount: formatPrice(amount),
        operation,
        confirmed: result.registrationStatus === "CONFIRMADA",
        whatsappHref: whatsappLink(experiencesCopy.registration.payment.whatsappMessage(title, name)),
      }),
    });
  }

  const admins = adminRecipients();
  if (!admins.length) return;
  const subject = result.attention ? paymentCopy.admin.attention(title, name) : paymentCopy.admin.approved(title, name);
  await sendEmail({
    to: admins,
    subject,
    replyTo: reg.player.email,
    react: AdminNoticeEmail({
      title: subject,
      rows: [
        ["Monto", formatPrice(amount)],
        ["Operación", operation],
        ["Estado de la inscripción", result.registrationStatus],
        ["Para revisar", result.attention ? paymentCopy.admin.attentionWhy[result.attention] : null],
      ],
    }),
  });
}
