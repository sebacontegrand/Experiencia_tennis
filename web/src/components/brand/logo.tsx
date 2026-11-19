import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Logos del manual de marca (TENIS.pdf, 17/11), extraídos del PDF con fondo transparente.
 * TODO(negocio): reemplazar por los SVG originales del diseño cuando lleguen (PENDIENTES #5).
 * - "inline": monograma GB + EXPERIENCIA TENIS en texto (se lee en el header, también en el celular).
 * - "lockup": el logo completo del manual (monograma con la raqueta + EXPERIENCIA TENIS).
 * tone "dark" = verde para fondos claros; "light" = crema para fondos verdes.
 */
const FILES = {
  monogram: { dark: "/brand/monogram-gb.png", light: "/brand/monogram-gb-light.png", width: 600, height: 276 },
  lockup: { dark: "/brand/logo-experiencia-tenis.png", light: "/brand/logo-experiencia-tenis-light.png", width: 900, height: 557 },
};

export function Logo({
  variant = "inline",
  tone = "dark",
  className,
  priority = false,
}: {
  variant?: "inline" | "lockup";
  tone?: "dark" | "light";
  className?: string;
  priority?: boolean;
}) {
  if (variant === "lockup") {
    const f = FILES.lockup;
    return (
      <Link href="/" className={cn("inline-flex shrink-0", className)} aria-label={`${siteConfig.name} — inicio`}>
        <Image src={f[tone]} alt={siteConfig.name} width={f.width} height={f.height} priority={priority} className="h-auto w-[168px]" />
      </Link>
    );
  }
  const f = FILES.monogram;
  return (
    <Link href="/" className={cn("group inline-flex shrink-0 items-center gap-3", className)} aria-label={`${siteConfig.name} — inicio`}>
      <Image src={f[tone]} alt="" width={f.width} height={f.height} priority={priority} className="h-8 w-auto sm:h-10" />
      <span className={cn("flex flex-col leading-none", tone === "dark" ? "text-forest-900" : "text-cream")}>
        <span className="font-serif text-[0.9375rem] font-medium tracking-[0.08em] uppercase sm:text-lg">{siteConfig.name}</span>
        <span className={cn("mt-1 text-xs", tone === "dark" ? "text-ink-muted" : "text-cream/70")}>
          por {siteConfig.brand}
        </span>
      </span>
    </Link>
  );
}
