import { siteConfig } from "@/config/site";

/**
 * Política de privacidad (Ley 25.326 de Protección de los Datos Personales).
 * TODO(negocio): datos del responsable de la base (nombre o razón social, CUIT, domicilio)
 * e inscripción ante la AAIP (PENDIENTES #9). Conviene que la revise un abogado/a.
 */
export const privacyResponsible = {
  name: null as string | null,
  taxId: null as string | null,
  address: null as string | null,
};

export const PENDING_DATA = "(dato pendiente de publicación)";

export const privacyCopy = {
  meta: {
    title: "Política de privacidad",
    description: "Cómo cuida Experiencia Tenis tus datos personales, según la Ley 25.326.",
  },
  title: "Política de privacidad",
  updated: "Última actualización: noviembre de 2026",
  sections: [
    {
      title: "1. Quién es responsable de tus datos",
      body: [
        `Los datos que nos dejás en este sitio forman parte de una base de datos de ${siteConfig.name}, responsable de su tratamiento.`,
        "__RESPONSIBLE__",
        `Para cualquier consulta sobre tus datos podés escribirnos a ${siteConfig.contact.email}.`,
      ],
    },
    {
      title: "2. Qué datos recopilamos",
      body: [
        "Los que vos nos das al completar un formulario: nombre, apellido, email, WhatsApp, ciudad, club o barrio, nivel de juego y, si querés, género y cómo nos conociste. En las inscripciones a experiencias también podemos pedirte datos necesarios para organizarlas (compañero/a de dobles, con quién compartís habitación, preferencias de menú).",
        "No pedimos datos sensibles. Si nos contás alguna restricción alimentaria o de salud, la usamos solo para organizar la experiencia.",
      ],
    },
    {
      title: "3. Para qué los usamos",
      body: [
        "Para contactarte, avisarte de nuevas experiencias, gestionar tus inscripciones y pagos, organizar los cuadros por nivel y mejorar lo que hacemos.",
        "Para coordinar el alojamiento o el ingreso a la sede, podemos compartir la nómina de participantes (nombre y lo estrictamente necesario) con el hotel o el club/barrio de cada experiencia. No vendemos ni cedemos tus datos a terceros con otros fines.",
      ],
    },
    {
      title: "4. Tu consentimiento",
      body: [
        "Al enviar un formulario y marcar la casilla de consentimiento aceptás que tratemos tus datos para estos fines. Podés retirar tu consentimiento en cualquier momento.",
      ],
    },
    {
      title: "5. Tus derechos",
      body: [
        `Tenés derecho a acceder, rectificar, actualizar y pedir la supresión de tus datos (arts. 14, 15 y 16 de la Ley 25.326). Escribinos a ${siteConfig.contact.email} y respondemos dentro de los plazos legales: 10 días corridos para el acceso y 5 días hábiles para la rectificación o supresión.`,
        "El derecho de acceso puede ejercerse en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo (art. 14, inc. 3, Ley 25.326).",
        "La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
      ],
    },
    {
      title: "6. Cómo los cuidamos",
      body: [
        "Guardamos los datos en servidores con acceso restringido al equipo de Experiencia Tenis y aplicamos medidas razonables de seguridad. Los conservamos mientras formes parte de la comunidad o hasta que nos pidas darlos de baja.",
      ],
    },
    {
      title: "7. Cambios en esta política",
      body: ["Si cambiamos esta política, publicamos la nueva versión en esta página con su fecha de actualización."],
    },
  ],
} as const;
