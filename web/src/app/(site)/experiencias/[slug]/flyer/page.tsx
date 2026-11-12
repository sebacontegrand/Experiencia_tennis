import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, Download } from "lucide-react";
import { WhatsappIcon } from "@/components/icons/brand-icons";
import { experienceFlyers, flyerCopy as c } from "@/content/experiences";
import { getPublicExperience, getVisibleExperienceSlugs } from "@/lib/data/public";
import { absoluteUrl } from "@/config/site";
import { formatDateRange } from "@/lib/format";

const PLACEHOLDER = "__sin-publicar__";

export async function generateStaticParams() {
  const slugs = (await getVisibleExperienceSlugs()).filter((s) => experienceFlyers[s]);
  return (slugs.length ? slugs : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/experiencias/[slug]/flyer">): Promise<Metadata> {
  const { slug } = await params;
  const e = await getPublicExperience(slug);
  const flyers = experienceFlyers[slug];
  if (!e || !flyers) return { title: "Flyer no encontrado", robots: { index: false } };
  return {
    title: `${c.title} · ${e.title}`,
    description: `${formatDateRange(e.startDate, e.endDate)} · ${e.destination}.`,
    alternates: { canonical: `/experiencias/${e.slug}/flyer` },
    openGraph: { title: e.title, url: `/experiencias/${e.slug}/flyer`, images: [{ url: flyers[0].src, width: flyers[0].width, height: flyers[0].height }] },
  };
}

export default function FlyerPage({ params }: PageProps<"/experiencias/[slug]/flyer">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-navy-900" />}>
      <Flyer params={params} />
    </Suspense>
  );
}

async function Flyer({ params }: Pick<PageProps<"/experiencias/[slug]/flyer">, "params">) {
  await connection();
  const { slug } = await params;
  const e = await getPublicExperience(slug);
  const flyers = experienceFlyers[slug];
  if (!e || !flyers) notFound();
  const share = `https://wa.me/?text=${encodeURIComponent(c.shareText(e.title, absoluteUrl(`/experiencias/${e.slug}`)))}`;

  return (
    <section className="bg-navy-900 px-5 pt-10 pb-20 text-white sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link href={`/experiencias/${e.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-white hover:text-gold-light">
          <ArrowLeft aria-hidden className="size-4" /> {c.back}
        </Link>
        <h1 className="mt-6 font-serif text-4xl text-balance">{e.title}</h1>
        <p className="mt-2 text-white/80">{c.lead}</p>
        <a
          href={share}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-label mt-6 inline-flex h-12 items-center gap-2 rounded-sm border border-white/30 px-5 text-white transition hover:border-gold-light hover:text-gold-light"
        >
          <WhatsappIcon size={18} /> {c.share}
        </a>

        <ul className="mt-10 space-y-10">
          {flyers.map((f, i) => (
            <li key={f.src}>
              <Image
                src={f.src}
                alt={f.alt}
                width={f.width}
                height={f.height}
                priority={i === 0}
                sizes="(min-width: 640px) 36rem, 100vw"
                className="h-auto w-full rounded-sm"
              />
              <a
                href={f.src}
                download
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold-light underline-offset-4 hover:underline"
              >
                <Download aria-hidden className="size-4" /> {c.download} ({i + 1} de {flyers.length})
              </a>
            </li>
          ))}
        </ul>

        {!e.closedReason && (
          <Link
            href={`/experiencias/${e.slug}/inscripcion`}
            className="btn-label mt-12 inline-flex h-14 w-full items-center justify-center rounded-sm bg-gold px-8 text-navy-900 transition hover:bg-gold-light sm:w-auto"
          >
            {c.register}
          </Link>
        )}
      </div>
    </section>
  );
}
