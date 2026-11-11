"use server";

import { after } from "next/server";
import { communitySchema, fieldErrors } from "@/lib/validation";
import { FORM_RATE_LIMIT, checkRateLimit, isHoneypotFilled } from "@/lib/spam";
import { communityInputToPlayer, upsertPlayer } from "@/lib/players";
import { adminRecipients, sendEmail } from "@/lib/email/send";
import { AdminNoticeEmail, WelcomeEmail } from "@/lib/email/templates";
import { emailCopy } from "@/content/emails";
import { formCopy } from "@/content/forms";
import { formError, formValues, type FormState } from "@/lib/form-state";

export async function joinCommunity(_prev: FormState, formData: FormData): Promise<FormState> {
  // Bot: respondemos como si todo hubiera salido bien, sin guardar nada.
  if (isHoneypotFilled(formData)) return { status: "success" };

  const values = formValues(formData);
  const parsed = communitySchema.safeParse(values);
  if (!parsed.success) {
    return formError(formCopy.fixErrors, values, fieldErrors(parsed.error));
  }

  try {
    if (!(await checkRateLimit("community", FORM_RATE_LIMIT))) {
      return formError(formCopy.rateLimited, values);
    }

    const { player, created } = await upsertPlayer(communityInputToPlayer(parsed.data), "COMUNIDAD");
    const fullName = `${player.firstName} ${player.lastName}`;

    after(async () => {
      if (created) {
        await sendEmail({
          to: player.email,
          subject: emailCopy.welcome.subject,
          react: WelcomeEmail({ firstName: player.firstName }),
        });
      }
      const admins = adminRecipients();
      if (admins.length) {
        await sendEmail({
          to: admins,
          subject: created ? emailCopy.admin.newPlayer(fullName) : emailCopy.admin.existingPlayer(fullName),
          replyTo: player.email,
          react: AdminNoticeEmail({
            title: created ? emailCopy.admin.newPlayer(fullName) : emailCopy.admin.existingPlayer(fullName),
            rows: [
              ["Email", player.email],
              ["WhatsApp", player.whatsapp],
              ["Ciudad", player.city],
              ["Club o barrio", player.club],
              ["Nivel", player.level],
              ["Cómo nos conoció", player.referralSource],
            ],
          }),
        });
      }
    });

    return { status: "success" };
  } catch (err) {
    console.error("[joinCommunity]", err);
    return formError(formCopy.genericError, values);
  }
}
