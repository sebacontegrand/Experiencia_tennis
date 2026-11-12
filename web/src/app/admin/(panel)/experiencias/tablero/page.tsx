import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDateRange, formatPrice } from "@/lib/format";
import { experienceOverview, sumOverviews, type Alert, type Overview } from "@/lib/overview";
import { StatusBadge } from "@/components/admin/status-badge";
import { ExperiencesTabs } from "@/components/admin/experiences-tabs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tablero" };
const c = adminCopy.board;

export default async function BoardPage() {
  await requireAdmin();
  const experiences = await db.experience.findMany({
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      title: true,
      status: true,
      startDate: true,
      endDate: true,
      capacity: true,
      registrationDeadline: true,
      format: { select: { name: true } },
      priceOptions: { select: { id: true, price: true, cost: true } },
      costItems: { select: { amount: true, kind: true } },
      registrations: { select: { status: true, priceOptionId: true, payments: { select: { amount: true, status: true } } } },
    },
  });

  const now = new Date();
  const rows = experiences.map((e) => ({ e, o: experienceOverview(e, now) }));
  const upcoming = rows.filter((r) => r.o.upcoming);
  const past = rows.filter((r) => !r.o.upcoming).reverse();
  const totals = sumOverviews(upcoming.map((r) => r.o));

  return (
    <>
      <h1 className="font-serif text-4xl text-navy-900">{adminCopy.list.title}</h1>
      <ExperiencesTabs active="board" />
      <p className="mt-6 text-ink-muted">{c.intro}</p>

      <section aria-labelledby="totales" className="mt-6 rounded-sm bg-navy-900 p-5 text-white sm:p-7">
        <h2 id="totales" className="eyebrow text-gold-light">
          {c.totalsTitle}
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-white/80">{c.totalsEmpty}</p>
        ) : (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
            <Total label={c.people} value={c.seats(totals.taken, totals.capacity)} />
            <Total label={c.waitlist} value={String(totals.waitlist)} />
            <Total label={c.revenue} value={formatPrice(totals.revenue)} />
            <Total label={c.collected} value={formatPrice(totals.collected)} />
            <Total label={c.toCollect} value={formatPrice(totals.toCollect)} />
            <Total label={c.earnings} value={totals.earnings == null ? c.noCosts : formatPrice(totals.earnings)} negative={(totals.earnings ?? 0) < 0} />
          </dl>
        )}
      </section>

      {upcoming.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl text-navy-900">{c.upcoming}</h2>
          <ul className="mt-4 space-y-4">
            {upcoming.map(({ e, o }) => (
              <ExperienceRow key={e.id} e={e} o={o} />
            ))}
          </ul>
        </>
      )}
      {past.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl text-navy-900">{c.past}</h2>
          <ul className="mt-4 space-y-4">
            {past.map(({ e, o }) => (
              <ExperienceRow key={e.id} e={e} o={o} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

type Row = { id: string; title: string; status: string; startDate: Date; endDate: Date; format: { name: string } };

function ExperienceRow({ e, o }: { e: Row; o: Overview }) {
  return (
    <li className="rounded-sm border border-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-widest text-gold-deep uppercase">{e.format.name}</p>
        <StatusBadge status={e.status} />
      </div>
      <h3 className="mt-2 font-serif text-2xl text-navy-900">
        <Link href={`/admin/experiencias/${e.id}`} className="hover:underline">
          {e.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-ink-muted">
        {formatDateRange(e.startDate, e.endDate)}
        {o.upcoming && o.daysToStart >= 0 && <> · {c.startsIn(o.daysToStart)}</>}
      </p>

      {o.alerts.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {o.alerts.map((a) => (
            <li key={a.kind} className={cn("flex items-start gap-2 text-sm", a.kind === "losing" ? "text-destructive" : "text-amber-900")}>
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
              {alertText(a)}
            </li>
          ))}
        </ul>
      )}

      {/* Ocupación */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold text-navy-900">
            {c.people}: {c.seats(o.taken, o.capacity)}
          </span>
          {o.waitlist > 0 && <span className="text-violet-900">{c.waitlist}: {o.waitlist}</span>}
        </div>
        <div
          role="progressbar"
          aria-label={c.people}
          aria-valuemin={0}
          aria-valuemax={o.capacity}
          aria-valuenow={o.taken}
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream-200"
        >
          <div className="h-full rounded-full bg-navy-900" style={{ width: `${o.fillPercent}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">{c.breakdown(o.pending, o.deposited, o.confirmed)}</p>
      </div>

      {/* Plata */}
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Figure label={c.revenue} value={formatPrice(o.revenue)} />
        <Figure label={c.collected} value={formatPrice(o.collected)} />
        <Figure label={c.toCollect} value={formatPrice(o.toCollect)} />
        <Figure label={c.costs} value={o.costs == null ? c.noCosts : formatPrice(o.costs)} />
        <Figure
          label={c.earnings}
          value={o.earnings == null ? "—" : `${formatPrice(o.earnings)}${o.marginPercent != null ? ` (${o.marginPercent}\u00a0%)` : ""}`}
          tone={o.earnings == null ? undefined : o.earnings < 0 ? "bad" : "good"}
        />
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/admin/experiencias/${e.id}/inscripciones`}
          className="inline-flex h-11 items-center rounded-sm bg-navy-900 px-5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          {c.registrations}
        </Link>
        <Link
          href={`/admin/experiencias/${e.id}`}
          className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
        >
          {c.open}
        </Link>
      </div>
    </li>
  );
}

function alertText(a: Alert) {
  const t = c.alerts[a.kind];
  return t(a.count ?? 0);
}

function Total({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-white/60">{label}</dt>
      <dd className={cn("mt-1 text-lg font-semibold sm:text-xl", negative ? "text-red-300" : "text-white")}>{value}</dd>
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-sm bg-cream p-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-semibold text-navy-900",
          tone === "good" && "text-emerald-800",
          tone === "bad" && "text-destructive",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
