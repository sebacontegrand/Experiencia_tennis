"use server";

import { after } from "next/server";
import { updateTag } from "next/cache";
import { registrationSchema, fieldErrors } from "@/lib/validation";
import { FORM_RATE_LIMIT, checkRateLimit, isHoneypotFilled } from "@/lib/spam";
import { communityInputToPlayer } from "@/lib/players";
import { isUniqueViolation, registerForExperience, type RegistrationRequest } from "@/lib/registrations";
import { experienceTag } from "@/lib/data/public";
import { adminRecipients, sendEmail } from "@/lib/email/send";
import { AdminNoticeEmail, RegistrationEmail } from "@/lib/email/templates";
import { emailCopy } from "@/content/emails";
import { experiencesCopy } from "@/content/experiences";
import { formCopy } from "@/content/forms";
import { formError, formValues, type FormErrorState } from "@/lib/form-state";
import { siteConfig, whatsappLink } from "@/config/site";
import { formatDateRange, formatPrice } from "@/lib/format";

export type RegistrationFormState =
  | { status: "idle" }
  | FormErrorState
  | { status: "registered"; registrationStatus: "PENDIENTE" | "LISTA_ESPERA"; firstName: string };

const copy = experiencesCopy.registration;

export async function registerAction(
  slug: string,
  _prev: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  if (isHoneypotFilled(formData)) return { status: "registered", registrationStatus: "PENDIENTE", firstName: "" };

  const values = formValues(formData);
  const parsed = registrationSchema.safeParse(values);
  if (!parsed.success) {
    return formError(formCopy.fixErrors, values, fieldErrors(parsed.error));
  }

  try {
    if (!(await checkRateLimit("registration", FORM_RATE_LIMIT))) {
      return formError(formCopy.rateLimited, values);
    }

    const { priceOptionId, doublesPartner, roommate, menuChoice, notes, ...personal } = parsed.data;
    const request: RegistrationRequest = {
      experienceSlug: slug,
      player: communityInputToPlayer(personal),
      priceOptionId,
      doublesPartner,
      roommate,
      menuChoice,
      notes,
    };

    let result;
    try {
      result = await registerForExperience(request);
    } catch (err) {
      // Dos altas simultáneas del mismo email nuevo: la segunda choca con la única; reintentamos una vez.
      if (!isUniqueViolation(err)) throw err;
      result = await registerForExperience(request);
    }

    if (!result.ok) {
      if (result.reason === "DUPLICATE") return formError(copy.duplicate(result.status), values);
      const fieldKey = result.reason === "INVALID_OPTION" ? "priceOptionId" : result.reason === "INVALID_MENU" ? "menuChoice" : null;
      const message = copy.errors[result.reason];
      return formError(message, values, fieldKey ? { [fieldKey]: message } : undefined);
    }

    // Cupos y estado cambiaron: el detalle y los listados se ven actualizados al instante.
    updateTag(experienceTag(slug));
    updateTag("experiences");

    const { player } = request;
    const fullName = `${player.firstName} ${player.lastName}`;
    const dates = formatDateRange(result.experience.startDate, result.experience.endDate);
    const price = result.priceOption ? formatPrice(result.priceOption.price) : undefined;

    after(async () => {
      await sendEmail({
        to: player.email,
        subject: emailCopy.registration.subject[result.status](result.experience.title),
        react: RegistrationEmail({
          firstName: player.firstName,
          status: result.status,
          title: result.experience.title,
          dates,
          optionLabel: result.priceOption?.label,
          price,
          payment: {
            alias: siteConfig.payments.transferAlias,
            cbu: siteConfig.payments.transferCbu,
            holder: siteConfig.payments.transferHolder,
          },
          whatsappHref: whatsappLink(copy.payment.whatsappMessage(result.experience.title, fullName)),
        }),
      });
      const admins = adminRecipients();
      if (admins.length) {
        const title = emailCopy.admin.newRegistration(result.status, result.experience.title, fullName);
        await sendEmail({
          to: admins,
          subject: title,
          replyTo: player.email,
          react: AdminNoticeEmail({
            title,
            rows: [
              ["Estado", result.status === "LISTA_ESPERA" ? "Lista de espera" : "Pendiente de seña"],
              ["Opción", result.priceOption?.label],
              ["Email", player.email],
              ["WhatsApp", player.whatsapp],
              ["Nivel", player.level],
              ["Compañero/a de dobles", doublesPartner],
              ["Comparte habitación con", roommate],
              ["Menú", menuChoice],
              ["Comentarios", notes],
              ["Persona nueva en la comunidad", result.playerCreated ? "Sí" : "No"],
            ],
          }),
        });
        if (result.filledCapacity) {
          await sendEmail({
            to: admins,
            subject: emailCopy.admin.capacityFilled(result.experience.title),
            react: AdminNoticeEmail({ title: emailCopy.admin.capacityFilled(result.experience.title), rows: [] }),
          });
        }
      }
    });

    return { status: "registered", registrationStatus: result.status, firstName: player.firstName };
  } catch (err) {
    console.error("[registerAction]", err);
    return formError(formCopy.genericError, values);
  }
}
