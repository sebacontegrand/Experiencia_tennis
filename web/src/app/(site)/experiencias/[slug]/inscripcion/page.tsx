import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { RegistrationForm } from "@/components/forms/registration-form";
import { getLiveAvailability, getPublicExperience, getVisibleExperienceSlugs } from "@/lib/data/public";
import { experiencesCopy } from "@/content/experiences";
import { formatDateRange, formatPrice } from "@/lib/format";

const c = experiencesCopy.registration;
const PLACEHOLDER = "__sin-publicar__";

export async function generateStaticParams() {
  const slugs = await getVisibleExperienceSlugs();
  return (slugs.length ? slugs : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/experiencias/[slug]/inscripcion">): Promise<Metadata> {
  const { slug } = await params;
  const e = await getPublicExperience(slug);
  return {
    title: e ? c.metaTitle(e.title) : "Inscripción",
    robots: { index: false },
    alternates: e ? { canonical: `/experiencias/${e.slug}/inscripcion` } : undefined,
  };
}

export default function RegistrationPage({ params }: PageProps<"/experiencias/[slug]/inscripcion">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" aria-hidden />}>
      <Registration params={params} />
    </Suspense>
  );
}

async function Registration({ params }: Pick<PageProps<"/experiencias/[slug]/inscripcion">, "params">) {
  const { slug } = await params;
  const e = await getPublicExperience(slug);
  if (!e) notFound();

  // Cupos en vivo: el formulario dice "lista de espera" apenas se completa.
  const availability = await getLiveAvailability(e.id);
  const isFull = availability.isFull;

  return (
    <>
      <section className="bg-navy-900 px-5 pt-12 pb-14 text-white sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <Link href={`/experiencias/${e.slug}`} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-gold-light">
            <ArrowLeft aria-hidden className="size-4" /> {e.title}
          </Link>
          <p className="eyebrow mt-8 text-gold">{c.eyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">{e.title}</h1>
          <p className="mt-3 text-white/80">
            {formatDateRange(e.startDate, e.endDate)} · {e.destination}
          </p>
          <div className="gold-rule mt-6" />
          <p className="mt-6 max-w-2xl text-white/85">{isFull ? c.waitlistLead : c.lead}</p>
        </div>
      </section>
      <section className="bg-cream px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-sm bg-white p-6 sm:p-10">
          {e.closedReason ? (
            <p role="status" className="text-lg text-ink">
              {c.errors[e.closedReason]}
            </p>
          ) : (
            <RegistrationForm
              slug={e.slug}
              title={e.title}
              isFull={isFull}
              askGender={e.audience !== "MUJERES"}
              menuOptions={e.menuOptions}
              priceOptions={e.priceOptions.map((o) => ({
                id: o.id,
                label: o.label,
                price: formatPrice(o.price),
                isFull: availability.fullOptionIds.includes(o.id),
              }))}
            />
          )}
        </div>
      </section>
    </>
  );
}
