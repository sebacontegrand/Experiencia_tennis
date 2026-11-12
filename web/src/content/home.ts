/** Textos de la home. Los formatos y las experiencias vienen de la base. */
export const homeCopy = {
  hero: {
    eyebrow: "Experiencia Tenis · Gabriela Bruno",
    title: "El tenis nos reúne.",
    titleAccent: "La experiencia nos conecta.",
    lead:
      "Jornadas y escapadas de tenis pensadas de punta a punta: partidos por nivel, buena mesa, bienestar y gente con ganas de compartir. Vos jugás; nosotros nos ocupamos de todo lo demás.",
    primaryCta: { href: "/comunidad", label: "Sumate a la comunidad" },
    secondaryCta: { href: "#proxima", label: "Ver próximas experiencias" },
  },

  about: {
    eyebrow: "Más que un torneo",
    title: "Una experiencia de tenis organizada",
    paragraphs: [
      "No organizamos torneos sueltos. Diseñamos experiencias completas donde el torneo es una parte, y lo demás importa tanto como el resultado: el encuentro, la comida compartida, el descanso y las ganas de volver.",
      "Cada fecha tiene cupos limitados y un seguimiento cercano antes, durante y después. No tenés que coordinar nada: llegás, jugás y disfrutás.",
    ],
    pillars: [
      { title: "Tenis", text: "Partidos organizados por nivel, con coordinación deportiva profesional." },
      { title: "Encuentro", text: "Gente que juega, comparte y arma comunidad." },
      { title: "Gastronomía", text: "Mesas compartidas y momentos para celebrar." },
      { title: "Bienestar", text: "Descanso, spa y tiempo para vos en las escapadas." },
    ],
  },

  formats: {
    eyebrow: "Tres formatos",
    title: "Elegí cómo querés vivirla",
    lead: "Desde un día de tenis y encuentro hasta un viaje completo. El mismo cuidado en cada formato.",
    cta: { href: "/experiencias", label: "Conocé los formatos" },
  },

  next: {
    eyebrow: "Próxima experiencia",
    title: "Lo que viene",
    empty: {
      title: "Estamos preparando las próximas fechas",
      text: "Sumate a la comunidad y te avisamos antes que a nadie, con prioridad para reservar tu lugar.",
      cta: { href: "/comunidad", label: "Quiero enterarme primero" },
    },
    allCta: { href: "/calendario", label: "Ver todas las fechas" },
  },

  howItWorks: {
    eyebrow: "Cómo funciona",
    title: "Simple, de principio a fin",
    steps: [
      { title: "Sumate a la comunidad", text: "Dejanos tus datos y tu nivel. Te avisamos cuando abre cada fecha." },
      { title: "Elegí tu experiencia", text: "Mirá el formato, la sede y las opciones, y reservá tu lugar." },
      { title: "Nosotros organizamos", text: "Cuadros por nivel, alojamiento, comidas, horarios y plan de lluvia." },
      { title: "Vos jugás y disfrutás", text: "Llegás, recibís tu kit y te dedicás a jugar y compartir." },
    ],
  },

  kit: {
    eyebrow: "Kit de bienvenida",
    title: "Te recibimos como corresponde",
    lead: "Cada participante recibe su kit al llegar.",
    items: [
      { icon: "bag", label: "Bolsa exclusiva" },
      { icon: "bottle", label: "Botella de hidratación" },
      { icon: "towel", label: "Toalla deportiva" },
      { icon: "ball", label: "Pelota Wilson" },
      { icon: "snack", label: "Snack saludable" },
      { icon: "card", label: "Tarjeta de bienvenida" },
    ],
  },

  community: {
    eyebrow: "Comunidad",
    title: "Jugá · Conectá · Viví",
    text:
      "Experiencia Tenis es, antes que nada, una comunidad de jugadoras y jugadores que buscan algo más que competir. Grupos de amigos, parejas de dobles, compañeras de club y profes que quieren compartir el tenis de otra manera.",
    // TODO(negocio): fotos y testimonios reales después de cada experiencia (Fase 6)
    photosSoon: "Muy pronto, las fotos de nuestras experiencias.",
  },

  partners: {
    eyebrow: "Nos acompañan",
    // Solo Wilson está autorizada (Gabriela es Wilson Advisor). El resto se suma desde el admin.
    wilsonNote: "Gabriela Bruno es Wilson Advisor.",
  },

  b2b: {
    eyebrow: "Para clubes, barrios y hoteles",
    title: "Llevemos la experiencia a tu sede",
    text:
      "Diseñamos, convocamos y coordinamos experiencias para clubes, barrios privados y hoteles: más actividad para tus socios o huéspedes, comunidad y nuevos visitantes con ingreso organizado.",
    ctas: [
      { href: "/contacto?motivo=CLUB", label: "Soy de un club o barrio" },
      { href: "/contacto?motivo=HOTEL", label: "Represento a un hotel" },
    ],
  },

  join: {
    eyebrow: "Sumate",
    title: "Sé parte de la comunidad",
    text: "Enterate primero de cada experiencia y reservá con prioridad. Es gratis y te lleva un minuto.",
  },
} as const;
