"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ImagePlus } from "lucide-react";
import { adminCopy } from "@/content/admin";
import { addPhotos } from "@/app/admin/(panel)/experiencias/[id]/fotos/actions";
import { fitWithin, galleryPathname, type UploadedPhoto } from "@/lib/gallery-rules";
import { cn } from "@/lib/utils";

const c = adminCopy.photos;

/** Achica la foto y la vuelve a codificar en JPEG: así se descartan los datos EXIF (ubicación incluida). */
async function prepare(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar"))), "image/jpeg", 0.85),
  );
  return { blob, width, height };
}

async function send(experienceId: string, file: File, mode: "blob" | "local"): Promise<UploadedPhoto> {
  const { blob, width, height } = await prepare(file);
  if (mode === "blob") {
    const res = await upload(galleryPathname(experienceId, file.name), blob, {
      access: "public",
      handleUploadUrl: "/admin/api/fotos/blob",
      contentType: "image/jpeg",
    });
    return { url: res.url, storageKey: `blob:${res.pathname}`, width, height };
  }
  const form = new FormData();
  form.append("file", new File([blob], "foto.jpg", { type: "image/jpeg" }));
  const res = await fetch("/admin/api/fotos/local", { method: "POST", body: form });
  if (!res.ok) throw new Error("No se pudo subir");
  const json = (await res.json()) as { url: string; storageKey: string };
  return { ...json, width, height };
}

export function PhotoUploader({ experienceId, mode }: { experienceId: string; mode: "blob" | "local" | "off" }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  if (mode === "off") return <p className="rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">{c.off}</p>;

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setBusy(true);
    const done: UploadedPhoto[] = [];
    let failed = 0;
    // De a una: en el celular, varias fotos grandes a la vez se quedan sin memoria.
    for (const [i, file] of list.entries()) {
      setStatus({ ok: true, text: c.uploading(i + 1, list.length) });
      try {
        done.push(await send(experienceId, file, mode as "blob" | "local"));
      } catch {
        failed++;
      }
    }
    let result = done.length > 0 ? await addPhotos(experienceId, done) : null;
    if (result && !result.ok) failed += done.length;
    const parts = [result?.ok ? result.message : null, failed > 0 ? c.failed(failed) : null].filter(Boolean);
    setStatus({ ok: failed === 0, text: parts.join(" ") });
    result = null;
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="space-y-3">
      {mode === "local" && <p className="text-sm text-ink-muted">{c.localNote}</p>}
      <label
        className={cn(
          "inline-flex h-12 cursor-pointer items-center gap-2 rounded-sm bg-navy-900 px-6 text-sm font-semibold text-white transition hover:bg-navy-800 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <ImagePlus aria-hidden className="size-4" /> {c.pick}
        <input ref={input} type="file" accept="image/*" multiple disabled={busy} className="sr-only" onChange={(e) => onFiles(e.target.files)} />
      </label>
      <p aria-live="polite" className={cn("text-sm", status?.ok === false ? "text-destructive" : "text-emerald-700")}>
        {status?.text}
      </p>
    </div>
  );
}
