import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, GlassWater, Mail, Nut, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/section";
import { CommunityForm } from "@/components/forms/community-form";
import { TennisBallIcon } from "@/components/icons/brand-icons";
import { homeCopy as c } from "@/content/home";
import { formatImage, images } from "@/content/images";
import { getFormats, getPublicPartners, getUpcomingExperiences } from "@/lib/data/public";
import { siteConfig } from "@/config/site";
import { ExperienceCard } from "@/components/experiences/experience-card";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Section id="formatos" tone="cream" labelledBy="formatos-title">
        <SectionHeading id="formatos-title" eyebrow={c.formats.eyebrow} title={c.formats.title} lead={c.formats.lead} />
        <Suspense fallback={<CardsSkeleton count={3} />}>
          <Formats />
        </Suspense>
        <Link
          href={c.formats.cta.href}
          className="eyebrow mt-10 inline-flex h-12 items-center gap-2 rounded-sm border border-navy-900 px-6 text-navy-900 transition hover:bg-navy-900 hover:text-white"
        >
          {c.formats.cta.label} <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Section>
      <Section id="proxima" tone="navy" labelledBy="proxima-title">
        <SectionHeading id="proxima-title" tone="navy" eyebrow={c.next.eyebrow} title={c.next.title} />
        <Suspense fallback={<CardsSkeleton count={1} dark />}>
          <UpcomingExperiences />
        </Suspense>
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
          <SectionHeading id="sumate-title" eyebrow={c.join.eyebrow} title={c.join.title} lead={c.join.text} />
          <CommunityForm id="home-comunidad-form" />
        </div>
      </Section>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-900 px-5 pt-14 pb-20 text-white sm:px-8 sm:pt-20 sm:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="eyebrow text-gold">{c.hero.eyebrow}</p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.02] font-medium text-balance sm:text-6xl lg:text-7xl">
            {c.hero.title}
            <span className="mt-2 block text-gold-light italic">{c.hero.titleAccent}</span>
          </h1>
          <div className="gold-rule mt-8" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/80">{c.hero.lead}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href={c.hero.primaryCta.href}
              className="eyebrow inline-flex h-14 items-center justify-center rounded-sm bg-gold px-8 text-navy-900 transition hover:bg-gold-light"
            >
              {c.hero.primaryCta.label}
            </Link>
            <Link
              href={c.hero.secondaryCta.href}
              className="eyebrow inline-flex h-14 items-center justify-center gap-2 rounded-sm border border-white/30 px-8 text-white transition hover:border-gold-light hover:text-gold-light"
            >
              {c.hero.secondaryCta.label} <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <p className="eyebrow mt-12 text-white/60">{siteConfig.secondaryTagline}</p>
        </div>
        <div className="relative mx-auto hidden w-full max-w-sm sm:block lg:max-w-none">
          <Image
            src={images.heroCourt.src}
            alt={images.heroCourt.alt}
            width={images.heroCourt.width}
            height={images.heroCourt.height}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <Section labelledBy="que-es-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <SectionHeading id="que-es-title" eyebrow={c.about.eyebrow} title={c.about.title} />
        <div className="space-y-5 text-lg leading-relaxed text-ink-muted">
          {c.about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
      <ul className="mt-16 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {c.about.pillars.map((pillar, i) => (
          <li key={pillar.title} className="bg-white p-8">
            <span className="font-serif text-xl text-gold-deep">0{i + 1}</span>
            <h3 className="mt-3 font-serif text-2xl text-navy-900">{pillar.title}</h3>
            <p className="mt-2 text-ink-muted">{pillar.text}</p>
          </li>
        ))}
      </ul>
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
            <Image src={img.src} alt="" width={img.width} height={img.height} className="h-auto w-full" />
            <div className="flex flex-1 flex-col p-7">
              <p className={featured ? "eyebrow text-gold" : "eyebrow text-gold-deep"}>Experiencia</p>
              <h3 className={featured ? "mt-2 font-serif text-4xl text-white" : "mt-2 font-serif text-4xl text-navy-900"}>
                {format.name}
              </h3>
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

async function UpcomingExperiences() {
  const experiences = await getUpcomingExperiences();
  if (experiences.length === 0) {
    return (
      <div className="mt-12 rounded-sm border border-gold/40 p-8 sm:p-12">
        <h3 className="font-serif text-3xl text-white">{c.next.empty.title}</h3>
        <p className="mt-4 max-w-xl text-white/80">{c.next.empty.text}</p>
        <Link
          href={c.next.empty.cta.href}
          className="eyebrow mt-8 inline-flex h-12 items-center rounded-sm bg-gold px-6 text-navy-900 transition hover:bg-gold-light"
        >
          {c.next.empty.cta.label}
        </Link>
      </div>
    );
  }
  return (
    <>
      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {experiences.map((e) => (
          <li key={e.slug}>
            <ExperienceCard experience={e} tone="navy" />
          </li>
        ))}
      </ul>
      <Link
        href={c.next.allCta.href}
        className="eyebrow mt-10 inline-flex h-12 items-center gap-2 rounded-sm border border-gold px-6 text-gold-light transition hover:bg-gold hover:text-navy-900"
      >
        {c.next.allCta.label} <ArrowRight aria-hidden className="size-4" />
      </Link>
    </>
  );
}

function HowItWorks() {
  return (
    <Section labelledBy="como-title">
      <SectionHeading id="como-title" eyebrow={c.howItWorks.eyebrow} title={c.howItWorks.title} />
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
        <SectionHeading id="kit-title" eyebrow={c.kit.eyebrow} title={c.kit.title} lead={c.kit.lead} />
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
          <SectionHeading id="comunidad-title" tone="navy" eyebrow={c.community.eyebrow} title={c.community.title} lead={c.community.text} />
          <Link
            href="/comunidad"
            className="eyebrow mt-10 inline-flex h-12 items-center gap-2 rounded-sm border border-gold px-6 text-gold-light transition hover:bg-gold hover:text-navy-900"
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
            className="h-auto w-full rounded-sm"
          />
          <figcaption className="mt-4 text-sm text-white/60">{c.community.photosSoon}</figcaption>
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
        <SectionHeading id="b2b-title" eyebrow={c.b2b.eyebrow} title={c.b2b.title} lead={c.b2b.text} />
        <div className="flex flex-col gap-4">
          {c.b2b.ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className="eyebrow inline-flex h-14 items-center justify-between rounded-sm border border-navy-900 px-6 text-navy-900 transition hover:bg-navy-900 hover:text-white"
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
