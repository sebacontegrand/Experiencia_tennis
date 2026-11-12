export const emailCopy = {
  welcome: {
    subject: "¡Bienvenida/o a la comunidad de Experiencia Tenis!",
    preview: "Ya sos parte. Te avisamos primero de cada nueva experiencia.",
    heading: (name: string) => `¡Hola, ${name}!`,
    body: [
      "Gracias por sumarte a la comunidad de Experiencia Tenis.",
      "Desde ahora vas a ser de las primeras personas en enterarte de cada nueva experiencia: jornadas de un día, escapadas con alojamiento y viajes de tenis, siempre con cupos limitados.",
      "Vos jugás, compartís y disfrutás. Nosotros nos ocupamos de todo lo demás.",
    ],
    cta: "Escribinos por WhatsApp",
    whatsappMessage: "¡Hola! Me acabo de sumar a la comunidad de Experiencia Tenis.",
    unsubscribe: "Si no querés recibir más novedades, respondé este email y te damos de baja.",
    privacy: "Política de privacidad",
  },
  contactReceived: {
    subject: "Recibimos tu mensaje — Experiencia Tenis",
    preview: "Gracias por escribirnos. Te respondemos a la brevedad.",
    heading: (name: string) => `Gracias, ${name}`,
    body: [
      "Recibimos tu mensaje y te vamos a responder a la brevedad.",
      "Si es urgente, escribinos por WhatsApp y lo vemos enseguida.",
    ],
  },
  registration: {
    subject: {
      PENDIENTE: (title: string) => `Tu inscripción a ${title}`,
      LISTA_ESPERA: (title: string) => `Lista de espera · ${title}`,
    },
    preview: {
      PENDIENTE: "Tu lugar está reservado. Te contamos cómo seguir.",
      LISTA_ESPERA: "Quedaste en la lista de espera. Te avisamos si se libera un lugar.",
    },
    heading: (name: string) => `¡Hola, ${name}!`,
    intro: {
      PENDIENTE: (title: string) => `Recibimos tu inscripción a ${title}. Tu lugar queda reservado mientras coordinamos la seña.`,
      LISTA_ESPERA: (title: string) =>
        `El cupo de ${title} está completo, pero quedaste en la lista de espera. Si se libera un lugar, te avisamos por orden de inscripción.`,
    },
    summary: "Resumen",
    rows: { dates: "Fechas", option: "Opción", price: "Valor" },
    paymentWithAlias: "Para confirmar tu lugar, transferí la seña a:",
    paymentWithoutAlias: "Te escribimos por WhatsApp con el valor y los datos para la seña.",
    cta: "Escribinos por WhatsApp",
  },
  admin: {
    newRegistration: (status: string, title: string, name: string) =>
      `${status === "LISTA_ESPERA" ? "Lista de espera" : "Nueva inscripción"} · ${title}: ${name}`,
    capacityFilled: (title: string) => `Se completó el cupo de ${title}`,
    newPlayer: (name: string) => `Nueva persona en la comunidad: ${name}`,
    existingPlayer: (name: string) => `Actualizó sus datos en la comunidad: ${name}`,
    newLead: (type: string, name: string) => `Nueva consulta (${type}): ${name}`,
  },
} as const;
