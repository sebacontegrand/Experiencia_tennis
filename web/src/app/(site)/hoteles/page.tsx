import type { Metadata } from "next";
import { B2BPage } from "@/components/site/b2b-page";
import { Section } from "@/components/site/section";
import { hotelFormatAngle, hotelFormatsTitle, hotelsCopy as c } from "@/content/b2b";
import { getFormats } from "@/lib/data/public";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: c.path },
  openGraph: { title: c.meta.title, description: c.meta.description, url: c.path },
};

export default function HotelsPage() {
  return <B2BPage copy={c} extra={<Formats />} />;
}

/** Los tres formatos (de la base), con lo que significa cada uno para un hotel. */
async function Formats() {
  const formats = await getFormats();
  if (formats.length === 0) return null;
  return (
    <Section labelledBy="formatos">
      <h2 id="formatos" className="max-w-2xl font-serif text-4xl text-navy-900 text-balance">
        {hotelFormatsTitle}
      </h2>
      <div className="gold-rule mt-6" />
      <dl className="mt-10 divide-y divide-border border-y border-border">
        {formats.map((f) => (
          <div key={f.id} className="py-6 sm:grid sm:grid-cols-[12rem_1fr] sm:gap-8">
            <dt>
              <span className="font-serif text-3xl text-navy-900">{f.name}</span>
              <span className="mt-1 block text-sm text-ink-muted">{f.tagline}</span>
            </dt>
            <dd className="mt-3 leading-relaxed text-ink sm:mt-1">{hotelFormatAngle[f.slug] ?? f.description}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
