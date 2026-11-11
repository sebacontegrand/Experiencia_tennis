/** Opciones y textos compartidos por los formularios del sitio. */

export const levelOptions = [
  "Recién empiezo",
  "Intermedio",
  "Avanzado",
  "Competitivo (juego torneos)",
] as const;

export const genderValues = ["FEMENINO", "MASCULINO", "OTRO", "PREFIERO_NO_DECIR"] as const;

export const genderOptions: { value: (typeof genderValues)[number]; label: string }[] = [
  { value: "FEMENINO", label: "Mujer" },
  { value: "MASCULINO", label: "Hombre" },
  { value: "OTRO", label: "Otro" },
  { value: "PREFIERO_NO_DECIR", label: "Prefiero no decirlo" },
];

export const referralOptions = [
  "Instagram",
  "WhatsApp",
  "Por mi club o barrio",
  "Por un profesor/a",
  "Me lo recomendó alguien",
  "Otro",
] as const;

export const contactTopicValues = ["OTRO", "CLUB", "BARRIO", "HOTEL", "EMPRESA", "SPONSOR"] as const;

export const contactTopicOptions: { value: (typeof contactTopicValues)[number]; label: string }[] = [
  { value: "OTRO", label: "Consulta general" },
  { value: "CLUB", label: "Soy de un club" },
  { value: "BARRIO", label: "Soy de un barrio privado" },
  { value: "HOTEL", label: "Represento a un hotel" },
  { value: "EMPRESA", label: "Experiencia para mi empresa" },
  { value: "SPONSOR", label: "Quiero acompañar como marca" },
];

export const formCopy = {
  consentLabel:
    "Acepto que Experiencia Tenis guarde mis datos para contactarme y enviarme novedades, según la política de privacidad.",
  consentLink: "Ver política de privacidad",
  requiredHint: "Los campos con * son obligatorios.",
  genericError: "No pudimos enviar el formulario. Probá de nuevo en unos minutos o escribinos por WhatsApp.",
  rateLimited: "Recibimos varios envíos seguidos desde tu conexión. Esperá unos minutos y volvé a intentar.",
  fixErrors: "Revisá los campos marcados.",
  sending: "Enviando…",
} as const;
