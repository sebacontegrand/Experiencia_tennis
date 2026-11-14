"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { racketCopy as c, type RacketPart, type RacketPartId } from "@/content/racket";
import { cn } from "@/lib/utils";

const parts = c.parts as readonly RacketPart[];
const N = parts.length;
/** Tramos del scroll: medio de intro, uno por pieza y uno para volver a armarla. */
const SEGMENTS = N + 1.5;
/** Cuánto se separa cada pieza (unidades del viewBox). */
const offsets: Record<RacketPartId, [number, number]> = {
  strings: [170, -70],
  sweetspot: [0, 0],
  frame: [70, 30],
  throat: [0, 0],
  grip: [-40, -80],
  cap: [-120, 0],
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const pad = (n: number) => String(n).padStart(2, "0");
const partName = (id: RacketPartId) => parts.find((p) => p.id === id)?.name ?? id;

type Phase = { mode: "static" | "scroll"; active: number; outro: boolean };
type PartStates = Partial<Record<RacketPartId, "on" | "off">>;

/**
 * La raqueta se desarma pieza por pieza al hacer scroll (panel fijo) y se vuelve a armar al final.
 * Debajo, perfiles de jugador que iluminan las piezas que más le importan a cada uno.
 * Sin JS o con «reducir movimiento» se muestra desarmada y con todas las piezas descritas.
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
      const assemble = easeOut(clamp((s - N) / 0.6));
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--assembled", assemble.toFixed(4));
      parts.forEach((part, i) => {
        const e = easeOut(clamp((s - i) / 0.55)) * (1 - assemble);
        el.style.setProperty(`--f-${part.id}`, e.toFixed(4));
      });
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

  /** Lleva el scroll al punto en que la pieza `i` ya se separó. */
  const goTo = useCallback((i: number) => {
    const el = root.current;
    if (!el) return;
    const header = document.querySelector("header")?.offsetHeight ?? 64;
    const travel = el.offsetHeight - (window.innerHeight - header);
    const p = (i + 0.7 + 0.5) / SEGMENTS;
    const top = el.getBoundingClientRect().top + window.scrollY - header + travel * p;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const scroll = phase.mode === "scroll";
  const { active, outro } = phase;
  const activeId = scroll && active >= 0 ? parts[active].id : null;
  const states: PartStates = {};
  if (activeId) for (const p of parts) states[p.id] = p.id === activeId ? "on" : "off";

  return (
    <section id="anatomia" aria-labelledby="anatomia-title" className="racket-anatomy relative bg-navy-950 text-white">
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
              <div className="gold-rule mt-5" />
              <p className={cn("mt-5 max-w-md leading-relaxed text-white/75 max-sm:text-[0.9375rem]", scroll && "max-sm:hidden [@media(max-height:740px)]:hidden")}>
                {c.lead}
              </p>
            </header>

            <div
              className={cn(
                "relative -mx-3 sm:mx-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mr-12 xl:-mr-24",
                scroll ? "lg:self-center" : "lg:sticky lg:top-40 lg:self-start",
              )}
            >
              <RacketSvg states={states} label={`${c.title}: raqueta separada en ${N} piezas`} />
              {scroll && active >= 0 && (
                <ActivePanel
                  key={active}
                  part={parts[active]}
                  index={active}
                />
              )}
              {scroll && (
                <p
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-0 -bottom-2 flex items-center justify-center gap-2 text-sm text-white/60 transition-opacity duration-500",
                    active === -1 && !outro ? "opacity-100" : "opacity-0",
                  )}
                >
                  {c.scrollHint} <ChevronDown className="size-4 motion-safe:animate-bounce" />
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
                            <span className={cn("w-7 shrink-0 font-sans text-xs font-semibold tabular-nums", (isActive || done) && "text-gold-light")}>
                              {pad(i + 1)}
                            </span>
                            <span className="font-serif text-2xl">
                              {part.name}
                              <span className="sr-only">
                                {" "}
                                · {c.stepLabel} {i + 1} {c.of} {N}
                              </span>
                            </span>
                          </button>
                        ) : (
                          <p className="flex items-baseline gap-4">
                            <span className="w-7 shrink-0 font-sans text-xs font-semibold text-gold-light tabular-nums">{pad(i + 1)}</span>
                            <span className="font-serif text-2xl">{part.name}</span>
                          </p>
                        )}
                        <PartDetail part={part} className={cn(scroll && "sr-only")} />
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          {scroll && (
            <div aria-hidden className="relative h-px w-full bg-white/10">
              <div className="h-full origin-left bg-gold" style={{ transform: "scaleX(var(--p, 0))" }} />
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
            tone === "gold" ? "bg-gold text-navy-900" : "text-gold-light ring-1 ring-gold/50 ring-inset",
          )}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function PartDetail({ part, className }: { part: RacketPart; className?: string }) {
  return (
    <div className={cn("pl-11", className)}>
      <p className="mt-1 text-[0.8125rem] font-medium text-white/60">{part.spec}</p>
      <div className="mt-3">
        <TraitList traits={part.traits} />
      </div>
      <p className="mt-2.5 max-w-sm text-[0.9375rem] leading-relaxed text-white/85">{part.play}</p>
      <div className="mt-4 max-w-sm border-t border-white/10 pt-3">
        <p className="text-[0.8125rem] text-white/60">
          {c.inExperience}: <span className="font-serif text-lg text-gold-light italic">{part.title}</span>
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
      className="mt-4 grid gap-x-10 gap-y-4 px-3 sm:mt-6 sm:grid-cols-2 sm:px-0 lg:pr-12 xl:pr-24 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
    >
      <div>
        <p className="flex items-baseline gap-3">
          <span className="font-sans text-xs font-semibold text-gold-light tabular-nums">
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
      <div className="border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-10">
        <p className="text-[0.8125rem] text-white/60">{c.inExperience}</p>
        <p className="mt-1 font-serif text-2xl text-gold-light italic">{part.title}</p>
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
  const states: PartStates = {};
  for (const part of parts) states[part.id] = (profile.parts as readonly RacketPartId[]).includes(part.id) ? "on" : "off";
  // Piezas separadas, sin importar en qué punto del scroll quedó la raqueta de arriba.
  const exploded = Object.fromEntries(parts.map((part) => [`--f-${part.id}`, 1])) as CSSProperties;

  return (
    <div className="relative border-t border-white/10 px-5 py-20 sm:px-8 sm:py-24" style={exploded}>
      <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-10 lg:grid-cols-[22rem_1fr]">
        <div>
          <h2 className="font-serif text-3xl font-light text-balance sm:text-4xl">{p.title}</h2>
          <div className="gold-rule mt-5" />
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
                    on ? "bg-white text-navy-900" : "text-white/80 ring-1 ring-white/20 ring-inset hover:bg-white/5 hover:text-white",
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
          <div className="-mx-3 sm:mx-0 lg:-mr-12 xl:-mr-24">
            <RacketSvg states={states} label={`${profile.label}: ${profile.parts.map(partName).join(", ")}`} />
          </div>
          <div key={profile.id} aria-live="polite" className="mt-6 max-w-xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[0.8125rem] text-white/60">{p.wantsLabel}</span>
              <TraitList traits={profile.wants} tone="gold" />
            </div>
            <p className="mt-4 text-lg leading-relaxed text-white/85">{profile.text}</p>
            <p className="mt-3 text-sm text-white/60">{profile.parts.map(partName).join(" · ")}</p>
          </div>
          <p className="mt-10 max-w-xl border-t border-white/10 pt-5 font-serif text-xl text-white/85 italic">{p.closing}</p>
        </div>
      </div>
    </div>
  );
}

function Outro() {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-500">
      <p className="text-[0.8125rem] font-medium text-gold-light">{c.outro.spec}</p>
      <p className="mt-3 font-serif text-3xl text-balance sm:text-4xl">{c.outro.title}</p>
      <Link
        href={c.outro.cta.href}
        className="btn-label mt-6 inline-flex h-12 items-center gap-2 border border-gold px-6 text-gold-light transition hover:bg-gold hover:text-navy-900"
      >
        {c.outro.cta.label} <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_68%_50%,rgb(29_58_96/0.55),transparent_70%)]" />
      <div className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_70%_at_60%_50%,black,transparent)]" />
    </div>
  );
}

