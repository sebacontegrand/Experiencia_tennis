/**
 * Navegación. Las rutas de fases futuras se agregan cuando existan
 * (Fase 2: /experiencias, /calendario · Fase 4: /clubes-y-barrios, /hoteles, /nosotros…).
 */
export const mainNav = [
  { href: "/", label: "Inicio" },
  { href: "/#formatos", label: "Experiencias" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const headerCta = { href: "/comunidad", label: "Sumate" } as const;

export const footerLinks = [
  { href: "/comunidad", label: "Sumate a la comunidad" },
  { href: "/contacto?motivo=CLUB", label: "Clubes y barrios" },
  { href: "/contacto?motivo=HOTEL", label: "Hoteles" },
  { href: "/contacto", label: "Contacto" },
  { href: "/privacidad", label: "Privacidad" },
] as const;
