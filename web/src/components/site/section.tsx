import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "light" | "cream" | "navy";

const toneClasses: Record<Tone, string> = {
  light: "bg-white text-ink",
  cream: "bg-cream text-ink",
  navy: "bg-navy-900 text-white",
};

export function Section({
  id,
  tone = "light",
  className,
  children,
  labelledBy,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24", toneClasses[tone], className)}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/** Rótulo + título + bajada, con línea dorada. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "left",
  as: Tag = "h2",
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: Tone;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const dark = tone === "navy";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className={cn("eyebrow", dark ? "text-gold" : "text-gold-deep")}>{eyebrow}</p>}
      <Tag
        id={id}
        className={cn(
          "mt-4 font-serif text-4xl leading-[1.08] font-medium text-balance sm:text-5xl",
          dark ? "text-white" : "text-navy-900",
        )}
      >
        {title}
      </Tag>
      <div className={cn("gold-rule mt-6", align === "center" && "mx-auto")} />
      {lead && (
        <p className={cn("mt-6 text-base leading-relaxed sm:text-lg", dark ? "text-white/80" : "text-ink-muted")}>
          {lead}
        </p>
      )}
    </div>
  );
}
