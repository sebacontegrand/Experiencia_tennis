import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { LOCAL_UPLOAD_DIR, galleryStorageMode } from "@/lib/gallery-storage";
import { PHOTO_CONTENT_TYPES, PHOTO_MAX_BYTES } from "@/lib/gallery-rules";

/** Solo en desarrollo sin token de Blob: guarda la foto en /public/uploads/gallery. */
export async function POST(request: Request) {
  await requireAdmin();
  if (galleryStorageMode() !== "local") return NextResponse.json({ error: "No disponible" }, { status: 404 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  if (!(PHOTO_CONTENT_TYPES as readonly string[]).includes(file.type) || file.size > PHOTO_MAX_BYTES) {
    return NextResponse.json({ error: "Archivo no permitido" }, { status: 400 });
  }
  const name = `${randomUUID()}.jpg`;
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/gallery/${name}`, storageKey: `local:${name}` });
}
