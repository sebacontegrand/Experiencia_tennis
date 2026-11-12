import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo provisorio (captura de 195×79 px, fondo azul marino).
 * TODO(negocio): reemplazar por el SVG vectorial (PENDIENTES #5). Al llegar, cambiar solo este componente.
 * No escalar por encima del tamaño original.
 */
const LOGO = { src: "/brand/logo-gabriela-bruno-srgb.png", width: 195, height: 79 };

export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="Experiencia Tenis — inicio">
      <Image
        src={LOGO.src}
        alt="Gabriela Bruno — Experiencia Tenis"
        width={LOGO.width}
        height={LOGO.height}
        priority={priority}
        className="h-auto w-[132px] max-w-full sm:w-[160px]"
      />
    </Link>
  );
}
