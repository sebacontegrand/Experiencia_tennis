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
  admin: {
    newPlayer: (name: string) => `Nueva persona en la comunidad: ${name}`,
    existingPlayer: (name: string) => `Actualizó sus datos en la comunidad: ${name}`,
    newLead: (type: string, name: string) => `Nueva consulta (${type}): ${name}`,
  },
} as const;
