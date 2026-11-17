import "server-only";
import { after } from "next/server";
import { db } from "@/lib/db";
import { ensurePayToken } from "@/lib/online-payments";
import { sendEmail } from "@/lib/email/send";
import { ThankYouEmail } from "@/lib/email/templates";
import { emailCopy } from "@/content/emails";
import { absoluteUrl } from "@/config/site";
import { formatDateRange } from "@/lib/format";

/**
 * Email de agradecimiento post-experiencia: fotos, formulario de testimonio y (solo a quien
 * aceptó novedades) las próximas fechas. Va a quienes tuvieron lugar pagado (señada o confirmada).
 */
const ATTENDED = { in: ["SENADA", "CONFIRMADA"] as ("SENADA" | "CONFIRMADA")[] };

export async function thankYouRecipients(experienceId: string) {
  return db.registration.findMany({
    where: { experienceId, status: ATTENDED },
    orderBy: { createdAt: "asc" },
    select: { id: true, player: { select: { firstName: true, email: true, marketingConsent: true } } },
  });
}

/** Arma el email de una persona (lo usan el envío y la vista previa del panel). */
export async function buildThankYou(experienceId: string, recipient: { registrationId: string | null; firstName: string; marketingConsent: boolean }) {
  const exp = await db.experience.findUniqueOrThrow({
    where: { id: experienceId },
    select: { slug: true, title: true, _count: { select: { gallery: { where: { isPublic: true } } } } },
  });
  const today = new Date(new Date().toISOString().slice(0, 10));
  const upcoming = recipient.marketingConsent
    ? await db.experience.findMany({
        where: { status: { in: ["PUBLICADA", "CUPO_COMPLETO"] }, endDate: { gte: today }, id: { not: experienceId } },
        orderBy: { startDate: "asc" },
        take: 3,
        select: { slug: true, title: true, startDate: true, endDate: true },
      })
    : [];
  const token = recipient.registrationId ? await ensurePayToken(recipient.registrationId) : null;
  return {
    subject: emailCopy.thankYou.subject(exp.title),
    react: ThankYouEmail({
      firstName: recipient.firstName,
      title: exp.title,
      albumUrl: exp._count.gallery > 0 ? absoluteUrl(`/galeria/${exp.slug}`) : undefined,
      testimonialUrl: token ? absoluteUrl(`/opinar/${token}`) : absoluteUrl("/contacto"),
      upcoming: upcoming.map((u) => ({ title: u.title, dates: formatDateRange(u.startDate, u.endDate), url: absoluteUrl(`/experiencias/${u.slug}`) })),
      calendarUrl: absoluteUrl("/calendario"),
    }),
  };
}

export type ThankYouResult = { ok: true; count: number } | { ok: false; reason: "ALREADY_SENT" | "NOT_STARTED" | "NO_RECIPIENTS" | "NOT_FOUND" };

/** Marca el envío (una sola vez, aunque se apriete dos veces) y manda los emails en segundo plano. */
export async function sendThankYou(experienceId: string, now = new Date()): Promise<ThankYouResult> {
  const exp = await db.experience.findUnique({ where: { id: experienceId }, select: { startDate: true } });
  if (!exp) return { ok: false, reason: "NOT_FOUND" };
  if (exp.startDate > now) return { ok: false, reason: "NOT_STARTED" };
  const recipients = await thankYouRecipients(experienceId);
  if (recipients.length === 0) return { ok: false, reason: "NO_RECIPIENTS" };

  const claimed = await db.experience.updateMany({ where: { id: experienceId, thankYouSentAt: null }, data: { thankYouSentAt: now } });
  if (claimed.count === 0) return { ok: false, reason: "ALREADY_SENT" };

  after(async () => {
    for (const r of recipients) {
      const email = await buildThankYou(experienceId, { registrationId: r.id, firstName: r.player.firstName, marketingConsent: r.player.marketingConsent });
      await sendEmail({ to: r.player.email, subject: email.subject, react: email.react });
      // Resend permite pocos envíos por segundo: vamos de a uno.
      await new Promise((res) => setTimeout(res, 600));
    }
  });
  return { ok: true, count: recipients.length };
}
