/**
 * Imágenes del sitio, centralizadas para reemplazarlas por fotos reales (PENDIENTES #10).
 * TODO(negocio): fotos reales de experiencias.
 *
 * Mientras tanto: fotos de stock con licencia libre (Unsplash License: uso comercial sin atribución
 * obligatoria) donde las personas no son el foco: canchas, paisajes, de lejos, de espaldas o detalles.
 * Nunca caras en primer plano que pasen por participantes reales. Archivos en /public/photos.
 * Para usar una foto real: cambiá `src` por la ruta nueva y ajustá `alt`, `width` y `height`.
 */
export type SiteImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** object-position para recortes (p. ej. "50% 100%" para quedarse con la parte de abajo). */
  position?: string;
  credit?: string;
};

export const images = {
  heroNet: {
    src: "/photos/court-net-bw.jpg",
    alt: "Cancha de tenis en blanco y negro: la red, la línea central y pelotas repartidas al sol",
    width: 2400,
    height: 1589,
    position: "50% 62%",
    credit: "Yoav Hornung / Unsplash (WGkwbpaWUJE)",
  },
  clayLines: {
    src: "/photos/clay-lines.jpg",
    alt: "Líneas blancas sobre una cancha de polvo de ladrillo",
    width: 2400,
    height: 1605,
    position: "35% 30%",
    credit: "Andrea Caligiuri / Unsplash (QK1mXce30bQ)",
  },
  courtLines: {
    src: "/photos/court-lines-bw.jpg",
    alt: "Líneas blancas de una cancha de tenis que se cruzan, en blanco y negro",
    width: 1600,
    height: 1200,
    credit: "Compagnons / Unsplash (yWyP_P5-6-A)",
  },
  heroCourt: {
    src: "/photos/clay-court-aerial.jpg",
    alt: "Cancha de polvo de ladrillo vista desde arriba, rodeada de árboles",
    width: 1600,
    height: 900,
    credit: "Denny Müller / Unsplash (Bx3DPnaSNvU)",
  },
  formatClassic: {
    src: "/photos/clay-court-player.jpg",
    alt: "Un jugador saca en una cancha de polvo de ladrillo, visto a través del alambrado",
    width: 1600,
    height: 900,
    credit: "Dan Gold / Unsplash (zZfIuQwB6UI)",
  },
  formatGold: {
    src: "/photos/hotel-sea-view.jpg",
    alt: "Habitación de hotel con el ventanal abierto al mar",
    width: 1600,
    height: 1067,
    position: "50% 60%",
    credit: "Johannes W / Unsplash (IQKuHc2lils)",
  },
  formatBlack: {
    src: "/photos/coast-forest-aerial.jpg",
    alt: "Costa con playa y bosque de pinos, vista desde el aire",
    width: 1600,
    height: 2400,
    position: "50% 55%",
    credit: "Aivars Vilks / Unsplash (W_MbKmp5cRU)",
  },
  table: {
    src: "/photos/shared-table-toast.jpg",
    alt: "Brindis con copas de vino blanco en una mesa compartida",
    width: 1600,
    height: 1067,
    credit: "Matthieu Joannon / Unsplash (6ciLddToTgM)",
  },
  footwork: {
    src: "/photos/clay-footwork-wide.jpg",
    alt: "Pies de un jugador deslizándose sobre el polvo de ladrillo",
    width: 1600,
    height: 760,
    position: "60% 100%",
    credit: "Gonzalo Facello / Unsplash (w6OlsN11hLk)",
  },
} satisfies Record<string, SiteImage>;

/** Imagen por slug de formato (los formatos viven en la base). */
export function formatImage(slug: string): SiteImage {
  if (slug === "gold") return images.formatGold;
  if (slug === "black") return images.formatBlack;
  return images.formatClassic;
}
