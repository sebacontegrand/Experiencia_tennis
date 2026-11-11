/**
 * Configuración del sitio: único lugar para contacto, redes, URL y datos de pago.
 * Los datos faltantes del negocio quedan en null con TODO(negocio) — ver docs/PENDIENTES.md.
 */

/**
 * URL base: NEXT_PUBLIC_SITE_URL si está definida (dominio propio, cuando exista);
 * si no, en Vercel la URL de producción que inyecta la plataforma; en local, localhost.
 * Los previews también apuntan a producción: es la URL canónica para SEO y Open Graph.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;
  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl().replace(/\/$/, "");

export const siteConfig = {
  name: "Experiencia Tenis",
  brand: "Gabriela Bruno",
  url: siteUrl,
  locale: "es_AR",
  tagline: "El tenis nos reúne. La experiencia nos conecta.",
  secondaryTagline: "Jugá · Conectá · Viví",
  description:
    "Experiencias de tenis organizadas: competencia, encuentro social, gastronomía y bienestar. Vos jugás, nosotros nos ocupamos de todo.",

  contact: {
    // TODO(negocio): confirmar que WhatsApp y email son los de esta web (PENDIENTES #6)
    whatsappNumber: "5491123902736", // formato wa.me: sin +, sin espacios
    whatsappDisplay: "+54 9 11 2390 2736",
    whatsappDefaultMessage: "¡Hola! Quiero saber más sobre Experiencia Tenis.",
    email: "gabrielabrunotenis@gmail.com",
    // TODO(negocio): usuario de Instagram (PENDIENTES #3)
    instagramUser: null as string | null,
  },

  payments: {
    // TODO(negocio): alias/CBU y titular para transferencias (PENDIENTES #4) — se usa desde la Fase 2
    transferAlias: null as string | null,
    transferCbu: null as string | null,
    transferHolder: null as string | null,
  },
} as const;

export function whatsappLink(message: string = siteConfig.contact.whatsappDefaultMessage) {
  return `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function instagramLink() {
  const user = siteConfig.contact.instagramUser;
  return user ? `https://instagram.com/${user}` : null;
}

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
