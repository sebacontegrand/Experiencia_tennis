import "server-only";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { del } from "@vercel/blob";

/**
 * Dónde se guardan las fotos de la galería:
 * - "blob": Vercel Blob (producción; necesita BLOB_READ_WRITE_TOKEN).
 * - "local": /public/uploads/gallery (solo `next dev`, sin token; carpeta ignorada por git).
 * - "off": sin almacenamiento configurado; el panel avisa y no deja subir.
 */
export type GalleryStorageMode = "blob" | "local" | "off";

export function galleryStorageMode(): GalleryStorageMode {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.NODE_ENV === "development") return "local";
  return "off";
}

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

/** Borra el archivo de una foto. Los archivos del repo (storageKey null) no se tocan. */
export async function deleteStoredPhoto(storageKey: string | null) {
  if (!storageKey) return;
  const [kind, ...rest] = storageKey.split(":");
  const key = rest.join(":");
  if (kind === "blob") {
    await del(key);
  } else if (kind === "local") {
    const file = path.join(LOCAL_UPLOAD_DIR, path.basename(key));
    await unlink(file).catch(() => undefined);
  }
}
