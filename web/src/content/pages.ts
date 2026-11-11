/** Textos de /comunidad y /contacto. */

export const communityCopy = {
  meta: {
    title: "Sumate a la comunidad",
    description:
      "Sumate a la comunidad de Experiencia Tenis: enterate primero de cada jornada, escapada y viaje de tenis, y reservá con prioridad.",
  },
  eyebrow: "Comunidad",
  title: "Sumate a la comunidad",
  lead: "Jugadoras y jugadores que buscan algo más que competir. Es gratis y te lleva un minuto.",
  reasons: [
    { title: "Enterate primero", text: "Te avisamos de cada nueva fecha antes de publicarla." },
    { title: "Prioridad para reservar", text: "Los cupos son limitados: la comunidad elige primero." },
    { title: "Jugá a tu nivel", text: "Con tu nivel armamos cuadros parejos y partidos que valen la pena." },
    { title: "Conocé gente", text: "Una comunidad que juega, comparte y quiere volver." },
  ],
  form: {
    title: "Tus datos",
    submit: "Sumarme",
    successTitle: "¡Listo, ya sos parte!",
    successText:
      "Te mandamos un email de bienvenida. Cuando abra la próxima experiencia vas a ser de las primeras personas en saberlo.",
    successCta: "Escribinos por WhatsApp",
    fields: {
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Email",
      whatsapp: "WhatsApp",
      whatsappHint: "Con característica, por ejemplo 11 2345 6789",
      city: "Ciudad o localidad",
      club: "Club o barrio donde jugás",
      level: "Nivel de juego",
      levelPlaceholder: "Elegí tu nivel",
      gender: "Género",
      genderPlaceholder: "Opcional",
      referralSource: "¿Cómo nos conociste?",
      referralPlaceholder: "Opcional",
    },
  },
} as const;

export const contactCopy = {
  meta: {
    title: "Contacto",
    description: "Escribinos por WhatsApp, email o Instagram. Clubes, barrios, hoteles, empresas y marcas también.",
  },
  eyebrow: "Contacto",
  title: "Hablemos",
  lead: "¿Tenés una consulta, querés llevar una experiencia a tu club u hotel, o acompañarnos como marca? Escribinos.",
  channels: {
    title: "Canales directos",
    whatsapp: "WhatsApp",
    email: "Email",
    instagram: "Instagram",
    instagramPending: "Próximamente",
  },
  form: {
    title: "Envianos un mensaje",
    submit: "Enviar mensaje",
    successTitle: "¡Gracias por escribirnos!",
    successText: "Recibimos tu mensaje y te respondemos a la brevedad.",
    fields: {
      type: "Motivo",
      name: "Nombre y apellido",
      organization: "Club, barrio, hotel o empresa",
      organizationHint: "Si corresponde",
      email: "Email",
      whatsapp: "WhatsApp",
      whatsappHint: "Opcional",
      message: "Mensaje",
    },
  },
} as const;

export const notFoundCopy = {
  title: "No encontramos esta página",
  text: "Puede que el enlace haya cambiado. Volvé al inicio o escribinos si buscabas algo puntual.",
  cta: "Ir al inicio",
} as const;
