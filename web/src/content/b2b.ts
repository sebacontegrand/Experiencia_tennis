/**
 * Páginas para clubes, barrios, hoteles, empresas y marcas, y /nosotros.
 * Reescrito a partir del dossier de alianzas hoteleras y la propuesta Classic para barrios (_material/),
 * más corto y orientado a lo que gana cada parte. Sin nombres de barrios ni hoteles concretos.
 */
import { images, type SiteImage } from "@/content/images";

export type LeadTopic = "CLUB" | "BARRIO" | "HOTEL" | "EMPRESA" | "SPONSOR";

export type B2BPageCopy = {
  path: string;
  meta: { title: string; description: string };
  image: SiteImage;
  eyebrow: string;
  title: string;
  lead: string;
  benefits?: { title: string; items: { title: string; text: string }[] };
  /** Lista corta de reglas o pasos (cómo funciona). */
  howTitle?: string;
  how?: { title: string; text: string }[];
  /** Quién pone qué. */
  roles?: { title: string; items: { who: string; does: string[] }[] };
  pilot?: { title: string; text: string };
  form: {
    title: string;
    lead: string;
    submit: string;
    topics: LeadTopic[];
    messagePlaceholder: string;
    organizationLabel: string;
  };
};

export const clubsCopy: B2BPageCopy = {
  path: "/clubes-y-barrios",
  meta: {
    title: "Clubes y barrios privados",
    description:
      "Llevamos el formato Classic a tu club o barrio: torneos de dobles de un día, por nivel, con cupo limitado e ingreso organizado. Vos ponés las canchas; nosotros, todo lo demás.",
  },
  image: images.formatClassic,
  eyebrow: "Para clubes y barrios privados",
  title: "Tus canchas, punto de encuentro",
  lead: "Llevamos el formato Classic a tu sede: torneos de dobles de un día, por nivel, con cupo limitado e ingreso organizado. Vos ponés las canchas; nosotros, todo lo demás.",
  benefits: {
    title: "Qué gana tu club o barrio",
    items: [
      {
        title: "Canchas con vida",
        text: "Una actividad organizada para que socios y propietarios usen las instalaciones y se encuentren.",
      },
      {
        title: "Más comunidad",
        text: "Ocasiones para conocerse y sentirse parte, también en barrios que todavía se están poblando.",
      },
      {
        title: "Visitantes que conocen tu lugar",
        text: "Jugadores de afuera descubren la sede y sus servicios en una jornada cuidada.",
      },
      {
        title: "Sin carga para tu equipo",
        text: "Convocatoria, inscripciones, cobros, armado de partidos y coordinación del día corren por nuestra cuenta.",
      },
    ],
  },
  howTitle: "Cómo conviven el torneo y los socios",
  how: [
    {
      title: "Uso acotado",
      text: "Fecha, horario y canchas quedan por escrito, y siempre queda lugar para los socios. Si no cierra, ajustamos el cupo o la fecha antes de abrir inscripciones.",
    },
    {
      title: "Los socios, primero",
      text: "Los invitamos por los canales del club o barrio, con una ventana de inscripción anticipada.",
    },
    {
      title: "Ingreso ordenado",
      text: "Inscripción obligatoria y nómina de jugadores y acompañantes dentro de un cupo. Acceso, estacionamiento y normas se coordinan con la administración.",
    },
    {
      title: "Reglas claras de antemano",
      text: "Qué pasa si llueve, si alguien cancela o si cambia la disponibilidad: lo acordamos antes de cobrar una sola inscripción.",
    },
  ],
  roles: {
    title: "Quién pone qué",
    items: [
      {
        who: "Experiencia Tenis",
        does: [
          "Convocatoria, inscripciones y cobros",
          "Armado de partidos por nivel",
          "Coordinación de la jornada y comunicación con jugadores",
          "Evaluación posterior: participación, satisfacción e incidencias",
        ],
      },
      {
        who: "Tu club o barrio",
        does: ["Autorización de la actividad y del ingreso de externos", "Canchas y horarios acordados", "Coordinación del acceso", "Difusión entre socios o propietarios"],
      },
    ],
  },
  pilot: {
    title: "Empezamos con una fecha",
    text: "Una jornada piloto. Si funciona para las dos partes, armamos un calendario de pocas fechas, confirmadas con anticipación. El canon, las prestaciones y las responsabilidades de cada uno se acuerdan antes.",
  },
  form: {
    title: "Quiero ser sede",
    lead: "Contanos de tu club o barrio y te escribimos para coordinar una charla.",
    submit: "Quiero ser sede",
    topics: ["CLUB", "BARRIO"],
    messagePlaceholder: "Cuántas canchas tienen, qué superficie, qué días les quedan mejor…",
    organizationLabel: "Club o barrio",
  },
};

