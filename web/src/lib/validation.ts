import { z } from "zod";
import { contactTopicValues, genderValues, levelOptions, referralOptions } from "@/content/forms";

/** Texto opcional: recorta espacios y convierte "" en undefined. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => (v ? v : undefined));

const requiredText = (max: number, message: string) =>
  z.string({ error: message }).trim().min(1, message).max(max, `Máximo ${max} caracteres`);

const email = z
  .string({ error: "Ingresá tu email" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Ingresá un email válido").max(200));

/** WhatsApp argentino o internacional: 8 a 15 dígitos, admite +, espacios y guiones. */
export const whatsapp = z
  .string({ error: "Ingresá tu WhatsApp" })
  .trim()
  .refine((v) => /^\+?[\d\s()-]+$/.test(v), "Usá solo números, espacios o guiones")
  .refine((v) => {
    const digits = v.replace(/\D/g, "").length;
    return digits >= 8 && digits <= 15;
  }, "Revisá el número: tiene que incluir la característica");

const consent = z.literal("on", { error: "Necesitamos tu consentimiento para guardar tus datos" });

const enumOrUndefined = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .union([z.enum(values), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined));

export const communitySchema = z.object({
  firstName: requiredText(80, "Ingresá tu nombre"),
  lastName: requiredText(80, "Ingresá tu apellido"),
  email,
  whatsapp,
  city: optionalText(100),
  club: optionalText(120),
  level: enumOrUndefined(levelOptions),
  gender: enumOrUndefined(genderValues),
  referralSource: enumOrUndefined(referralOptions),
  consent,
});

export type CommunityInput = z.infer<typeof communitySchema>;

export const contactSchema = z.object({
  type: z.enum(contactTopicValues, {
    error: "Elegí un motivo",
  }),
  name: requiredText(120, "Ingresá tu nombre"),
  organization: optionalText(150),
  email,
  whatsapp: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(whatsapp.optional()),
  message: requiredText(3000, "Contanos en qué te podemos ayudar"),
  consent,
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Convierte los issues de Zod en { campo: primer mensaje }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Inscripción: datos de la persona (como la comunidad) + datos de la experiencia. */
export const registrationSchema = communitySchema.extend({
  priceOptionId: optionalText(40),
  doublesPartner: optionalText(120),
  roommate: optionalText(200),
  menuChoice: optionalText(120),
  notes: optionalText(1000),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
