"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { FORM_RATE_LIMIT, checkRateLimit, isHoneypotFilled } from "@/lib/spam";
import { adminRecipients, sendEmail } from "@/lib/email/send";
import { AdminNoticeEmail, ContactReceivedEmail } from "@/lib/email/templates";
import { emailCopy } from "@/content/emails";
import { contactTopicOptions, formCopy } from "@/content/forms";
import { formError, formValues, type FormState } from "@/lib/form-state";

export async function sendContact(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isHoneypotFilled(formData)) return { status: "success" };

  const values = formValues(formData);
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return formError(formCopy.fixErrors, values, fieldErrors(parsed.error));
  }

  try {
    if (!(await checkRateLimit("contact", FORM_RATE_LIMIT))) {
      return formError(formCopy.rateLimited, values);
    }

    const { consent, ...data } = parsed.data;
    const lead = await db.lead.create({ data: { ...data, consent: consent === "on" } });
    const topic = contactTopicOptions.find((o) => o.value === lead.type)?.label ?? lead.type;

    after(async () => {
      await sendEmail({
        to: lead.email,
        subject: emailCopy.contactReceived.subject,
        react: ContactReceivedEmail({ name: lead.name }),
      });
      const admins = adminRecipients();
      if (admins.length) {
        await sendEmail({
          to: admins,
          subject: emailCopy.admin.newLead(topic, lead.name),
          replyTo: lead.email,
          react: AdminNoticeEmail({
            title: emailCopy.admin.newLead(topic, lead.name),
            rows: [
              ["Motivo", topic],
              ["Organización", lead.organization],
              ["Email", lead.email],
              ["WhatsApp", lead.whatsapp],
              ["Mensaje", lead.message],
            ],
          }),
        });
      }
    });

    return { status: "success" };
  } catch (err) {
    console.error("[sendContact]", err);
    return formError(formCopy.genericError, values);
  }
}
