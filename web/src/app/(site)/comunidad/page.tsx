import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/site/section";
import { CommunityForm } from "@/components/forms/community-form";
import { communityCopy as c } from "@/content/pages";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: "/comunidad" },
  openGraph: { title: c.meta.title, description: c.meta.description, url: "/comunidad" },
};

export default function CommunityPage() {
  return (
    <>
      <section className="bg-navy-900 px-5 pt-14 pb-16 text-white sm:px-8 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading as="h1" tone="navy" eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {c.reasons.map((r) => (
              <li key={r.title} className="border-t border-gold/50 pt-5">
                <h2 className="font-serif text-2xl text-white">{r.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Section tone="cream" labelledBy="form-title">
        <div className="mx-auto max-w-3xl">
          <h2 id="form-title" className="font-serif text-3xl text-navy-900">
            {c.form.title}
          </h2>
          <div className="gold-rule mt-4 mb-8" />
          <CommunityForm />
        </div>
      </Section>
    </>
  );
}
