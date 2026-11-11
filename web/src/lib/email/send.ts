import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";

type SendArgs = { to: string | string[]; subject: string; react: ReactElement; replyTo?: string };

let client: Resend | null = null;
function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client ??= new Resend(key);
  return client;
}

/**
 * Envía un email transaccional. Sin RESEND_API_KEY (desarrollo) lo registra en consola.
 * Nunca lanza: un fallo de email no debe romper el alta del formulario.
 */
export async function sendEmail({ to, subject, react, replyTo }: SendArgs) {
  const from = process.env.EMAIL_FROM ?? "Experiencia Tenis <onboarding@resend.dev>";
  const api = resend();
  if (!api) {
    console.info(`[email:dev] → ${[to].flat().join(", ")} | ${subject}`);
    return;
  }
  try {
    const { error } = await api.emails.send({ from, to, subject, react, replyTo });
    if (error) console.error("[email] Resend error", error);
  } catch (err) {
    console.error("[email] fallo al enviar", err);
  }
}

export function adminRecipients() {
  return (process.env.ADMIN_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