export const hotelsCopy: B2BPageCopy = {
  path: "/hoteles",
  meta: {
    title: "Hoteles",
    description:
      "Turismo deportivo para tu hotel: grupos de jugadores de clubes y barrios en las fechas que más necesitás. Nosotros convocamos y coordinamos; tu hotel suma huéspedes y consumo.",
  },
  image: images.formatGold,
  eyebrow: "Para hoteles",
  title: "Turismo deportivo para tus fechas tranquilas",
  lead: "Traemos grupos de jugadores de clubes, barrios y escuelas de tenis. El tenis es el motivo del viaje; tu hotel, el lugar donde descansan, comen bien y se quedan con ganas de volver.",
  benefits: {
    title: "Qué gana tu hotel",
    items: [
      { title: "Ocupación en fechas flojas", text: "Fines de semana y temporada baja, en fechas que elegimos juntos según lo que necesita el hotel." },
      { title: "Huéspedes nuevos", text: "Un público que viaja por el tenis, el bienestar y las escapadas, y que quizás todavía no te conoce." },
      { title: "Más consumo", text: "Gastronomía, spa y otros servicios, según el paquete que armemos." },
      { title: "Huéspedes que vuelven", text: "Por su cuenta, acompañados o en la próxima edición." },
    ],
  },
  roles: {
    title: "Quién pone qué",
    items: [
      {
        who: "Experiencia Tenis",
        does: ["Diseño y planificación de cada experiencia", "Convocatoria y promoción", "Inscripciones y atención de cada jugador", "Coordinación deportiva y general"],
      },
      {
        who: "Tu hotel",
        does: ["Tarifas de grupo", "Habitaciones según el cupo acordado", "Desayuno, gastronomía y bienestar según el paquete", "Atención al huésped"],
      },
      { who: "Un club cercano", does: ["Canchas y horarios", "Infraestructura deportiva"] },
    ],
  },
  pilot: {
    title: "Una primera edición Gold",
    text: "Proponemos un piloto de unas 24 personas: tenis, una noche con desayuno, bienestar y un encuentro gastronómico. Sirve para medir la respuesta y ver cómo funciona en la práctica. Tarifas, habitaciones, servicios, fechas, pagos y promoción los definimos juntos.",
  },
  form: {
    title: "Conversemos",
    lead: "Contanos del hotel y qué fechas te interesa mover. Te escribimos para coordinar.",
    submit: "Conversemos",
    topics: ["HOTEL"],
    messagePlaceholder: "Ubicación, cantidad de habitaciones, si tienen canchas o un club cerca, fechas de menor ocupación…",
    organizationLabel: "Hotel",
  },
};

export const hotelFormatsTitle = "Tres formatos, distintas oportunidades";

/** Lo que cada formato significa para un hotel (los formatos en sí vienen de la base). */
export const hotelFormatAngle: Record<string, string> = {
  classic: "Una jornada en un club. El hotel puede sumar alojamiento, spa o beneficios para quien quiera quedarse.",
  gold: "Tenis y una noche con desayuno y bienestar: un paquete para un grupo organizado.",
  black: "Dos noches con tenis, gastronomía y actividades: más estadía y más consumo por huésped.",
};

export const companiesCopy: B2BPageCopy = {
  path: "/empresas",
  meta: {
    title: "Empresas",
    description: "Experiencias de tenis para equipos, clientes y eventos de empresa. Próximamente.",
  },
  image: images.table,
  eyebrow: "Para empresas · Próximamente",
  title: "Tenis para tu equipo",
  lead: "Estamos preparando experiencias corporativas: una jornada de tenis por nivel, encuentro y buena mesa, para equipos, clientes o un cierre de año distinto. Si te interesa, contanos y te escribimos primero.",
  form: {
    title: "Consultar",
    lead: "Contanos qué tenés en mente: para cuántas personas, cuándo y dónde.",
    submit: "Consultar",
    topics: ["EMPRESA"],
    messagePlaceholder: "Cantidad de personas, fecha aproximada, zona…",
    organizationLabel: "Empresa",
  },
};

