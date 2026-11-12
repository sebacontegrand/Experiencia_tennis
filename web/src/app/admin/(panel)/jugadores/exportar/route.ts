import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { toCsv } from "@/lib/csv";
import { parsePlayerFilters, playerWhere } from "@/lib/player-filters";

/**
 * Lista de jugadores para comunicaciones (Excel). Solo incluye a quienes aceptaron recibir novedades,
 * aunque el filtro de la pantalla no lo pida: es la regla de privacidad de la base.
 */
export async function GET(request: Request) {
  await requireAdmin();
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const players = await db.player.findMany({
    where: playerWhere(parsePlayerFilters(sp), { onlyConsent: true }),
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { _count: { select: { registrations: true } } },
  });

  const c = adminCopy.players;
  const date = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  const header = [
    "Apellido",
    "Nombre",
    "Email",
    "WhatsApp",
    "Ciudad",
    "Club o barrio",
    "Nivel",
    "Género",
    "Cómo nos conoció",
    "Por dónde entró",
    "Experiencias",
    "Acepta novedades desde",
    "En la comunidad desde",
  ];
  const rows = players.map((p) => [
    p.lastName,
    p.firstName,
    p.email,
    p.whatsapp,
    p.city,
    p.club,
    p.level,
    p.gender ? c.gender[p.gender] : null,
    p.referralSource,
    c.source[p.source] ?? p.source,
    p._count.registrations,
    p.marketingConsentAt ? date.format(p.marketingConsentAt) : null,
    date.format(p.createdAt),
  ]);

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
  return new Response(toCsv(header, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jugadores-comunicaciones-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
