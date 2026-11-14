"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { galleryCopy as c } from "@/content/gallery";
import { whatsappLink } from "@/config/site";

type Photo = { id: string; url: string; alt: string; width: number | null; height: number | null };

/**
 * Grilla del álbum + visor a pantalla completa (<dialog> nativo): flechas, teclado y deslizar.
 * Sin JS, cada foto es un link al archivo.
 */
export function PhotoAlbum({ title, photos }: { title: string; photos: Photo[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const n = photos.length;

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const go = useCallback((d: number) => setIndex((i) => (i == null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const onClose = () => setIndex(null);
    el.addEventListener("keydown", onKey);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("close", onClose);
    };
  }, [go]);

  const photo = index == null ? null : photos[index];

  return (
    <>
      <ul className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-3 break-inside-avoid sm:mb-4">
            <a
              href={p.url}
              onClick={(e) => {
                e.preventDefault();
                open(i);
              }}
              className="group block overflow-hidden rounded-sm bg-navy-800"
            >
              <Image
                src={p.url}
                alt={p.alt}
                width={p.width ?? 1200}
                height={p.height ?? 800}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="h-auto w-full transition duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={title}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-navy-950/97 p-0 text-white backdrop:bg-navy-950/80"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        {photo && index != null && (
          <div
            className="flex h-full flex-col"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <p className="text-sm text-white/70 tabular-nums" aria-live="polite">
                {c.counter(index + 1, n)}
              </p>
              <div className="flex items-center gap-1">
                <a
                  href={photo.url}
                  download
                  className="inline-flex h-11 items-center gap-2 px-3 text-sm font-semibold text-gold-light hover:text-white"
                >
                  <Download aria-hidden className="size-4" /> {c.download}
                </a>
                <button
                  type="button"
                  onClick={() => dialog.current?.close()}
                  aria-label={c.close}
                  className="inline-flex size-11 items-center justify-center text-white/80 hover:text-white"
                >
                  <X aria-hidden className="size-6" />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1" onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}>
              <Image key={photo.id} src={photo.url} alt={photo.alt} fill sizes="100vw" className="object-contain motion-safe:animate-in motion-safe:fade-in" />
              {n > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={c.prev}
                    className="absolute top-1/2 left-2 inline-flex size-12 -translate-y-1/2 items-center justify-center bg-navy-950/60 text-white hover:bg-navy-950 sm:left-4"
                  >
                    <ChevronLeft aria-hidden className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={c.next}
                    className="absolute top-1/2 right-2 inline-flex size-12 -translate-y-1/2 items-center justify-center bg-navy-950/60 text-white hover:bg-navy-950 sm:right-4"
                  >
                    <ChevronRight aria-hidden className="size-6" />
                  </button>
                </>
              )}
            </div>

            <div className="px-4 py-4 text-center sm:px-6">
              <a
                href={whatsappLink(c.removal.message(title, index + 1))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
              >
                {c.removal.title} {c.removal.cta}
              </a>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
