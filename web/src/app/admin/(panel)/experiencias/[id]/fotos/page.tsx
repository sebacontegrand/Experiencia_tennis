import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, EyeOff, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDateRange } from "@/lib/format";
import { galleryStorageMode } from "@/lib/gallery-storage";
import { VISIBLE_EXPERIENCE_STATUSES } from "@/lib/registration-rules";
import { ActionForm } from "@/components/admin/action-form";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { deletePhoto, setPhotoVisible } from "./actions";

export const metadata: Metadata = { title: "Fotos" };
const c = adminCopy.photos;

export default async function PhotosPage({ params }: PageProps<"/admin/experiencias/[id]/fotos">) {
  await requireAdmin();
  const { id } = await params;
  const e = await db.experience.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      startDate: true,
      endDate: true,
      gallery: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, alt: true, isPublic: true, width: true, height: true } },
    },
  });
  if (!e) notFound();
  const visible = (VISIBLE_EXPERIENCE_STATUSES as readonly string[]).includes(e.status);
  const shown = e.gallery.filter((p) => p.isPublic).length;

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/experiencias/${e.id}`} className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-navy-900">
          <ArrowLeft aria-hidden className="size-4" /> {c.back}
        </Link>
        <h1 className="mt-6 font-serif text-4xl text-navy-900">{c.title}</h1>
        <p className="mt-1 text-ink-muted">
          {e.title} · {formatDateRange(e.startDate, e.endDate)}
        </p>
      </div>

      <section className="space-y-4 rounded-sm bg-white p-5 sm:p-7">
        <p className="text-sm text-ink-muted">{c.lead}</p>
        <PhotoUploader experienceId={e.id} mode={galleryStorageMode()} />
        <div className="border-t border-border pt-4 text-sm">
          {visible && shown > 0 ? (
            <a
              href={`/galeria/${e.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy-900 hover:underline"
            >
              <ExternalLink aria-hidden className="size-4" /> {c.viewAlbum}
            </a>
          ) : (
            <p className="text-ink-muted">{c.albumNotVisible}</p>
          )}
        </div>
      </section>

      <section aria-label={c.title} className="rounded-sm bg-white p-5 sm:p-7">
        <p className="text-sm text-ink-muted">{c.cardSummary(e.gallery.length, e.gallery.length - shown)}</p>
        {e.gallery.length === 0 ? (
          <p className="mt-4 text-ink">{c.empty}</p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {e.gallery.map((p) => (
              <li key={p.id} className="flex flex-col gap-2">
                <div className="relative aspect-square overflow-hidden rounded-sm bg-cream">
                  <Image src={p.url} alt={p.alt} fill sizes="(min-width: 1024px) 220px, 45vw" className={p.isPublic ? "object-cover" : "object-cover opacity-40 grayscale"} />
                  {!p.isPublic && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-sm bg-navy-900 px-2 py-1 text-xs font-semibold text-white">
                      <EyeOff aria-hidden className="size-3.5" /> {c.hidden}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 [&_button]:h-10 [&_button]:px-4">
                  <ActionForm action={setPhotoVisible.bind(null, p.id, !p.isPublic)} submitLabel={p.isPublic ? c.hide : c.show} pendingLabel="…" variant="secondary" />
                  <ActionForm action={deletePhoto.bind(null, p.id)} submitLabel={c.delete} pendingLabel="…" variant="danger" confirm={c.deleteConfirm} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
