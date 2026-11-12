import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDateRange } from "@/lib/format";
import { SEAT_HOLDING_STATUSES } from "@/lib/registration-rules";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "Experiencias" };
const c = adminCopy.list;

export default async function AdminExperiencesPage() {
  await requireAdmin();
  const experiences = await db.experience.findMany({
    orderBy: { startDate: "desc" },
    include: { format: { select: { name: true } } },
  });
  const counts = await db.registration.groupBy({ by: ["experienceId", "status"], _count: { _all: true } });
  const count = (id: string, statuses: readonly string[]) =>
    counts.filter((r) => r.experienceId === id && statuses.includes(r.status)).reduce((n, r) => n + r._count._all, 0);

  return (
    <>
      <h1 className="font-serif text-4xl text-navy-900">{c.title}</h1>
      {experiences.length === 0 ? (
        <p className="mt-6 text-ink-muted">{c.empty}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {experiences.map((e) => {
            const taken = count(e.id, SEAT_HOLDING_STATUSES);
            const waitlist = count(e.id, ["LISTA_ESPERA"]);
            return (
              <li key={e.id}>
                <Link
                  href={`/admin/experiencias/${e.id}`}
                  className="block rounded-sm border border-border bg-white p-5 transition hover:border-navy-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold tracking-widest text-gold-deep uppercase">{e.format.name}</p>
                    <StatusBadge status={e.status} />
                  </div>
                  <h2 className="mt-2 font-serif text-2xl text-navy-900">{e.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{formatDateRange(e.startDate, e.endDate)}</p>
                  <p className="mt-3 text-sm text-ink">
                    {c.seats(taken, e.capacity)}
                    {waitlist > 0 && <> · {c.waitlist(waitlist)}</>}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