/** Traslación de una pieza según su variable de avance (1 = separada). */
function move(id: RacketPartId): CSSProperties {
  const [dx, dy] = offsets[id];
  return {
    transform: `translate(calc(var(--f-${id}, 1) * ${dx}px), calc(var(--f-${id}, 1) * ${dy}px))`,
  };
}

// Cuerdas: 16 principales (a lo largo) y 19 cruzadas, dentro del aro interior (rx 212, ry 154).
const mains = Array.from({ length: 16 }, (_, k) => 146 + (308 / 17) * (k + 1));
const crosses = Array.from({ length: 19 }, (_, k) => 768 + (424 / 20) * (k + 1));

function RacketSvg({ states, label }: { states: PartStates; label: string }) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  // El punto dulce vive en el encordado: si está activo, se ilumina ese grupo.
  const stringsState = states.sweetspot === "on" ? "on" : states.strings;

  return (
    <svg viewBox="40 60 1350 520" role="img" aria-label={label} className="h-auto w-full overflow-visible">
      <defs>
        <linearGradient id={id("frame")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a6489" />
          <stop offset="0.45" stopColor="#1f3657" />
          <stop offset="1" stopColor="#0c1a30" />
        </linearGradient>
        <linearGradient id={id("core")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b5578" />
          <stop offset="1" stopColor="#16283f" />
        </linearGradient>
        <radialGradient id={id("sweet")}>
          <stop offset="0" stopColor="#d4b07a" stopOpacity="0.75" />
          <stop offset="0.6" stopColor="#b98c4a" stopOpacity="0.2" />
          <stop offset="1" stopColor="#b98c4a" stopOpacity="0" />
        </radialGradient>
        <pattern id={id("wrap")} width="18" height="60" patternUnits="userSpaceOnUse" patternTransform="skewX(-38)">
          <rect width="18" height="60" fill="#0d192c" />
          <rect width="2.5" height="60" fill="#22385a" />
        </pattern>
        <clipPath id={id("bed")}>
          <ellipse cx="980" cy="300" rx="212" ry="154" />
        </clipPath>
      </defs>

      {/* Medida total: aparece cuando la raqueta se vuelve a armar */}
      <g style={{ opacity: "var(--assembled, 0)" }}>
        <path
          d="M184 548 H1220"
          stroke="#d4b07a"
          strokeWidth="1.5"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: "calc(1 - var(--assembled, 0))" }}
        />
        <path d="M184 534 V562 M1220 534 V562" stroke="#d4b07a" strokeWidth="1.5" />
        <rect x="642" y="530" width="120" height="36" fill="#020a15" />
        <text x="702" y="556" textAnchor="middle" fill="#d4b07a" fontSize="24" fontFamily="var(--font-montserrat)" fontWeight="600">
          {c.lengthLabel}
        </text>
      </g>

      {/* Tapón */}
      <g className="ra-part" data-state={states.cap} style={move("cap")}>
        <rect x="184" y="274" width="32" height="52" rx="9" fill={url("core")} />
        <rect x="207" y="275" width="5" height="50" fill="#b98c4a" />
      </g>

      {/* Garganta + varilla + alma del mango */}
      <g className="ra-part" data-state={states.throat} style={move("throat")}>
        <rect x="212" y="281" width="296" height="38" rx="3" fill={url("core")} />
        <path d="M214 290 H506 M214 310 H506" stroke="#5b769c" strokeOpacity="0.5" strokeWidth="1.5" />
        <path d="M500 283 L604 281 L604 319 L500 317 Z" fill={url("frame")} />
        <path d="M794 188 C720 224 662 268 590 284 L590 299 C668 286 726 254 770 232 Z" fill={url("frame")} />
        <path d="M794 412 C720 376 662 332 590 316 L590 301 C668 314 726 346 770 368 Z" fill={url("frame")} />
        <path d="M794 190 C722 226 664 269 592 285" fill="none" stroke="#7d97bb" strokeOpacity="0.45" strokeWidth="1.5" />
      </g>

      {/* Empuñadura (cubregrip) */}
      <g className="ra-part" data-state={states.grip} style={move("grip")}>
        <rect x="216" y="277" width="286" height="46" rx="7" fill={url("wrap")} />
        <rect x="216" y="277" width="286" height="46" rx="7" fill="none" stroke="#2c4467" strokeWidth="1.5" />
        <rect x="486" y="275" width="20" height="50" rx="2" fill="#b98c4a" />
      </g>

      {/* Marco */}
      <g className="ra-part" data-state={states.frame} style={move("frame")}>
        <path
          fillRule="evenodd"
          fill={url("frame")}
          d="M740 300 a240 182 0 1 0 480 0 a240 182 0 1 0 -480 0 Z M768 300 a212 154 0 1 0 424 0 a212 154 0 1 0 -424 0 Z"
        />
        <ellipse cx="980" cy="300" rx="226" ry="168" fill="none" stroke="#b98c4a" strokeWidth="28" strokeDasharray="0 200 26 804 26 188" />
        <ellipse cx="980" cy="300" rx="226" ry="168" fill="none" stroke="#020a15" strokeOpacity="0.8" strokeWidth="3" strokeDasharray="2 13" />
        <ellipse cx="980" cy="300" rx="238" ry="180" fill="none" stroke="#8aa3c6" strokeOpacity="0.45" strokeWidth="1.5" />
      </g>

      {/* Encordado y punto dulce */}
      <g className="ra-part" data-state={stringsState} style={move("strings")}>
        <ellipse
          cx="980"
          cy="300"
          rx="212"
          ry="154"
          fill="#020a15"
          fillOpacity="0.35"
          stroke="#efe7da"
          strokeWidth="1.5"
          style={{ strokeOpacity: "calc(var(--f-strings, 1) * 0.35)" }}
        />
        <g clipPath={url("bed")} stroke="#efe7da" strokeOpacity="0.78" strokeWidth="1.6">
          {mains.map((y) => (
            <line key={`m${y}`} x1="760" x2="1200" y1={y} y2={y} />
          ))}
          {crosses.map((x) => (
            <line key={`c${x}`} y1="140" y2="460" x1={x} x2={x} />
          ))}
        </g>
        <g className={cn("ra-sweet", states.sweetspot === "on" && "is-on")} style={{ opacity: "var(--f-sweetspot, 1)" }}>
          <circle cx="955" cy="300" r="70" fill={url("sweet")} />
          <circle cx="955" cy="300" r="46" fill="none" stroke="#d4b07a" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="955" cy="300" r="5" fill="#d4b07a" />
        </g>
      </g>
    </svg>
  );
}
