/** Textos del pago online (Mercado Pago). */
export const paymentCopy = {
  payCta: "Pagar con Mercado Pago",
  page: {
    title: "Pagá tu lugar",
    lead: "Pagás con Mercado Pago: tarjeta de crédito o débito, dinero en cuenta o efectivo.",
    rows: { experience: "Experiencia", dates: "Fechas", option: "Opción", price: "Valor", paid: "Ya pagaste", due: "A pagar" },
    secure: "Te llevamos a Mercado Pago para pagar. No guardamos datos de tu tarjeta.",
    transfer: "¿Preferís transferencia? Escribinos por WhatsApp.",
    transferMessage: (title: string, name: string) => `Hola, soy ${name}. Quiero pagar ${title} por transferencia.`,
  },
  states: {
    PAID: { title: "Ya está todo pago", text: "Tu lugar está confirmado. Nos vemos en la cancha." },
    NO_PRICE: { title: "Todavía no hay un valor cargado", text: "Te escribimos por WhatsApp con el valor y cómo pagar." },
    NO_SEAT: { title: "Esta inscripción no tiene lugar asignado", text: "Si estás en lista de espera, te avisamos cuando se libere un lugar." },
    DISABLED: { title: "El pago online todavía no está disponible", text: "Escribinos por WhatsApp y coordinamos el pago." },
  },
  result: {
    approved: { title: "¡Pago aprobado!", text: "Tu lugar está confirmado. Te mandamos un email con el detalle." },
    pending: { title: "Tu pago está en proceso", text: "Mercado Pago lo está revisando. Te avisamos por email apenas se apruebe." },
    rejected: { title: "El pago no se aprobó", text: "No se hizo ningún cobro. Probá de nuevo con otro medio de pago." },
    unknown: { title: "Estamos esperando la confirmación", text: "Si ya pagaste, en unos minutos se actualiza. Si no, probá de nuevo." },
    retry: "Probar de nuevo",
    back: "Volver a la experiencia",
  },
  errors: {
    generic: "No pudimos abrir Mercado Pago. Probá de nuevo en un rato.",
    rateLimited: "Hiciste muchos intentos seguidos. Esperá unos minutos y probá de nuevo.",
  },
  email: {
    subject: (title: string) => `Pago aprobado · ${title}`,
    preview: "Recibimos tu pago. Tu lugar está confirmado.",
    intro: (title: string) => `Recibimos tu pago por Mercado Pago. Tu lugar en ${title} está confirmado.`,
    introPartial: (title: string) => `Recibimos tu pago por Mercado Pago para ${title}. Te contamos por WhatsApp cómo seguir con el saldo.`,
    rows: { amount: "Monto", operation: "Operación de Mercado Pago" },
    cta: "Escribinos por WhatsApp",
  },
  admin: {
    approved: (title: string, name: string) => `Pago aprobado por Mercado Pago · ${title}: ${name}`,
    attention: (title: string, name: string) => `Revisar pago de Mercado Pago · ${title}: ${name}`,
    attentionWhy: {
      NO_SEAT: "Pagó pero la inscripción está en lista de espera o cancelada: hay que darle lugar o devolver el dinero.",
      REFUND: "Mercado Pago informó una devolución o contracargo. El estado de la inscripción no se cambió.",
    },
  },
  panel: {
    linkTitle: "Link de pago",
    linkHint: "Mandáselo por WhatsApp para que pague con Mercado Pago el saldo.",
    copy: "Copiar link",
    copied: "Copiado",
    whatsapp: "Mandar por WhatsApp",
    whatsappMessage: (name: string, title: string, url: string) => `Hola ${name}, este es el link para pagar ${title} con Mercado Pago: ${url}`,
    disabled: "El pago online se activa cuando estén cargadas las credenciales de Mercado Pago.",
    mpOperation: "Mercado Pago",
  },
} as const;
