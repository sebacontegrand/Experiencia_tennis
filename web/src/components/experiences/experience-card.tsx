import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { experiencesCopy } from "@/content/experiences";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ExperienceCardData = {
  slug: string;
  title: string;
  status: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  summary: string | null;
  format: { name: string; slug: string };
};

export function ExperienceCard({ experience: e, tone = "light" }: { experience: ExperienceCardData; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const statusLabel = experiencesCopy.status[e.status];
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-sm border p-7 transition sm:p-8",
        dark ? "border-ball/40 text-white hover:border-ball" : "border-border bg-paper hover:border-clay-deep",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cn("meta-label", dark ? "text-ball" : "text-clay-deep")}>Experiencia {e.format.name}</p>
        {statusLabel && (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              e.status === "PUBLICADA" && (dark ? "bg-ball text-forest-900" : "bg-forest-900 text-white"),
              e.status === "CUPO_COMPLETO" && (dark ? "bg-white/15 text-white" : "bg-cream-200 text-forest-900"),
              e.status === "FINALIZADA" && (dark ? "bg-white/10 text-white/80" : "bg-cream text-ink-muted"),
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>
      <h3 className={cn("mt-4 font-serif text-3xl", dark ? "text-white" : "text-forest-900")}>
        <Link href={`/experiencias/${e.slug}`} className="after:absolute after:inset-0">
          {e.title}
        </Link>
      </h3>
      <ul className={cn("mt-5 space-y-2.5", dark ? "text-white/85" : "text-ink")}>
        <li className="flex items-center gap-3">
          <CalendarDays aria-hidden className={cn("size-5 shrink-0", dark ? "text-ball" : "text-clay-deep")} />
          {formatDateRange(e.startDate, e.endDate)}
        </li>
        <li className="flex items-center gap-3">
          <MapPin aria-hidden className={cn("size-5 shrink-0", dark ? "text-ball" : "text-clay-deep")} />
          {e.destination}
        </li>
      </ul>
      {e.summary && <p className={cn("mt-5", dark ? "text-white/75" : "text-ink-muted")}>{e.summary}</p>}
      <span
        aria-hidden
        className={cn(
          "btn-label mt-auto inline-flex items-center gap-2 pt-7",
          dark ? "text-ball-light" : "text-forest-900",
        )}
      >
        {experiencesCopy.detail.cardCta}
        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </article>
  );
}
