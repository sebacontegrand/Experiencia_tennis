import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/section";
import { experiencesCopy } from "@/content/experiences";
import { formatImage } from "@/content/images";
import { getFormats } from "@/lib/data/public";

const c = experiencesCopy.index;

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: "/experiencias" },
  openGraph: { title: c.meta.title, description: c.meta.description, url: "/experiencias" },
};

export default async function ExperiencesPage() {
  const formats = await getFormats();
  return (
    <>
      <section className="bg-navy-900 px-5 pt-14 pb-16 text-white sm:px-8 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading as="h1" tone="navy" eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
        </div>
      </section>

      <Section tone="cream">
        <ul className="grid gap-8 lg:grid-cols-3">
          {formats.map((f) => {
            const img = formatImage(f.slug);
            return (
              <li key={f.id} id={f.slug} className="scroll-mt-24 overflow-hidden rounded-sm border border-border bg-white">
                <Image src={img.src} alt="" width={img.width} height={img.height} className="h-auto w-full" />
                <div className="p-8">
                  <p className="eyebrow text-gold-deep">Experiencia</p>
                  <h2 className="mt-2 font-serif text-4xl text-navy-900">{f.name}</h2>
                  <p className="mt-3 font-serif text-xl text-ink italic">{f.tagline}</p>
                  <p className="mt-4 leading-relaxed text-ink-muted">{f.description}</p>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {f.benefits.map((b) => (
                      <li key={b} className="flex gap-3">
                        <Check aria-hidden className="size-4 shrink-0 text-gold-deep" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section labelledBy="comparar">
        <h2 id="comparar" className="font-serif text-4xl text-navy-900">
          {c.compareTitle}
        </h2>
        <div className="gold-rule mt-4" />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gold">
                <th scope="col" className="py-4 pr-4">
                  <span className="sr-only">Característica</span>
                </th>
                {formats.map((f) => (
                  <th key={f.id} scope="col" className="px-4 py-4 font-serif text-2xl font-medium text-navy-900">
                    {f.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.compareRows.map((row) => (
                <tr key={row.label} className="border-b border-border">
                  <th scope="row" className="py-4 pr-4 text-sm font-medium text-ink">
                    {row.label}
                  </th>
                  {formats.map((f) => {
                    const v = row.values[f.slug];
                    return (
                      <td key={f.id} className="px-4 py-4 text-sm text-ink">
                        {v === true ? (
                          <Check aria-label="Sí" className="size-5 text-gold-deep" />
                        ) : v === false || v === undefined ? (
                          <Minus aria-label="No" className="size-5 text-ink-muted" />
                        ) : (
                          v
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href={c.cta.href}
          className="btn-label mt-12 inline-flex h-14 items-center rounded-sm bg-navy-900 px-8 text-white transition hover:bg-navy-800"
        >
          {c.cta.label}
        </Link>
      </Section>
    </>
  );
}
