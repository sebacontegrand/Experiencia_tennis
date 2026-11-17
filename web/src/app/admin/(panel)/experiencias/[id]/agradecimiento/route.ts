import { render } from "@react-email/render";
import { requireAdmin } from "@/lib/admin";
import { buildThankYou, thankYouRecipients } from "@/lib/thank-you";
import { db } from "@/lib/db";

/** Vista previa del email de agradecimiento, armado para la primera persona que lo va a recibir. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!(await db.experience.findUnique({ where: { id }, select: { id: true } }))) return new Response("No encontrada", { status: 404 });
  const [first] = await thankYouRecipients(id);
  const email = await buildThankYou(id, {
    registrationId: first?.id ?? null,
    firstName: first?.player.firstName ?? "Laura",
    marketingConsent: true,
  });
  const html = await render(email.react);
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } });
}
