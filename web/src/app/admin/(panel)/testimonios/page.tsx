import type { Metadata } from "next";
import Link from "next/link";
import { Quote } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { testimonialCopy } from "@/content/testimonials";
import { ActionForm, AdminField } from "@/components/admin/action-form";
import { adminInputClass } from "@/components/admin/styles";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addTestimonial, deleteTestimonial, setTestimonialPublic } from "./actions";

export const metadata: Metadata = { title: "Testimonios" };
const c = testimonialCopy.admin;
const TABS = ["pending", "public", "all"] as const;
type Tab = (typeof TABS)[number];

export default async function TestimonialsPage({ searchParams }: PageProps<"/admin/testimonios">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.ver as Tab) ? (sp.ver as Tab) : "pending";
  const where = tab === "pending" ? { isPublic: false } : tab === "public" ? { isPublic: true } : {};

  const [items, pendingCount, experiences] = await Promise.all([
    db.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        authorName: true,
        authorInfo: true,
        quote: true,
        isPublic: true,
        createdAt: true,
        registrationId: true,
        experience: { select: { title: true } },
      },
    }),
    db.testimonial.count({ where: { isPublic: false } }),
    db.experience.findMany({ orderBy: { startDate: "desc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl text-forest-900">{c.title}</h1>
        <p className="mt-1 max-w-2xl text-ink-muted">{c.lead}</p>
      </div>

      <nav aria-label={c.title} className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t}
            href={t === "pending" ? "/admin/testimonios" : `/admin/testimonios?ver=${t}`}
            aria-current={tab === t ? "page" : undefined}
            className={cn(
              "inline-flex h-11 shrink-0 items-center rounded-sm border px-4 text-sm font-semibold",
              tab === t ? "border-forest-900 bg-forest-900 text-white" : "border-border bg-paper text-forest-900 hover:border-forest-900",
            )}
          >
            {c.tabs[t]}
            {t === "pending" && pendingCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ball px-1.5 text-xs text-forest-900">{pendingCount}</span>
            )}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="rounded-sm bg-paper p-6 text-ink-muted">{c.empty}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((t) => (
            <li key={t.id} className="rounded-sm bg-paper p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className={cn("rounded-full px-2.5 py-1", t.isPublic ? "bg-forest-900 text-white" : "bg-cream-200 text-forest-900")}>
                  {t.isPublic ? c.published : c.hidden}
                </span>
                <span className="text-ink-muted">
                  {t.experience?.title ?? c.noExperience} · {t.registrationId ? c.viaForm : c.manual} · {formatDate(t.createdAt)}
                </span>
              </div>
              <blockquote className="mt-4 flex gap-3">
                <Quote aria-hidden className="mt-1 size-5 shrink-0 text-clay-deep" />
                <div>
                  <p className="text-lg leading-relaxed text-ink">{t.quote}</p>
                  <footer className="mt-2 text-sm text-ink-muted">
                    <span className="font-semibold text-forest-900">{t.authorName}</span>
                    {t.authorInfo && <> · {t.authorInfo}</>}
                  </footer>
                </div>
              </blockquote>
              <div className="mt-5 flex flex-wrap gap-3">
                <ActionForm
                  action={setTestimonialPublic.bind(null, t.id, !t.isPublic)}
                  submitLabel={t.isPublic ? c.hide : c.publish}
                  pendingLabel="…"
                  variant={t.isPublic ? "secondary" : "primary"}
                />
                <ActionForm action={deleteTestimonial.bind(null, t.id)} submitLabel={c.delete} pendingLabel="…" variant="danger" confirm={c.deleteConfirm} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-sm bg-paper p-5 sm:p-7">
        <h2 className="font-serif text-2xl text-forest-900">{c.newTitle}</h2>
        <p className="mt-1 text-sm text-ink-muted">{c.newHint}</p>
        <ActionForm action={addTestimonial} submitLabel={c.add} className="mt-5">
          <AdminField label={c.experience} htmlFor="t-exp">
            <select id="t-exp" name="experienceId" defaultValue="" className={adminInputClass}>
              <option value="">{c.noExperience}</option>
              {experiences.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label={testimonialCopy.form.name} htmlFor="t-name">
              <input id="t-name" name="authorName" required maxLength={60} className={adminInputClass} />
            </AdminField>
            <AdminField label={testimonialCopy.form.info} htmlFor="t-info">
              <input id="t-info" name="authorInfo" maxLength={80} className={adminInputClass} />
            </AdminField>
          </div>
          <AdminField label={testimonialCopy.form.quote} htmlFor="t-quote">
            <textarea id="t-quote" name="quote" required maxLength={600} rows={4} className={cn(adminInputClass, "h-auto py-3")} />
          </AdminField>
        </ActionForm>
      </section>
    </div>
  );
}
