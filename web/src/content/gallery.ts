/** Textos de la galería de fotos de cada experiencia. */
export const galleryCopy = {
  title: "Galería",
  lead: "Las fotos de cada experiencia, para que te encuentres, las descargues y las compartas.",
  albumsTitle: "Álbumes",
  photos: (n: number) => (n === 1 ? "1 foto" : `${n} fotos`),
  open: "Ver el álbum",
  upcomingTitle: "Próximos álbumes",
  upcomingLead: "Se publican acá después de cada experiencia. Si vas, buscate.",
  upcomingWhen: "Fotos después del",
  empty: {
    title: "Todavía no hay álbumes",
    text: "Las fotos de cada experiencia se publican acá unos días después de jugarla.",
    cta: { href: "/calendario", label: "Ver las próximas fechas" },
  },
  back: "Galería",
  albumLead: "Tocá una foto para verla grande y descargarla.",
  download: "Descargar",
  share: "Compartir por WhatsApp",
  shareText: (title: string, url: string) => `Mirá las fotos de ${title}: ${url}`,
  close: "Cerrar",
  prev: "Foto anterior",
  next: "Foto siguiente",
  counter: (i: number, n: number) => `${i} de ${n}`,
  removal: {
    title: "¿Aparecés en una foto y preferís que no esté?",
    text: "Escribinos y la sacamos, sin vueltas.",
    cta: "Pedir que la saquemos",
    message: (title: string, n?: number) =>
      n ? `Hola, aparezco en la foto ${n} del álbum ${title} y prefiero que la saquen.` : `Hola, aparezco en una foto del álbum ${title} y prefiero que la saquen.`,
  },
  detailLink: (n: number) => `Ver las fotos (${n})`,
  homeLink: "Ver la galería",
} as const;
