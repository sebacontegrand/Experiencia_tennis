import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, GlassWater, Mail, Nut, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/section";
import { CommunityForm } from "@/components/forms/community-form";
import { TennisBallIcon } from "@/components/icons/brand-icons";
import { homeCopy as c } from "@/content/home";
import { galleryCopy } from "@/content/gallery";
import { formatImage, images } from "@/content/images";
import { getFormats, getPublicPartners, getUpcomingExperiences } from "@/lib/data/public";
import { ExperienceCard } from "@/components/experiences/experience-card";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Section id="proxima" tone="cream" labelledBy="proxima-title">
        <SectionHeading id="proxima-title" title={c.next.title} />
        <Suspense fallback={<CardsSkeleton count={1} />}>
          <UpcomingExperiences />
        </Suspense>
      </Section>
      <About />
      <Section id="formatos" tone="cream" labelledBy="formatos-title">
        <SectionHeading id="formatos-title" title={c.formats.title} lead={c.formats.lead} />
        <Suspense fallback={<CardsSkeleton count={3} />}>
          <Formats />
        </Suspense>
        <Link
          href={c.formats.cta.href}
          className="btn-label mt-10 inline-flex h-12 items-center gap-2 rounded-sm border border-navy-900 px-6 text-navy-900 transition hover:bg-navy-900 hover:text-white"
        >
          {c.formats.cta.label} <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Section>
      <HowItWorks />
      <Kit />
      <Community />
      <Suspense fallback={null}>
        <Partners />
      </Suspense>
      <B2B />
      <Section id="sumate" tone="cream" labelledBy="sumate-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading id="sumate-title" title={c.join.title} lead={c.join.text} />
          <CommunityForm id="home-comunidad-form" />
        </div>
      </Section>
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-navy-900 text-white sm:min-h-[calc(100svh-5rem)] lg:min-h-[min(calc(100svh-5rem),54rem)]">
      {/* Celular: la foto ocupa la parte de arriba (la red queda a la vista); desde sm, todo el fondo. */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-20 h-[46%] sm:h-full">
        <Image
          src={images.heroNet.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-[1.35] object-cover sm:scale-100"
          style={{ objectPosition: images.heroNet.position }}
        />
      </div>
      {/* Duotono navy sobre el blanco y negro, y sombra donde va el texto (abajo en el celular, a la izquierda en desktop). */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy-700/45 mix-blend-multiply" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-navy-900 from-55% via-navy-900/50 via-75% to-navy-900/0 sm:from-navy-900 sm:from-0% sm:via-navy-900/60 sm:via-45% lg:bg-linear-to-r lg:from-navy-900/95 lg:via-navy-900/55 lg:via-55% lg:to-navy-900/0"
      />
      <div className="mx-auto w-full max-w-6xl px-5 pt-32 pb-12 sm:px-8 sm:pb-20 lg:pb-24">
        <p className="eyebrow text-gold-light">{c.hero.eyebrow}</p>
        <h1 className="mt-5 max-w-4xl font-serif text-[3.25rem] leading-[0.98] font-light tracking-[-0.01em] text-balance sm:text-7xl lg:text-[5.5rem]">
          {c.hero.title}
          <span className="mt-1 block text-gold-light italic">{c.hero.titleAccent}</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:mt-8 sm:text-lg">{c.hero.lead}</p>
        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
          <Link
            href={c.hero.primaryCta.href}
            className="btn-label inline-flex h-14 items-center justify-center bg-gold px-8 text-navy-900 transition hover:bg-gold-light"
          >
            {c.hero.primaryCta.label}
          </Link>
          <Link
            href={c.hero.secondaryCta.href}
            className="btn-label inline-flex h-14 items-center justify-center gap-2 bg-white/10 px-8 text-white ring-1 ring-white/35 transition ring-inset hover:bg-white hover:text-navy-900"
          >
            {c.hero.secondaryCta.label} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <Section labelledBy="que-es-title">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <figure className="relative -mx-5 overflow-hidden sm:mx-0">
          <Image
            src={images.courtLines.src}
            alt={images.courtLines.alt}
            width={images.courtLines.width}
            height={images.courtLines.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-4/3 w-full object-cover grayscale lg:aspect-4/5"
          />
          <div aria-hidden className="absolute inset-0 bg-navy-700/20 mix-blend-multiply" />
        </figure>
        <div>
          <SectionHeading id="que-es-title" title={c.about.title} />
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-muted">
            {c.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Link
            href="/como-se-arma"
            className="btn-label mt-10 inline-flex h-12 items-center gap-2 border border-navy-900 px-6 text-navy-900 transition hover:bg-navy-900 hover:text-white"
          >
            {c.about.cta} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

async function Formats() {
  const formats = await getFormats();
  return (
    <ul className="mt-14 grid gap-6 md:grid-cols-3">
      {formats.map((format) => {
        const img = formatImage(format.slug);
        const featured = format.slug === "black";
        return (
          <li
            key={format.id}
            className={
              featured
                ? "flex flex-col overflow-hidden rounded-sm border border-gold/60 bg-navy-900 text-white"
                : "flex flex-col overflow-hidden rounded-sm border border-border bg-white"
            }
          >
            <Image
              src={img.src}
              alt=""
              width={img.width}
              height={img.height}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="aspect-3/2 w-full object-cover"
              style={{ objectPosition: img.position }}
            />
            <div className="flex flex-1 flex-col p-7">
              <p className={featured ? "eyebrow text-gold" : "eyebrow text-gold-deep"}>Experiencia</p>
              <h3 className={featured ? "mt-2 font-serif text-4xl text-white" : "mt-2 font-serif text-4xl text-navy-900"}>{format.name}</h3>
              <p className={featured ? "mt-3 text-white/80" : "mt-3 text-ink-muted"}>{format.tagline}</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {format.benefits.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-gold" />
                    <span className={featured ? "text-white/85" : "text-ink"}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * «Lo que viene»: la foto se acomoda a la cantidad de fechas abiertas.
 * 0 o 1 → foto grande al lado de la tarjeta · 2 → una columna junto a las dos · 3 → franja arriba.
 */
async function UpcomingExperiences() {
  const experiences = await getUpcomingExperiences();
  const n = experiences.length;
  const allLink = (
    <Link
      href={c.next.allCta.href}
      className="btn-label mt-10 inline-flex h-12 items-center gap-2 border border-navy-900 px-6 text-navy-900 transition hover:bg-navy-900 hover:text-white"
    >
      {c.next.allCta.label} <ArrowRight aria-hidden className="size-4" />
    </Link>
  );

  if (n === 0) {
    return (
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <UpcomingPhoto count={0} className="aspect-4/3 lg:aspect-auto lg:min-h-[26rem]" />
        <div className="flex flex-col justify-center rounded-sm border border-border bg-white p-8 sm:p-12">
          <h3 className="font-serif text-3xl text-navy-900">{c.next.empty.title}</h3>
          <p className="mt-4 max-w-xl text-ink-muted">{c.next.empty.text}</p>
          <Link
            href={c.next.empty.cta.href}
            className="btn-label mt-8 inline-flex h-12 items-center self-start bg-navy-900 px-6 text-white transition hover:bg-navy-800"
          >
            {c.next.empty.cta.label}
          </Link>
        </div>
      </div>
    );
  }

  const cards = experiences.map((e) => (
    <li key={e.slug}>
      <ExperienceCard experience={e} />
    </li>
  ));

  if (n === 1) {
    return (
      <>
        <ul className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <li aria-hidden className="contents">
            <UpcomingPhoto count={1} className="aspect-4/3 lg:aspect-auto lg:min-h-[26rem]" />
          </li>
          {cards}
        </ul>
        {allLink}
      </>
    );
  }

  if (n === 2) {
    return (
      <>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <li aria-hidden className="contents">
            <UpcomingPhoto count={2} className="aspect-16/9 md:col-span-2 md:aspect-[21/8] lg:col-span-1 lg:aspect-auto lg:min-h-[24rem]" />
          </li>
          {cards}
        </ul>
        {allLink}
      </>
    );
  }

  return (
    <>
      <UpcomingPhoto count={n} className="mt-12 aspect-[21/9] sm:aspect-[21/7]" />
      <ul className="mt-6 grid gap-6 md:grid-cols-3">{cards}</ul>
      {allLink}
    </>
  );
}

function UpcomingPhoto({ count, className }: { count: number; className?: string }) {
  const img = images.clayLines;
  return (
    <div aria-hidden className={`relative isolate overflow-hidden rounded-sm bg-navy-900 ${className ?? ""}`}>
      <Image
        src={img.src}
        alt=""
        fill
        sizes={count >= 3 ? "(min-width: 1152px) 1152px, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
        className="-z-10 object-cover"
        style={{ objectPosition: img.position }}
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-navy-900/70 via-navy-900/10 via-45% to-transparent" />
      <p className="absolute bottom-5 left-5 font-serif text-2xl text-white italic sm:bottom-7 sm:left-7 sm:text-3xl">{c.next.photoCaption(count)}</p>
    </div>
  );
}

function HowItWorks() {
  return (
    <Section labelledBy="como-title">
      <SectionHeading id="como-title" title={c.howItWorks.title} />
      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {c.howItWorks.steps.map((step, i) => (
          <li key={step.title} className="border-t border-gold pt-6">
            <span className="font-serif text-5xl text-gold-deep">{i + 1}</span>
            <h3 className="mt-4 font-serif text-2xl text-navy-900">{step.title}</h3>
            <p className="mt-2 text-ink-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const kitIcons: Record<string, LucideIcon | typeof TennisBallIcon> = {
  bag: ShoppingBag,
  bottle: GlassWater,
  towel: TowelIcon,
  ball: TennisBallIcon,
  snack: Nut,
  card: Mail,
};

function TowelIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden {...props}>
      <path d="M6 4h10a3 3 0 0 1 3 3v13H9a3 3 0 0 1-3-3z" />
      <path d="M6 7a3 3 0 0 1 6 0v13" />
      <path d="M12 16h7" />
    </svg>
  );
}

function Kit() {
  return (
    <Section tone="cream" labelledBy="kit-title">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHeading id="kit-title" title={c.kit.title} lead={c.kit.lead} />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {c.kit.items.map((item) => {
            const Icon = kitIcons[item.icon];
            return (
              <li key={item.label} className="flex flex-col items-center gap-3 rounded-sm bg-white px-4 py-7 text-center">
                <Icon className="size-8 text-gold-deep" />
                <span className="text-sm font-medium text-navy-900">{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

function Community() {
  return (
    <Section tone="navy" labelledBy="comunidad-title">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading id="comunidad-title" tone="navy" title={c.community.title} lead={c.community.text} />
          <Link
            href="/comunidad"
            className="btn-label mt-10 inline-flex h-12 items-center gap-2 rounded-sm border border-gold px-6 text-gold-light transition hover:bg-gold hover:text-navy-900"
          >
            Sumate <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <figure>
          <Image
            src={images.table.src}
            alt={images.table.alt}
            width={images.table.width}
            height={images.table.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-4/3 w-full rounded-sm object-cover"
          />
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-white/60">
            {c.community.photosSoon}
            <Link href="/galeria" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-gold-light hover:underline">
              {galleryCopy.homeLink} <ArrowRight aria-hidden className="size-4" />
            </Link>
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}

async function Partners() {
  const partners = await getPublicPartners();
  if (partners.length === 0) return null;
  return (
    <Section labelledBy="aliados-title" className="py-14 sm:py-16">
      <p id="aliados-title" className="eyebrow text-center text-gold-deep">
        {c.partners.eyebrow}
      </p>
      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
        {partners.map((p) => (
          <li key={p.id} className="text-center">
            {p.logo ? (
              <Image src={p.logo} alt={p.name} width={140} height={56} className="h-12 w-auto object-contain" />
            ) : (
              <span className="font-serif text-3xl text-navy-900">{p.name}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-sm text-ink-muted">{c.partners.wilsonNote}</p>
    </Section>
  );
}

function B2B() {
  return (
    <Section tone="light" labelledBy="b2b-title" className="border-t border-border">
      <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
        <SectionHeading id="b2b-title" title={c.b2b.title} lead={c.b2b.text} />
        <div className="flex flex-col gap-4">
          {c.b2b.ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className="btn-label inline-flex h-14 items-center justify-between rounded-sm border border-navy-900 px-6 text-navy-900 transition hover:bg-navy-900 hover:text-white"
            >
              {cta.label} <ArrowRight aria-hidden className="size-4" />
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CardsSkeleton({ count, dark = false }: { count: number; dark?: boolean }) {
  return (
    <div className={`mt-12 grid gap-6 ${count > 1 ? "md:grid-cols-3" : ""}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`h-80 animate-pulse rounded-sm ${dark ? "bg-white/5" : "bg-white"}`} />
      ))}
    </div>
  );
}
