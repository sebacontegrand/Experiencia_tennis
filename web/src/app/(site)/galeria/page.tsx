import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Section } from "@/components/site/section";
import { galleryCopy as c } from "@/content/gallery";
import { getAlbums, getUpcomingAlbums } from "@/lib/data/gallery";
import { formatDate, formatDateRange } from "@/lib/format";
import { formatImage } from "@/content/images";

export const metadata: Metadata = {
  title: c.title,
  description: c.lead,
  alternates: { canonical: "/galeria" },
};

export default function GalleryPage() {
  return (
    <>
      <section className="bg-navy-900 px-5 pt-16 pb-14 text-white sm:px-8 sm:pt-24 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-serif text-5xl leading-[1.02] font-light sm:text-7xl">{c.title}</h1>
          <div className="gold-rule mt-6" />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{c.lead}</p>
        </div>
      </section>
      <Suspense fallback={<div className="min-h-[50vh] bg-white" />}>
        <Albums />
      </Suspense>
    </>
  );
}

async function Albums() {
  await connection();
  const [albums, upcoming] = await Promise.all([getAlbums(), getUpcomingAlbums()]);

  return (
    <>
      <Section labelledBy="albumes">
        <h2 id="albumes" className="sr-only">
          {c.albumsTitle}
        </h2>
        {albums.length === 0 ? (
          <div className="max-w-xl">
            <p className="font-serif text-3xl text-navy-900">{c.empty.title}</p>
            <p className="mt-3 text-ink-muted">{c.empty.text}</p>
            <Link
              href={c.empty.cta.href}
              className="btn-label mt-8 inline-flex h-12 items-center gap-2 bg-navy-900 px-6 text-white transition hover:bg-navy-800"
            >
              {c.empty.cta.label} <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        ) : (
          <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2">
            {albums.map((a) => {
              const [first, ...rest] = a.gallery;
              return (
                <li key={a.slug}>
                  <Link href={`/galeria/${a.slug}`} className="group block">
                    <div className="grid aspect-4/3 grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden">
                      {first && (
                        <div className={`relative overflow-hidden bg-cream ${rest.length ? "col-span-2 row-span-2" : "col-span-3 row-span-2"}`}>
                          <Image src={first.url} alt="" fill sizes="(min-width: 768px) 33vw, 66vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" />
                        </div>
                      )}
                      {rest.map((p, i) => (
                        <div key={p.id} className={`relative overflow-hidden bg-cream ${rest.length === 1 ? "row-span-2" : ""} ${i > 1 ? "hidden" : ""}`}>
                          <Image src={p.url} alt="" fill sizes="(min-width: 768px) 16vw, 33vw" className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-[0.8125rem] font-medium text-gold-deep">
                      {a.format.name} · {formatDateRange(a.startDate, a.endDate)}
                    </p>
                    <h3 className="mt-1 font-serif text-3xl text-navy-900 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{a.title}</h3>
                    <p className="mt-1 text-ink-muted">
                      {a.destination} · {c.photos(a._count.gallery)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {upcoming.length > 0 && (
        <Section tone="cream" labelledBy="proximos-albumes">
          <h2 id="proximos-albumes" className="font-serif text-4xl text-navy-900">
            {c.upcomingTitle}
          </h2>
          <div className="gold-rule mt-6" />
          <p className="mt-6 max-w-xl text-ink-muted">{c.upcomingLead}</p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => {
              const img = formatImage(e.format.slug);
              return (
                <li key={e.slug}>
                  <Link href={`/experiencias/${e.slug}`} className="group block">
                    <div className="relative aspect-3/2 overflow-hidden bg-navy-900">
                      <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-45 grayscale" style={{ objectPosition: img.position }} />
                      <span className="absolute inset-0 flex items-end p-5">
                        <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-navy-900">
                          <CalendarDays aria-hidden className="size-4" /> {c.upcomingWhen} {formatDate(e.endDate)}
                        </span>
                      </span>
                    </div>
                    <h3 className="mt-4 font-serif text-2xl text-navy-900 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{e.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {e.format.name} · {e.destination}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </>
  );
}
