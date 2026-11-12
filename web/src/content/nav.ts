/**
 * Navegación. Las rutas de fases futuras se agregan cuando existan
 * (Fase 4: /clubes-y-barrios, /hoteles, /nosotros…).
 */
export const mainNav = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/calendario", label: "Calendario" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const headerCta = { href: "/comunidad", label: "Sumate" } as const;

export const footerLinks = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/calendario", label: "Calendario" },
  { href: "/comunidad", label: "Sumate a la comunidad" },
  { href: "/contacto?motivo=CLUB", label: "Clubes y barrios" },
  { href: "/contacto?motivo=HOTEL", label: "Hoteles" },
  { href: "/contacto", label: "Contacto" },
  { href: "/privacidad", label: "Privacidad" },
] as const;

/** Acceso discreto al panel (arriba a la derecha). Lleva al login con Google si no hay sesión. */
export const adminLink = { href: "/admin", label: "Ingreso administradores" } as const;
