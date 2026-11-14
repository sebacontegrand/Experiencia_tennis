"use server";

import { refresh, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { galleryTag } from "@/lib/data/gallery";
import { deleteStoredPhoto } from "@/lib/gallery-storage";
import { photoAlt, uploadedPhotosSchema } from "@/lib/gallery-rules";
import type { AdminActionState } from "../../actions";

const m = adminCopy.photos;
const ok = (message: string): AdminActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): AdminActionState => ({ ok: false, message, at: Date.now() });

function refreshGallery(slug: string) {
  updateTag("gallery");
  updateTag(galleryTag(slug));
}

/** Guarda las fotos ya subidas al almacenamiento (visibles, al final del álbum). */
export async function addPhotos(experienceId: string, photos: unknown): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = uploadedPhotosSchema.safeParse(photos);
  if (!parsed.success) return fail(m.invalid);
  const exp = await db.experience.findUnique({ where: { id: experienceId }, select: { slug: true, title: true } });
  if (!exp) return fail(adminCopy.messages.notFound);

  const last = await db.galleryImage.aggregate({ where: { experienceId }, _max: { sortOrder: true }, _count: { _all: true } });
  const start = (last._max.sortOrder ?? 0) + 1;
  const count = last._count._all;
  await db.galleryImage.createMany({
    data: parsed.data.map((p, i) => ({
      experienceId,
      url: p.url,
      storageKey: p.storageKey,
      width: p.width,
      height: p.height,
      alt: photoAlt(exp.title, count + i + 1),
      isPublic: true,
      sortOrder: start + i,
    })),
  });
  refreshGallery(exp.slug);
  refresh();
  return ok(m.uploaded(parsed.data.length));
}

export async function setPhotoVisible(photoId: string, visible: boolean, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  const photo = await db.galleryImage.update({
    where: { id: photoId },
    data: { isPublic: visible },
    select: { experience: { select: { slug: true } } },
  });
  if (photo.experience) refreshGallery(photo.experience.slug);
  refresh();
  return ok(m.saved);
}

export async function deletePhoto(photoId: string, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  const photo = await db.galleryImage.findUnique({ where: { id: photoId }, select: { storageKey: true, experience: { select: { slug: true } } } });
  if (!photo) return fail(adminCopy.messages.notFound);
  await deleteStoredPhoto(photo.storageKey);
  await db.galleryImage.delete({ where: { id: photoId } });
  if (photo.experience) refreshGallery(photo.experience.slug);
  refresh();
  return ok(m.deleted);
}
