"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { FORM_RATE_LIMIT, checkRateLimit, isHoneypotFilled } from "@/lib/spam";
import { formError, formValues, type FormErrorState } from "@/lib/form-state";
import { fieldErrors } from "@/lib/validation";
import { canLeaveTestimonial, testimonialFormSchema } from "@/lib/testimonial-rules";
import { isPayToken } from "@/lib/mercadopago-rules";
import { getTestimonialContext } from "@/lib/testimonials";
import { adminRecipients, sendEmail } from "@/lib/email/send";
import { AdminNoticeEmail } from "@/lib/email/templates";
import { formCopy } from "@/content/forms";
import { testimonialCopy } from "@/content/testimonials";

export type TestimonialFormState = { status: "idle" } | FormErrorState | { status: "sent"; updated: boolean };

const c = testimonialCopy.form;

/** Guarda el testimonio oculto (lo publica Gabriela desde el panel). Uno por inscripción. */
export async function submitTestimonial(token: string, _prev: TestimonialFormState, formData: FormData): Promise<TestimonialFormState> {
  if (isHoneypotFilled(formData)) return { status: "sent", updated: false };
  const values = formValues(formData);
  if (!isPayToken(token)) return formError(c.notAllowed.title, values);

  const parsed = testimonialFormSchema.safeParse(values);
  if (!parsed.success) return formError(formCopy.fixErrors, values, fieldErrors(parsed.error));
  if (!(await checkRateLimit("testimonial", FORM_RATE_LIMIT))) return formError(formCopy.rateLimited, values);

  const reg = await getTestimonialContext(token);
  if (!reg || canLeaveTestimonial(reg.status, reg.experience.startDate)) return formError(c.notAllowed.title, values);

  const data = { authorName: parsed.data.authorName, authorInfo: parsed.data.authorInfo ?? null, quote: parsed.data.quote };
  const existed = Boolean(reg.testimonial);
  // Si ya estaba publicado y lo cambia, vuelve a revisión.
  await db.testimonial.upsert({
    where: { registrationId: reg.id },
    update: { ...data, isPublic: false },
    create: { ...data, registrationId: reg.id, experienceId: reg.experience.id, isPublic: false },
  });

  after(async () => {
    const admins = adminRecipients();
    if (!admins.length) return;
    const subject = `Nuevo testimonio · ${reg.experience.title}: ${data.authorName}`;
    await sendEmail({ to: admins, subject, react: AdminNoticeEmail({ title: subject, rows: [["Texto", data.quote], ["Revisar en", "/admin/testimonios"]] }) });
  });
  return { status: "sent", updated: existed };
}
