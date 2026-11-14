import { z } from "zod";

/** Lado más largo con el que se guarda cada foto (se achica en el navegador antes de subirla). */
export const PHOTO_MAX_SIDE = 2400;
/** Tope del archivo ya achicado. */
export const PHOTO_MAX_BYTES = 15 * 1024 * 1024;
export const PHOTO_CONTENT_TYPES = ["image/jpeg", "image/webp", "image/png"] as const;
/** Carpeta de las fotos en el almacenamiento. */
export const GALLERY_PREFIX = "galeria/";

/** Achica (w × h) para que el lado más largo no pase de `max`, sin agrandar. */
export function fitWithin(width: number, height: number, max = PHOTO_MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Texto alternativo por defecto: "Foto 3 de Villa Gesell 2026". */
export function photoAlt(experienceTitle: string, n: number) {
  return `Foto ${n} de ${experienceTitle}`;
}

/** URLs que aceptamos guardar: Vercel Blob, subidas locales (desarrollo) o archivos del sitio. */
export function isAllowedPhotoUrl(url: string) {
  if (url.startsWith("/uploads/gallery/") || url.startsWith("/photos/")) return !url.includes("..");
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Ruta de un archivo en el almacenamiento: galeria/<id de la experiencia>/<nombre>. */
export function galleryPathname(experienceId: string, fileName: string) {
  const safe =
    fileName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "foto";
  return `${GALLERY_PREFIX}${experienceId}/${safe}.jpg`;
}

export const uploadedPhotoSchema = z.object({
  url: z.string().max(500).refine(isAllowedPhotoUrl, "URL no permitida"),
  storageKey: z
    .string()
    .max(500)
    .regex(/^(blob|local):[\w\-./]+$/)
    .refine((k) => !k.includes(".."))
    .nullable(),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
});

export const uploadedPhotosSchema = z.array(uploadedPhotoSchema).min(1).max(60);
export type UploadedPhoto = z.infer<typeof uploadedPhotoSchema>;
