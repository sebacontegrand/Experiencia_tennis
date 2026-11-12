import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/site/section";
import { aboutCopy as c } from "@/content/b2b";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: c.path },
  openGraph: { title: c.meta.title, description: c.meta.description, url: c.path },
};

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-900 px-5 pt-44 pb-16 text-white sm:px-8 sm:pt-64 sm:pb-20">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-80 sm:h-[28rem]">
          <Image src={c.image.src} alt="" fill priority sizes="100vw" className="object-cover object-[50%_35%]" />
          <div className="absolute inset-0 bg-linear-to-b from-navy-900/30 via-navy-900/40 via-35% to-navy-900" />
        </div>
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-gold">{c.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] font-medium text-balance sm:text-6xl">{c.title}</h1>
          <div className="gold-rule mt-6" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">{c.lead}</p>
        </div>
      </section>

      <Section tone="cream" labelledBy="quien">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-5 text-lg leading-relaxed text-ink">
            {c.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="border-t border-gold/50 pt-6">
            <h2 id="quien" className="text-sm font-semibold text-gold-deep">
              {c.director.title}
            </h2>
            <p className="mt-3 font-serif text-4xl text-navy-900">{c.director.name}</p>
            <p className="mt-1 text-ink-muted">{c.director.role}</p>
            <p className="mt-5 leading-relaxed text-ink">{c.director.bio}</p>
          </div>
        </div>
      </Section>

      <Section labelledBy="cuidamos">
        <h2 id="cuidamos" className="font-serif text-4xl text-navy-900">
          {c.values.title}
        </h2>
        <div className="gold-rule mt-6" />
        <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
          {c.values.items.map((v) => (
            <li key={v.title} className="border-t border-gold/50 pt-5">
              <h3 className="font-serif text-2xl text-navy-900">{v.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{v.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href={c.ctas.players.href}
            className="btn-label inline-flex h-14 items-center justify-center rounded-sm bg-navy-900 px-8 text-white transition hover:bg-navy-800"
          >
            {c.ctas.players.label}
          </Link>
          <Link
            href={c.ctas.partners.href}
            className="btn-label inline-flex h-14 items-center justify-center gap-2 rounded-sm border border-navy-900 px-8 text-navy-900 transition hover:bg-cream"
          >
            {c.ctas.partners.label} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}
