"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { racketCopy as c, type RacketPart, type RacketPartId } from "@/content/racket";
import { cn } from "@/lib/utils";

const parts = c.parts as readonly RacketPart[];
const N = parts.length;
/** Tramos del scroll: medio de intro, uno por pieza y uno para el cierre. */
const SEGMENTS = N + 1.5;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const pad = (n: number) => String(n).padStart(2, "0");
const partName = (id: RacketPartId) => parts.find((p) => p.id === id)?.name ?? id;

type Phase = { mode: "static" | "scroll"; active: number; outro: boolean };

/**
 * Foto de la raqueta (panel fijo): con el scroll se ilumina una pieza por vez y aparece su primer
 * plano con lo que aporta al juego y a la experiencia. Al final se ve entera otra vez.
 * Debajo, perfiles de jugador que iluminan las piezas que más le importan a cada uno.
 * Sin JS o con «reducir movimiento» se muestran todas las piezas con su foto y su texto.
 */
export function RacketAnatomy() {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>({ mode: "static", active: -1, outro: false });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = root.current;
      if (!el) return;
      const header = document.querySelector("header")?.offsetHeight ?? 64;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - (window.innerHeight - header);
      const p = travel > 0 ? clamp((header - rect.top) / travel) : 0;
      const s = p * SEGMENTS - 0.5;
      el.style.setProperty("--p", p.toFixed(4));
      const active = s < 0 || s >= N ? -1 : Math.floor(s);
      const outro = s >= N;
      setPhase((prev) => (prev.active === active && prev.outro === outro && prev.mode === "scroll" ? prev : { mode: "scroll", active, outro }));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMotion = () => {
      if (motion.matches) window.location.reload();
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    motion.addEventListener("change", onMotion);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  /** Lleva el scroll al tramo de la pieza `i`. */
  const goTo = useCallback((i: number) => {
    const el = root.current;
    if (!el) return;
    const header = document.querySelector("header")?.offsetHeight ?? 64;
    const travel = el.offsetHeight - (window.innerHeight - header);
    const p = (i + 0.5 + 0.5) / SEGMENTS;
    const top = el.getBoundingClientRect().top + window.scrollY - header + travel * p;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const scroll = phase.mode === "scroll";
  const { active, outro } = phase;
  const focus: RacketPartId[] = scroll && active >= 0 ? [parts[active].id] : [];

  return (
    <section id="anatomia" aria-labelledby="anatomia-title" className="racket-anatomy relative bg-forest-950 text-white">
      <div ref={root} className="relative" style={scroll ? { height: `calc(100svh + ${SEGMENTS * 55}svh)` } : undefined}>
        <div
          className={cn(
            "relative overflow-hidden",
            scroll ? "sticky top-16 flex h-[calc(100svh-4rem)] flex-col sm:top-20 sm:h-[calc(100svh-5rem)]" : "py-20 sm:py-24",
          )}
        >
          <Backdrop />

          <div
            className={cn(
              "relative mx-auto grid w-full max-w-6xl gap-x-12 px-5 sm:px-8 lg:grid-cols-[22rem_1fr] lg:grid-rows-[auto_1fr]",
              scroll ? "flex-1 content-center gap-y-5 py-6 sm:gap-y-6 lg:content-stretch lg:py-12" : "gap-y-10",
            )}
          >
            <header className="lg:col-start-1">
              <h1 id="anatomia-title" className="font-serif text-4xl leading-[1.02] font-light text-balance sm:text-5xl">
                {c.title}
              </h1>
              <div className="brand-rule mt-5" />
              <p className={cn("mt-5 max-w-md leading-relaxed text-white/75 max-sm:text-[0.9375rem]", scroll && "max-sm:hidden [@media(max-height:740px)]:hidden")}>
                {c.lead}
              </p>
            </header>

            <div
              className={cn(
                "relative -mx-3 sm:mx-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mr-8 xl:-mr-16",
                scroll ? "lg:self-center" : "lg:sticky lg:top-40 lg:self-start",
              )}
            >
              <RacketPhoto focus={focus} label={c.photo.alt} onPick={scroll ? goTo : undefined} priority />
              {scroll && active >= 0 && <ActivePanel key={active} part={parts[active]} index={active} />}
              {scroll && (
                <p
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-0 -bottom-6 flex items-center justify-center gap-2 text-sm text-white/60 transition-opacity duration-500",
                    active === -1 && !outro ? "opacity-100" : "opacity-0",
                  )}
                >
                  {c.scrollHint} <ChevronDown aria-hidden className="ra-nudge size-4" />
                </p>
              )}
            </div>

            <div className="lg:col-start-1 lg:row-start-2">
              {scroll && outro ? (
                <Outro />
              ) : (
                <ol className={cn(!scroll && "grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-1")}>
                  {parts.map((part, i) => {
                    const isActive = active === i;
                    const done = active > i;
                    return (
                      <li key={part.id} className={cn(scroll && "max-lg:sr-only")} aria-current={isActive ? "step" : undefined}>
                        {scroll ? (
                          <button
                            type="button"
                            onClick={() => goTo(i)}
                            className={cn(
                              "flex min-h-10 w-full items-baseline gap-4 text-left transition-colors",
                              isActive ? "text-white" : done ? "text-white/70 hover:text-white" : "text-white/45 hover:text-white/80",
                            )}
                          >
                            <span className={cn("w-7 shrink-0 font-sans text-xs font-semibold tabular-nums", (isActive || done) && "text-ball-light")}>
                              {pad(i + 1)}
                            </span>
                            <span className="font-serif text-2xl">
                              {part.name}
                              <span className="sr-only">
                                {" "}
                                ({c.stepLabel} {i + 1} {c.of} {N})
                              </span>
                            </span>
                          </button>
                        ) : (
                          <p className="flex items-baseline gap-4">
                            <span className="w-7 shrink-0 font-sans text-xs font-semibold text-ball-light tabular-nums">{pad(i + 1)}</span>
                            <span className="font-serif text-2xl">{part.name}</span>
                          </p>
                        )}
                        <PartDetail part={part} className={cn(scroll && "sr-only")} withImage={!scroll} />
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          {scroll && (
            <div aria-hidden className="relative h-px w-full bg-white/10">
              <div className="h-full origin-left bg-ball" style={{ transform: "scaleX(var(--p, 0))" }} />
            </div>
          )}
        </div>
      </div>

      <Profiles />
    </section>
  );
}

function TraitList({ traits, tone = "dim" }: { traits: readonly string[]; tone?: "dim" | "gold" }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {traits.map((t) => (
        <li
          key={t}
          className={cn(
            "inline-flex h-6 items-center px-2.5 text-[0.75rem] font-semibold",
            tone === "gold" ? "bg-ball text-forest-900" : "text-ball-light ring-1 ring-ball/50 ring-inset",
          )}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function PartDetail({ part, className, withImage = false }: { part: RacketPart; className?: string; withImage?: boolean }) {
  return (
    <div className={cn("pl-11", className)}>
      {withImage && <CloseUp part={part} sizes="(min-width: 640px) 22rem, 90vw" className="mt-3 mb-4 max-w-sm" />}
      <p className="mt-1 text-[0.8125rem] font-medium text-white/60">{part.spec}</p>
      <div className="mt-3">
        <TraitList traits={part.traits} />
      </div>
      <p className="mt-2.5 max-w-sm text-[0.9375rem] leading-relaxed text-white/85">{part.play}</p>
      <div className="mt-4 max-w-sm border-t border-white/10 pt-3">
        <p className="text-[0.8125rem] text-white/60">
          {c.inExperience}: <span className="font-serif text-lg text-ball-light italic">{part.title}</span>
        </p>
        <p className="mt-1 text-[0.9375rem] leading-relaxed text-white/75">{part.text}</p>
      </div>
    </div>
  );
}

/** Pieza activa, debajo de la raqueta: qué aporta al juego y qué representa en la experiencia. */
function ActivePanel({ part, index }: { part: RacketPart; index: number }) {
  return (
    <div
      aria-hidden
      className="mt-4 grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-4 px-3 sm:mt-6 sm:grid-cols-[11rem_1fr_1fr] sm:gap-x-8 sm:px-0 lg:pr-8 xl:pr-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
    >
      <CloseUp part={part} sizes="(min-width: 640px) 11rem, 6.5rem" className="self-start" />
      <div>
        <p className="flex items-baseline gap-3">
          <span className="font-sans text-xs font-semibold text-ball-light whitespace-nowrap tabular-nums">
            {pad(index + 1)} / {pad(N)}
          </span>
          <span className="font-serif text-3xl">{part.name}</span>
        </p>
        <p className="mt-1 text-[0.8125rem] font-medium text-white/60">{part.spec}</p>
        <div className="mt-3">
          <TraitList traits={part.traits} />
        </div>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/85">{part.play}</p>
      </div>
      <div className="col-span-2 border-t border-white/10 pt-4 sm:col-span-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
        <p className="text-[0.8125rem] text-white/60">{c.inExperience}</p>
        <p className="mt-1 font-serif text-2xl text-ball-light italic">{part.title}</p>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/75">{part.text}</p>
      </div>
    </div>
  );
}

/** Perfiles de jugador: cada uno ilumina las piezas que más le importan. */
function Profiles() {
  const p = c.profiles;
  const [selected, setSelected] = useState<string>(p.items[0].id);
  const profile = p.items.find((i) => i.id === selected) ?? p.items[0];

  return (
    <div className="relative border-t border-white/10 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-10 lg:grid-cols-[22rem_1fr]">
        <div>
          <h2 className="font-serif text-3xl font-light text-balance sm:text-4xl">{p.title}</h2>
          <div className="brand-rule mt-5" />
          <p className="mt-5 max-w-md leading-relaxed text-white/75">{p.lead}</p>
          <div role="group" aria-label={p.title} className="mt-8 flex flex-col gap-2">
            {p.items.map((item) => {
              const on = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(item.id)}
                  className={cn(
                    "flex min-h-12 items-center justify-between gap-3 px-4 text-left text-[0.9375rem] font-medium transition-colors",
                    on ? "bg-paper text-forest-900" : "text-white/80 ring-1 ring-white/20 ring-inset hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                  <ArrowRight aria-hidden className={cn("size-4 shrink-0 transition-opacity", on ? "opacity-100" : "opacity-0")} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:pt-4">
          <div className="-mx-3 sm:mx-0 lg:-mr-8 xl:-mr-16">
            <RacketPhoto focus={profile.parts} label={`${profile.label}: ${profile.parts.map(partName).join(", ")}`} />
          </div>
          <div key={profile.id} aria-live="polite" className="mt-6 max-w-xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[0.8125rem] text-white/60">{p.wantsLabel}</span>
              <TraitList traits={profile.wants} tone="gold" />
            </div>
            <p className="mt-4 text-lg leading-relaxed text-white/85">{profile.text}</p>
            <p className="mt-3 text-sm text-white/60">{profile.parts.map(partName).join(", ")}</p>
          </div>
          <p className="mt-10 max-w-xl border-t border-white/10 pt-5 font-serif text-xl text-white/85 italic">{p.closing}</p>
          <p className="mt-6 text-xs text-white/50">{c.aiNote}</p>
        </div>
      </div>
    </div>
  );
}

function Outro() {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-500">
      <p className="text-[0.8125rem] font-medium text-ball-light">{c.outro.spec}</p>
      <p className="mt-3 font-serif text-3xl text-balance sm:text-4xl">{c.outro.title}</p>
      <Link
        href={c.outro.cta.href}
        className="btn-label mt-6 inline-flex h-12 items-center gap-2 border border-ball px-6 text-ball-light transition hover:bg-ball hover:text-forest-900"
      >
        {c.outro.cta.label} <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_68%_50%,var(--color-forest-glow),transparent_70%)]" />
      <div className="absolute inset-0 [background-image:linear-gradient(var(--color-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-grid-line)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_70%_at_60%_50%,black,transparent)]" />
    </div>
  );
}

/**
 * Dónde está cada pieza en la foto (en % del ancho y alto): `pin` = marcador numerado,
 * `light` = centro y radio (en % del ancho) del foco que la ilumina.
 */
const PHOTO_RATIO = c.photo.width / c.photo.height;
const spots: Record<RacketPartId, { pin: [number, number]; light: [number, number, number] }> = {
  strings: { pin: [78, 31], light: [71.2, 51, 19] },
  sweetspot: { pin: [69, 52], light: [69, 52, 7.5] },
  frame: { pin: [93.6, 49], light: [71.2, 51, 24.5] },
  throat: { pin: [40, 49], light: [40, 49, 10] },
  grip: { pin: [25.5, 49.6], light: [19, 49.6, 14] },
  cap: { pin: [6.2, 49.6], light: [6.2, 49.6, 4.5] },
};

/** Foto de la raqueta con un marcador por pieza; `focus` ilumina esas piezas y oscurece el resto. */
function RacketPhoto({
  focus,
  label,
  onPick,
  priority = false,
}: {
  focus: readonly RacketPartId[];
  label: string;
  onPick?: (i: number) => void;
  priority?: boolean;
}) {
  // Un foco elíptico por pieza (la imagen no es cuadrada: el alto se corrige con PHOTO_RATIO).
  const mask = focus
    .map((id) => {
      const [x, y, r] = spots[id].light;
      return `radial-gradient(${r}% ${r * PHOTO_RATIO}% at ${x}% ${y}%, transparent 55%, black 100%)`;
    })
    .join(", ");
  const dim: CSSProperties = focus.length
    ? { maskImage: mask, WebkitMaskImage: mask, maskComposite: "intersect", WebkitMaskComposite: "source-in" }
    : { opacity: 0 };

  return (
    <figure className="relative" style={{ aspectRatio: `${c.photo.width} / ${c.photo.height}` }}>
      {/* Foto y velo en una capa que se funde con el fondo; los marcadores quedan afuera para no desvanecerse. */}
      <div className="ra-photo absolute inset-0">
        <Image src={c.photo.src} alt={label} fill loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
        <div aria-hidden className="ra-dim pointer-events-none absolute inset-0 bg-forest-950/75" style={dim} />
      </div>
      <div aria-hidden className="absolute inset-0">
        {parts.map((part, i) => {
          const on = focus.includes(part.id);
          const [x, y] = spots[part.id].pin;
          const Tag = onPick ? "button" : "span";
          return (
            <Tag
              key={part.id}
              {...(onPick ? { type: "button" as const, tabIndex: -1, onClick: () => onPick(i) } : {})}
              className={cn(
                "absolute inline-flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-sans text-[0.6875rem] font-semibold tabular-nums transition-[background-color,color,box-shadow] duration-300 sm:size-8 sm:text-xs",
                on
                  ? "bg-ball text-forest-900 shadow-[0_0_0_6px_var(--color-ball-glow)]"
                  : "bg-forest-950/80 text-white/80 ring-1 ring-white/40",
                onPick && "cursor-pointer hover:bg-ball hover:text-forest-900",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {pad(i + 1)}
            </Tag>
          );
        })}
      </div>
    </figure>
  );
}

/** Primer plano de una pieza, con el mismo tratamiento de la foto grande. */
function CloseUp({ part, className, sizes }: { part: RacketPart; className?: string; sizes: string }) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-forest-900 ring-1 ring-white/10", className)}>
      <Image src={part.image.src} alt={part.image.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
