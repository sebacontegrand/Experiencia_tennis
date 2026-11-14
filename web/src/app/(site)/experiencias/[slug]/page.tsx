import type { Metadata } from "next";
import { getAlbumCount } from "@/lib/data/gallery";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ExperienceDetailView } from "@/components/experiences/experience-detail";
import { getPublicExperience, getVisibleExperienceSlugs } from "@/lib/data/public";
import { formatDateRange } from "@/lib/format";

/** Con Cache Components hace falta al menos un slug; sin publicadas, un marcador que da 404. */
const PLACEHOLDER = "__sin-publicar__";

export async function generateStaticParams() {
  const slugs = await getVisibleExperienceSlugs();
  return (slugs.length ? slugs : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/experiencias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = await getPublicExperience(slug);
  if (!e) return { title: "Experiencia no encontrada", robots: { index: false } };
  const description = `${formatDateRange(e.startDate, e.endDate)} · ${e.destination}. ${e.summary ?? ""}`.trim();
  return {
    title: e.title,
    description,
    alternates: { canonical: `/experiencias/${e.slug}` },
    openGraph: { title: e.title, description, url: `/experiencias/${e.slug}` },
  };
}

export default function ExperiencePage({ params }: PageProps<"/experiencias/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: Pick<PageProps<"/experiencias/[slug]">, "params">) {
  // Render en cada request (los datos sí van cacheados por tag): así publicar, despublicar
  // o cambiar un precio desde el admin se ve al instante, sin una versión vieja de por medio.
  await connection();
  const { slug } = await params;
  const [experience, photoCount] = await Promise.all([getPublicExperience(slug), getAlbumCount(slug)]);
  if (!experience) notFound();
  return <ExperienceDetailView experience={experience} photoCount={photoCount} />;
}

function DetailSkeleton() {
  return (
    <div aria-hidden className="bg-navy-900 px-5 pt-16 pb-20 sm:px-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="h-14 w-2/3 rounded bg-white/10" />
        <div className="h-24 w-full max-w-2xl rounded bg-white/5" />
      </div>
    </div>
  );
}
