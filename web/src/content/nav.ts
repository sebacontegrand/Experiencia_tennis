/** Navegación del sitio. */
export const mainNav = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/calendario", label: "Calendario" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/clubes-y-barrios", label: "Clubes y hoteles" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const headerCta = { href: "/comunidad", label: "Sumate" } as const;

export const footerLinks = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/calendario", label: "Calendario" },
  { href: "/comunidad", label: "Sumate a la comunidad" },
  { href: "/galeria", label: "Galería" },
  { href: "/clubes-y-barrios", label: "Clubes y barrios" },
  { href: "/hoteles", label: "Hoteles" },
  { href: "/empresas", label: "Empresas" },
  { href: "/sponsors", label: "Marcas y sponsors" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/privacidad", label: "Privacidad" },
] as const;

/** Acceso discreto al panel (arriba a la derecha). Lleva al login con Google si no hay sesión. */
export const adminLink = { href: "/admin", label: "Ingreso administradores" } as const;
