import "server-only";
import { db } from "@/lib/db";
import { ensurePayToken } from "@/lib/online-payments";
import { payableAmount, reminderDue } from "@/lib/mercadopago-rules";
import { sendEmail } from "@/lib/email/send";
import { PaymentReminderEmail } from "@/lib/email/templates";
import { paymentCopy } from "@/content/payments";
import { absoluteUrl } from "@/config/site";
import { formatDate, formatPrice } from "@/lib/format";

/**
 * Recordatorio de saldo (lo corre el cron diario): a quien tiene lugar y debe plata, desde 7 días
 * antes de la fecha límite de pago de su experiencia. Una sola vez por inscripción.
 */
export async function sendPaymentReminders(now = new Date(), send = sendEmail) {
  const experiences = await db.experience.findMany({
    where: { paymentDeadline: { gt: now }, status: { in: ["PUBLICADA", "CUPO_COMPLETO"] } },
    select: { id: true, title: true, paymentDeadline: true },
  });
  let sent = 0;
  for (const exp of experiences) {
    if (!reminderDue(exp.paymentDeadline, now)) continue;
    const regs = await db.registration.findMany({
      where: { experienceId: exp.id, status: { in: ["PENDIENTE", "SENADA"] }, paymentReminderSentAt: null },
      select: {
        id: true,
        status: true,
        priceOption: { select: { price: true } },
        payments: { select: { amount: true, status: true } },
        player: { select: { firstName: true, email: true } },
      },
    });
    for (const r of regs) {
      const due = payableAmount(r.status, r.priceOption?.price, r.payments);
      if (!due.ok) continue;
      // Marcar antes de mandar: si el cron corre dos veces, no duplica.
      const claimed = await db.registration.updateMany({ where: { id: r.id, paymentReminderSentAt: null }, data: { paymentReminderSentAt: now } });
      if (claimed.count === 0) continue;
      const token = await ensurePayToken(r.id);
      if (!token) continue;
      await send({
        to: r.player.email,
        subject: paymentCopy.reminder.subject(exp.title),
        react: PaymentReminderEmail({
          firstName: r.player.firstName,
          title: exp.title,
          deadline: formatDate(exp.paymentDeadline!),
          balance: formatPrice(due.amount),
          payUrl: absoluteUrl(`/pagar/${token}`),
        }),
      });
      sent++;
      await new Promise((res) => setTimeout(res, 600));
    }
  }
  return { sent };
}
