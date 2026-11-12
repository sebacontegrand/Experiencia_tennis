import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Section } from "@/components/site/section";
import { ContactForm } from "@/components/forms/contact-form";
import { WhatsappIcon } from "@/components/icons/brand-icons";
import { b2bLinks, b2bUi as ui, type B2BPageCopy } from "@/content/b2b";
import { siteConfig, whatsappLink } from "@/config/site";

/**
 * Página para clubes, hoteles, empresas o marcas: foto, qué gana cada parte, cómo funciona,
 * quién pone qué, el piloto y el formulario (guarda un Lead con su tipo).
 */
export function B2BPage({ copy: c, extra }: { copy: B2BPageCopy; extra?: ReactNode }) {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-900 px-5 pt-44 pb-16 text-white sm:px-8 sm:pt-64 sm:pb-20">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-80 sm:h-[28rem]">
          <Image src={c.image.src} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: c.image.position }} />
          <div className="absolute inset-0 bg-linear-to-b from-navy-900/30 via-navy-900/40 via-35% to-navy-900" />
        </div>
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-gold">{c.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] font-medium text-balance sm:text-6xl">{c.title}</h1>
          <div className="gold-rule mt-6" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">{c.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="#formulario"
              className="btn-label inline-flex h-14 items-center justify-center gap-2 rounded-sm bg-gold px-8 text-navy-900 transition hover:bg-gold-light"
            >
              {c.form.submit} <ArrowRight aria-hidden className="size-4" />
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-label inline-flex h-14 items-center justify-center gap-2 rounded-sm border border-white/30 px-8 text-white transition hover:border-gold-light hover:text-gold-light"
            >
              <WhatsappIcon size={18} /> {ui.whatsappCta}
            </a>
          </div>
        </div>
      </section>

      {c.benefits && (
        <Section tone="cream" labelledBy="beneficios">
          <h2 id="beneficios" className="max-w-2xl font-serif text-4xl text-navy-900 text-balance sm:text-5xl">
            {c.benefits.title}
          </h2>
          <div className="gold-rule mt-6" />
          <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {c.benefits.items.map((b) => (
              <li key={b.title} className="border-t border-gold/50 pt-5">
                <h3 className="font-serif text-2xl text-navy-900">{b.title}</h3>
                <p className="mt-2 max-w-prose leading-relaxed text-ink-muted">{b.text}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {extra}

      {c.how && (
        <Section labelledBy="como">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
            <div>
              <h2 id="como" className="font-serif text-4xl text-navy-900 text-balance">
                {c.howTitle}
              </h2>
              <div className="gold-rule mt-6" />
            </div>
            <dl className="divide-y divide-border border-y border-border">
              {c.how.map((h) => (
                <div key={h.title} className="py-6 sm:grid sm:grid-cols-[12rem_1fr] sm:gap-8">
                  <dt className="font-semibold text-navy-900">{h.title}</dt>
                  <dd className="mt-1 leading-relaxed text-ink-muted sm:mt-0">{h.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>
      )}

      {c.roles && (
        <Section tone={c.how ? "cream" : "light"} labelledBy="roles">
          <h2 id="roles" className="font-serif text-4xl text-navy-900">
            {c.roles.title}
          </h2>
          <div className="gold-rule mt-6" />
          <div className={`mt-12 grid gap-10 ${c.roles.items.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {c.roles.items.map((r) => (
              <div key={r.who}>
                <h3 className="font-serif text-2xl text-navy-900">{r.who}</h3>
                <ul className="mt-4 space-y-3">
                  {r.does.map((d) => (
                    <li key={d} className="flex gap-3 leading-relaxed text-ink">
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-gold-deep" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {c.pilot && (
        <Section tone="navy" labelledBy="piloto">
          <div className="max-w-3xl">
            <h2 id="piloto" className="font-serif text-4xl text-white text-balance sm:text-5xl">
              {c.pilot.title}
            </h2>
            <div className="gold-rule mt-6" />
            <p className="mt-6 text-lg leading-relaxed text-white/85">{c.pilot.text}</p>
          </div>
        </Section>
      )}

      <Section id="formulario" tone="cream" labelledBy="formulario-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 id="formulario-title" className="font-serif text-4xl text-navy-900">
              {c.form.title}
            </h2>
            <div className="gold-rule mt-6" />
            <p className="mt-6 max-w-md leading-relaxed text-ink-muted">{c.form.lead}</p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-11 items-center gap-3 text-navy-900 hover:underline"
            >
              <WhatsappIcon size={22} className="text-gold-deep" />
              <span>
                {ui.whatsappAlt} <span className="font-semibold">{siteConfig.contact.whatsappDisplay}</span>
              </span>
            </a>
          </div>
          <div className="rounded-sm bg-white p-6 sm:p-10">
            <ContactForm
              topics={c.form.topics}
              submitLabel={c.form.submit}
              messagePlaceholder={c.form.messagePlaceholder}
              organizationLabel={c.form.organizationLabel}
            />
          </div>
        </div>
      </Section>

      <nav aria-label={ui.otherLinksLabel} className="border-t border-border bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3">
          <p className="text-sm text-ink-muted">{ui.otherLinks}</p>
          {b2bLinks
            .filter((l) => l.href !== c.path)
            .map((l) => (
              <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy-900 hover:underline">
                {l.label} <ArrowRight aria-hidden className="size-4" />
              </Link>
            ))}
        </div>
      </nav>
    </>
  );
}
