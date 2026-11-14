import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { WhatsappIcon } from "@/components/icons/brand-icons";
import { PhotoAlbum } from "@/components/site/photo-album";
import { galleryCopy as c } from "@/content/gallery";
import { getAlbum, getAlbumSlugs } from "@/lib/data/gallery";
import { absoluteUrl, whatsappLink } from "@/config/site";
import { formatDateRange } from "@/lib/format";

const PLACEHOLDER = "__sin-fotos__";

export async function generateStaticParams() {
  const slugs = await getAlbumSlugs();
  return (slugs.length ? slugs : [PLACEHOLDER]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/galeria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album || album.gallery.length === 0) return { title: "Álbum no encontrado", robots: { index: false } };
  const cover = album.gallery[0];
  return {
    title: `Fotos · ${album.title}`,
    description: `${formatDateRange(album.startDate, album.endDate)} · ${album.destination}. ${c.photos(album.gallery.length)}.`,
    alternates: { canonical: `/galeria/${album.slug}` },
    openGraph: { title: album.title, url: `/galeria/${album.slug}`, images: [{ url: cover.url, width: cover.width ?? undefined, height: cover.height ?? undefined }] },
  };
}

export default function AlbumPage({ params }: PageProps<"/galeria/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-navy-900" />}>
      <Album params={params} />
    </Suspense>
  );
}

async function Album({ params }: Pick<PageProps<"/galeria/[slug]">, "params">) {
  await connection();
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album || album.gallery.length === 0) notFound();
  const share = `https://wa.me/?text=${encodeURIComponent(c.shareText(album.title, absoluteUrl(`/galeria/${album.slug}`)))}`;

  return (
    <>
      <section className="bg-navy-900 px-5 pt-10 pb-12 text-white sm:px-8 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          <Link href="/galeria" className="inline-flex min-h-11 items-center gap-2 text-sm text-white hover:text-gold-light">
            <ArrowLeft aria-hidden className="size-4" /> {c.back}
          </Link>
          <p className="mt-8 text-[0.8125rem] font-medium text-gold-light">
            {album.format.name} · {formatDateRange(album.startDate, album.endDate)} · {album.destination}
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[1.02] font-light text-balance sm:text-6xl">{album.title}</h1>
          <div className="gold-rule mt-6" />
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-white/80">
              {c.photos(album.gallery.length)} · {c.albumLead}
            </p>
            <a
              href={share}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-label inline-flex h-12 items-center gap-2 self-start px-5 text-white ring-1 ring-white/30 transition ring-inset hover:text-gold-light hover:ring-gold-light"
            >
              <WhatsappIcon size={18} /> {c.share}
            </a>
          </div>
        </div>
      </section>

      <section aria-label={album.title} className="bg-navy-900 px-3 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-6xl">
          <PhotoAlbum title={album.title} photos={album.gallery} />
        </div>
      </section>

      <section className="border-t border-border bg-cream px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-2xl text-navy-900">{c.removal.title}</p>
            <p className="mt-1 text-ink-muted">{c.removal.text}</p>
          </div>
          <a
            href={whatsappLink(c.removal.message(album.title))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-label inline-flex h-12 items-center gap-2 self-start border border-navy-900 px-6 text-navy-900 transition hover:bg-navy-900 hover:text-white"
          >
            <WhatsappIcon size={18} /> {c.removal.cta}
          </a>
        </div>
      </section>
    </>
  );
}