export const sponsorsCopy: B2BPageCopy = {
  path: "/sponsors",
  meta: {
    title: "Sponsors y marcas",
    description: "Acompañá a una comunidad de jugadoras y jugadores adultos que viajan por el tenis.",
  },
  image: images.footwork,
  eyebrow: "Para marcas",
  title: "Acompañá a una comunidad que juega",
  lead: "Jugadoras y jugadores adultos de clubes y barrios que eligen el tenis como parte de su vida, viajan para jugar y buscan algo más que un torneo. Una marca que acompaña está en cada momento de la experiencia.",
  benefits: {
    title: "Dónde puede estar tu marca",
    items: [
      { title: "En la cancha", text: "En los partidos, la premiación y la coordinación del día." },
      { title: "En el kit de bienvenida", text: "En lo que cada participante se lleva a casa." },
      { title: "En la mesa", text: "En el encuentro social y gastronómico, donde la gente se queda a compartir." },
      { title: "En lo que contamos", text: "En las fotos y los relatos de cada experiencia, en Instagram y en esta web." },
    ],
  },
  // TODO(negocio): paquetes concretos para marcas (PENDIENTES #16). No se publican cifras de comunidad hasta tenerlas.
  form: {
    title: "Quiero acompañar",
    lead: "Contanos de tu marca y qué te gustaría hacer. Armamos una propuesta a medida.",
    submit: "Quiero acompañar",
    topics: ["SPONSOR"],
    messagePlaceholder: "Qué hace tu marca y cómo te imaginás acompañando…",
    organizationLabel: "Marca o empresa",
  },
};

export const aboutCopy = {
  path: "/nosotros",
  meta: {
    title: "Nosotros",
    description: "Experiencia Tenis es una propuesta de turismo deportivo dirigida por Gabriela Bruno: tenis, descanso, buena mesa y un grupo de gente.",
  },
  image: images.heroCourt,
  eyebrow: "Nosotros",
  title: "El jugador es el protagonista",
  lead: "Experiencia Tenis combina tenis, bienestar, descanso, gastronomía y vínculos. No organizamos solo torneos: diseñamos experiencias para disfrutar el deporte, compartir y conocer lugares nuevos.",
  paragraphs: [
    "Trabajamos con tres formatos, Classic, Gold y Black, para adaptarnos a cada grupo, al tiempo que tiene y a su presupuesto. En todos cuidamos lo mismo: partidos por nivel, organización atenta y un lugar para encontrarse después de jugar.",
    "Lo hacemos junto a clubes, barrios y hoteles que comparten esa forma de recibir a la gente.",
  ],
  director: {
    title: "Quién está detrás",
    name: "Gabriela Bruno",
    role: "Dirección general y deportiva",
    // TODO(negocio): texto más personal y foto de Gabriela (PENDIENTES #7).
    bio: "Profesional del tenis con larga trayectoria en coordinación deportiva, gestión de programas y organización de torneos. Diseña, planifica y dirige cada Experiencia Tenis.",
  },
  values: {
    title: "Lo que cuidamos",
    items: [
      { title: "Tenis a tu nivel", text: "Partidos organizados por nivel, para que todos jueguen y la pasen bien." },
      { title: "Todo resuelto", text: "Vos jugás; nosotros nos ocupamos de la organización, de principio a fin." },
      { title: "Un grupo, no un paquete", text: "Cupos chicos y gente con ganas de compartir dentro y fuera de la cancha." },
    ],
  },
  ctas: {
    players: { href: "/comunidad", label: "Sumate a la comunidad" },
    partners: { href: "/clubes-y-barrios", label: "Para clubes y hoteles" },
  },
} as const;

/** Textos fijos del layout de las páginas B2B. */
export const b2bUi = {
  whatsappCta: "Escribir por WhatsApp",
  whatsappAlt: "O por WhatsApp:",
  otherLinks: "También trabajamos con",
  otherLinksLabel: "Otras propuestas",
} as const;

/** Links cruzados al pie de cada página B2B. */
export const b2bLinks = [
  { href: "/clubes-y-barrios", label: "Clubes y barrios" },
  { href: "/hoteles", label: "Hoteles" },
  { href: "/empresas", label: "Empresas" },
  { href: "/sponsors", label: "Marcas" },
] as const;
