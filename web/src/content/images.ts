/**
 * Imágenes del sitio, centralizadas para reemplazarlas por fotos reales (PENDIENTES #10).
 * TODO(negocio): fotos reales de experiencias.
 *
 * Por ahora son ilustraciones de línea propias (sin personas), en /public/illustrations.
 * Para usar una foto: cambiá `src` por la ruta en /public/photos y ajustá `alt`.
 */
export type SiteImage = { src: string; alt: string; width: number; height: number };

export const images = {
  heroCourt: {
    src: "/illustrations/clay-court.svg",
    alt: "Ilustración de una cancha de polvo de ladrillo vista desde arriba",
    width: 800,
    height: 1000,
  },
  formatClassic: {
    src: "/illustrations/format-classic.svg",
    alt: "Ilustración: raqueta y pelota",
    width: 600,
    height: 400,
  },
  formatGold: {
    src: "/illustrations/format-gold.svg",
    alt: "Ilustración: hotel con pileta",
    width: 600,
    height: 400,
  },
  formatBlack: {
    src: "/illustrations/format-black.svg",
    alt: "Ilustración: ruta hacia un destino",
    width: 600,
    height: 400,
  },
  table: {
    src: "/illustrations/shared-table.svg",
    alt: "Ilustración: mesa compartida con copas",
    width: 800,
    height: 600,
  },
} satisfies Record<string, SiteImage>;

/** Imagen ilustrativa por slug de formato (los formatos viven en la base). */
export function formatImage(slug: string): SiteImage {
  if (slug === "gold") return images.formatGold;
  if (slug === "black") return images.formatBlack;
  return images.formatClassic;
}
