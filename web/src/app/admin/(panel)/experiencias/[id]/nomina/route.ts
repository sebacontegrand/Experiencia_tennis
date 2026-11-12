import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { fileSlug, toCsv } from "@/lib/csv";
import { amountPaid, balanceDue } from "@/lib/registration-admin-rules";

/**
 * Nómina de una experiencia en CSV (para el hotel, el club o la organización).
 * Por defecto solo quienes tienen lugar; `?todas=1` incluye lista de espera y canceladas.
 */
export async function GET(request: Request, ctx: RouteContext<"/admin/experiencias/[id]/nomina">) {
  await requireAdmin();
  const { id } = await ctx.params;
  const all = new URL(request.url).searchParams.get("todas") === "1";

  const exp = await db.experience.findUnique({ where: { id }, select: { title: true } });
  if (!exp) return new Response("No encontrada", { status: 404 });

  const registrations = await db.registration.findMany({
    where: { experienceId: id, ...(all ? {} : { status: { in: ["PENDIENTE", "SENADA", "CONFIRMADA"] } }) },
    orderBy: [{ player: { lastName: "asc" } }, { player: { firstName: "asc" } }],
    include: {
      player: true,
      priceOption: { select: { label: true, price: true } },
      payments: { select: { amount: true, status: true } },
    },
  });

  const header = [
    "Apellido",
    "Nombre",
    "Estado",
    "WhatsApp",
    "Email",
    "Ciudad",
    "Nivel",
    "Opción",
    "Comparte habitación con",
    "Pareja de dobles",
    "Menú",
    "Precio",
    "Pagado",
    "Saldo",
    "Comentarios",
    "Notas internas",
    "Fecha de inscripción",
  ];
  const date = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  const rows = registrations.map((r) => {
    const paid = amountPaid(r.payments);
    const price = r.priceOption?.price ?? null;
    return [
      r.player.lastName,
      r.player.firstName,
      adminCopy.registrationStatus[r.status] ?? r.status,
      r.player.whatsapp,
      r.player.email,
      r.player.city,
      r.player.level,
      r.priceOption?.label,
      r.roommate,
      r.doublesPartner,
      r.menuChoice,
      price,
      paid,
      balanceDue(price, paid),
      r.notes,
      r.internalNotes,
      date.format(r.createdAt),
    ];
  });

  const filename = `nomina-${fileSlug(exp.title)}${all ? "-todas" : ""}.csv`;
  return new Response(toCsv(header, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
