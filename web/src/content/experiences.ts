import type { ClosedReason } from "@/lib/registration-rules";

/** Textos de /experiencias, /calendario, detalle e inscripción. */
export const experiencesCopy = {
  index: {
    meta: {
      title: "Experiencias",
      description: "Classic, Gold y Black: tres formas de vivir el tenis con competencia, encuentro, gastronomía y bienestar.",
    },
    eyebrow: "Experiencias",
    title: "Tres formatos, el mismo cuidado",
    lead: "Desde una jornada de tenis y encuentro hasta un viaje completo. Elegí el que va con vos.",
    compareTitle: "Comparalos",
    compareRows: [
      { label: "Duración", values: { classic: "Un día", gold: "Una noche", black: "Dos noches o viaje" } },
      { label: "Tenis por nivel", values: { classic: true, gold: true, black: true } },
      { label: "Encuentro gastronómico", values: { classic: true, gold: true, black: true } },
      { label: "Alojamiento", values: { classic: false, gold: true, black: true } },
      { label: "Bienestar", values: { classic: false, gold: true, black: true } },
      { label: "Actividades sociales", values: { classic: "Encuentro y premiación", gold: true, black: true } },
    ] as { label: string; values: Record<string, boolean | string> }[],
    cta: { href: "/calendario", label: "Ver fechas" },
  },

  calendar: {
    meta: { title: "Calendario", description: "Próximas experiencias de tenis y fechas pasadas." },
    eyebrow: "Calendario",
    title: "Próximas fechas",
    pastTitle: "Experiencias pasadas",
    empty: "Estamos preparando las próximas fechas. Sumate a la comunidad y te avisamos primero.",
    emptyCta: { href: "/comunidad", label: "Sumate a la comunidad" },
  },

  status: {
    PUBLICADA: "Inscripción abierta",
    CUPO_COMPLETO: "Cupo completo · lista de espera",
    FINALIZADA: "Finalizada",
  } as Record<string, string>,

  audience: { MUJERES: "Solo mujeres", MIXTO: "Mixta" } as Record<string, string>,

  detail: {
    when: "Fechas",
    where: "Destino",
    venue: "Sede del torneo",
    hotel: "Alojamiento",
    capacity: "Cupo",
    capacityValue: (n: number) => `${n} personas`,
    seatsLeft: (n: number) => (n === 1 ? "Queda 1 lugar" : `Quedan ${n} lugares`),
    full: "Cupo completo: podés sumarte a la lista de espera",
    itinerary: "Cronograma",
    includes: "Qué incluye",
    excludes: "Qué no incluye",
    rainPlan: "Plan de lluvia",
    prices: "Opciones y valores",
    pricesNote: "Valores por persona, en pesos argentinos.",
    optionFull: "Completa",
    deadline: (date: string) => `Inscripción hasta el ${date}`,
    register: "Inscribirme",
    waitlist: "Sumarme a la lista de espera",
    waitlistShort: "Lista de espera",
    priceFrom: "Desde, por persona",
    priceAsk: "Precio",
    ask: "Consultar por WhatsApp",
    askMessage: (title: string) => `¡Hola! Quiero consultar por la experiencia ${title}.`,
    closed: "La inscripción está cerrada.",
    back: "Ver todas las fechas",
    cardCta: "Ver detalles",
  },

  registration: {
    metaTitle: (title: string) => `Inscripción · ${title}`,
    eyebrow: "Inscripción",
    lead: "Completá tus datos y reservamos tu lugar. Te contactamos para coordinar la seña.",
    waitlistLead:
      "El cupo está completo. Dejanos tus datos y quedás en la lista de espera: si se libera un lugar, te avisamos por orden de inscripción.",
    sections: { you: "Tus datos", experience: "Tu experiencia", extra: "Algo más" },
    fields: {
      priceOptionId: "Habitación y base",
      priceOptionHint: "Elegí la opción para tu reserva. Si compartís habitación, cada persona se inscribe por separado.",
      doublesPartner: "Compañero/a de dobles",
      doublesPartnerHint: "Si ya tenés con quién jugar",
      roommate: "Con quién compartís habitación",
      roommateHint: "Nombre y apellido de cada persona",
      menuChoice: "Menú para la cena",
      menuPlaceholder: "Elegí una opción",
      notes: "Comentarios",
      notesHint: "Restricciones alimentarias, horario de llegada o lo que quieras contarnos",
    },
    submit: "Confirmar inscripción",
    submitWaitlist: "Sumarme a la lista de espera",
    errors: {
      NOT_FOUND: "No encontramos esta experiencia.",
      NOT_OPEN: "La inscripción para esta experiencia no está abierta.",
      DEADLINE_PASSED: "La fecha límite de inscripción ya pasó. Escribinos por WhatsApp y vemos si hay lugar.",
      ALREADY_STARTED: "Esta experiencia ya comenzó.",
      INVALID_OPTION: "Elegí una opción de habitación válida.",
      INVALID_MENU: "Elegí una opción de menú válida.",
    } satisfies Record<ClosedReason | "NOT_FOUND" | "INVALID_OPTION" | "INVALID_MENU", string>,
    duplicate: (status: string) =>
      status === "LISTA_ESPERA"
        ? "Ya estás en la lista de espera de esta experiencia con este email. Te avisamos si se libera un lugar."
        : "Ya tenemos una inscripción tuya para esta experiencia con este email. Si querés cambiar algo, escribinos por WhatsApp.",
    success: {
      PENDIENTE: {
        title: "¡Tu lugar está reservado!",
        text: "Recibimos tu inscripción. Tu lugar queda reservado mientras coordinamos la seña. Te mandamos un email con el resumen.",
      },
      LISTA_ESPERA: {
        title: "Estás en la lista de espera",
        text: "El cupo está completo, pero quedaste en la lista de espera. Si se libera un lugar, te avisamos por orden de inscripción.",
      },
    },
    payment: {
      title: "Cómo seguir",
      // TODO(negocio): condiciones de seña y cancelación (PENDIENTES #8)
      withAlias: "Para confirmar tu lugar, transferí la seña a:",
      withoutAlias: "Te escribimos por WhatsApp con el valor y los datos para la seña. Si preferís, escribinos vos:",
      whatsappCta: "Escribir por WhatsApp",
      whatsappMessage: (title: string, name: string) => `¡Hola! Soy ${name}, me acabo de inscribir a ${title}.`,
    },
  },
} as const;
