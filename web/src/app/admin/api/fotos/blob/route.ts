import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { GALLERY_PREFIX, PHOTO_CONTENT_TYPES, PHOTO_MAX_BYTES } from "@/lib/gallery-rules";

/**
 * Token para que el navegador suba cada foto directo a Vercel Blob (sin pasar por el
 * límite de tamaño de las Server Actions). Después, el panel guarda las filas con addPhotos.
 */
export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(GALLERY_PREFIX) || pathname.includes("..")) throw new Error("Ruta no permitida");
        return {
          allowedContentTypes: [...PHOTO_CONTENT_TYPES],
          maximumSizeInBytes: PHOTO_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
