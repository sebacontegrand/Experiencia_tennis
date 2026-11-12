import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/site/section";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { experiencesCopy } from "@/content/experiences";
import { getCalendar } from "@/lib/data/public";

const c = experiencesCopy.calendar;

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: "/calendario" },
  openGraph: { title: c.meta.title, description: c.meta.description, url: "/calendario" },
};

export default async function CalendarPage() {
  const { upcoming, past } = await getCalendar();
  return (
    <>
      <section className="bg-navy-900 px-5 pt-14 pb-16 text-white sm:px-8 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading as="h1" tone="navy" eyebrow={c.eyebrow} title={c.title} />
          {upcoming.length === 0 ? (
            <div className="mt-12 rounded-sm border border-gold/40 p-8 sm:p-12">
              <p className="max-w-xl text-lg text-white/85">{c.empty}</p>
              <Link
                href={c.emptyCta.href}
                className="eyebrow mt-8 inline-flex h-12 items-center rounded-sm bg-gold px-6 text-navy-900 transition hover:bg-gold-light"
              >
                {c.emptyCta.label}
              </Link>
            </div>
          ) : (
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {upcoming.map((e) => (
                <li key={e.slug}>
                  <ExperienceCard experience={e} tone="navy" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      {past.length > 0 && (
        <Section tone="cream" labelledBy="pasadas">
          <h2 id="pasadas" className="font-serif text-4xl text-navy-900">
            {c.pastTitle}
          </h2>
          <div className="gold-rule mt-4" />
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <li key={e.slug}>
                <ExperienceCard experience={e} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
