/**
 * Datos iniciales: los tres formatos y la experiencia de Villa Gesell en BORRADOR.
 * Idempotente (upsert por slug). Ejecutar: npx prisma db seed
 *
 * Importante: los importes de _material/ son costos de proveedores. Acá los precios
 * quedan en null ("Consultar") hasta que el admin cargue el precio al público.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Itinerary } from "../src/lib/itinerary";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const formats = [
  {
    slug: "classic",
    name: "Classic",
    tagline: "Un día para jugar, competir y compartir.",
    description:
      "Una jornada completa de tenis en un club o barrio: partidos organizados por nivel, coordinación profesional y un encuentro social y gastronómico para cerrar el día.",
    benefits: [
      "Partidos organizados por nivel",
      "Coordinación deportiva profesional",
      "Encuentro social y gastronómico",
      "Premiación",
    ],
    sortOrder: 1,
  },
  {
    slug: "gold",
    name: "Gold",
    tagline: "Tenis, descanso y bienestar en una escapada.",
    description:
      "Una escapada para jugar y descansar: torneo o encuentro de tenis, una noche de alojamiento con desayuno, bienestar y un encuentro gastronómico.",
    benefits: [
      "Torneo o encuentro de tenis",
      "Una noche de alojamiento con desayuno",
      "Actividades de bienestar",
      "Encuentro gastronómico",
    ],
    sortOrder: 2,
  },
  {
    slug: "black",
    name: "Black",
    tagline: "La versión más completa de la experiencia.",
    description:
      "Dos noches o un viaje a un destino elegido, con jornadas deportivas, gastronomía, bienestar y actividades sociales. Todo organizado de punta a punta.",
    benefits: [
      "Dos noches o viaje a destino elegido",
      "Jornadas deportivas",
      "Gastronomía",
      "Bienestar",
      "Actividades sociales",
    ],
    sortOrder: 3,
  },
];

async function main() {
  for (const f of formats) {
    await db.experienceFormat.upsert({ where: { slug: f.slug }, update: f, create: f });
  }
  const black = await db.experienceFormat.findUniqueOrThrow({ where: { slug: "black" } });

  // Aliados. Solo Wilson aparece en la franja "Nos acompañan".
  // Hotel y club: se nombran dentro de la experiencia de Villa Gesell (autorizado 11/11), sin logos ni franja.
  const wilson = await db.partner.findFirst({ where: { name: "Wilson" } });
  if (!wilson) {
    await db.partner.create({ data: { type: "SPONSOR", name: "Wilson", isPublic: true, sortOrder: 1 } });
  }
  let hotel = await db.partner.findFirst({ where: { name: "Tequendama Spa & Resort" } });
  hotel ??= await db.partner.create({
    data: {
      type: "HOTEL",
      name: "Tequendama Spa & Resort",
      city: "Villa Gesell",
      isPublic: false,
      internalNotes: "Se puede nombrar en la experiencia de Villa Gesell (sin logo). Bloqueo de habitaciones hasta el 25/11/2026.",
    },
  });
  let club = await db.partner.findFirst({ where: { name: "Villa Gesell Golf Club" } });
  club ??= await db.partner.create({
    data: {
      type: "CLUB",
      name: "Villa Gesell Golf Club",
      city: "Villa Gesell",
      isPublic: false,
      internalNotes: "Sede del torneo de Villa Gesell (sábado 12/12). Se puede nombrar en la experiencia, sin logo.",
    },
  });

  const slug = "villa-gesell-diciembre-2026";
  // Fuente: flyers de Gabriela del 11/11 (cronograma del fin de semana).
  const itinerary: Itinerary = [
    {
      day: "Viernes 11",
      title: "Llegada y descanso",
      items: [
        { time: "Desde 13:00", text: "Check-in en Tequendama Spa & Resort y entrega del kit de bienvenida." },
        {
          time: "Tarde libre",
          text: "Piscina cubierta climatizada, spa, gimnasio o playa. El hotel cuenta con reposeras para la playa, estacionamiento y wifi.",
        },
      ],
    },
    {
      day: "Sábado 12",
      title: "Torneo y premiación",
      items: [
        { time: "8:00 a 9:30", text: "Desayuno americano en el hotel." },
        { time: "9:45", text: "Encuentro en el Villa Gesell Golf Club." },
        { time: "10:00", text: "Inicio del torneo." },
        { time: "12:00", text: "Pausa y almuerzo incluido en el bufé del club." },
        { time: "14:00", text: "Se reanuda el torneo." },
        { time: "19:00", text: "Fin del torneo y regreso al hotel." },
        { time: "21:00", text: "Cena, premiación, juegos y cierre." },
      ],
    },
    {
      day: "Domingo 13",
      title: "Desayuno y despedida",
      items: [
        { time: "8:00 a 10:00", text: "Desayuno en el hotel." },
        { time: "13:00", text: "Check-out." },
      ],
    },
  ];

  const villaGesell = {
    title: "Experiencia Tenis Gesell",
    destination: "Villa Gesell, Buenos Aires",
    // 11 al 13 de diciembre de 2026 (mediodía en Buenos Aires, para evitar corrimientos de día)
    startDate: new Date("2026-12-11T15:00:00Z"),
    endDate: new Date("2026-12-13T15:00:00Z"),
    capacity: 25,
    summary: "Un torneo, una escapada a la costa y gente que disfruta el tenis tanto como vos.",
    description:
      "Un fin de semana Black en Villa Gesell: dos noches en Tequendama Spa & Resort y un torneo el sábado en el Villa Gesell Golf Club, con almuerzo en el club y una cena de cierre con premiación y juegos. El viernes es para llegar y descansar: piscina cubierta climatizada, spa, gimnasio o playa.",
    itinerary,
    includes: [
      "Dos noches en Tequendama Spa & Resort",
      "Desayuno del sábado y del domingo en el hotel",
      "Torneo en el Villa Gesell Golf Club, organizado por nivel",
      "Almuerzo del sábado en el bufé del club",
      "Cena del sábado con premiación, juegos y cierre",
      "Kit de bienvenida: bolsa, botella, toalla, pelota Wilson, snack y tarjeta",
      "Coordinación deportiva y atención durante todo el fin de semana",
    ],
    excludes: [] as string[], // TODO(negocio): qué no incluye (traslados, otras comidas, etc.)
    rainPlan: "Si llueve, las actividades se trasladan a un salón de usos múltiples.",
    // TODO(negocio): opciones exactas del menú de la cena (hay opción vegetariana)
    menuOptions: [] as string[],
    formatId: black.id,
    hotelId: hotel.id,
    venueId: club.id,
  };

  const existing = await db.experience.findUnique({ where: { slug } });
  if (existing?.status === "BORRADOR") {
    // Hasta que exista el admin (Fase 3), el seed es la fuente del contenido del borrador.
    // Nunca toca el estado ni las opciones de precio.
    await db.experience.update({ where: { slug }, data: villaGesell });
    console.log(`Experiencia "${slug}" (BORRADOR): contenido actualizado.`);
  } else if (existing) {
    console.log(`Experiencia "${slug}" ya está en ${existing.status}; no se modifica.`);
  } else {
    await db.experience.create({
      data: {
        slug,
        status: "BORRADOR",
        ...villaGesell,
        priceOptions: {
          // TODO(negocio): precio al público por habitación y base (PENDIENTES #1). null = "Consultar".
          create: [
            { label: "Suite Resort – base single", price: null, sortOrder: 1 },
            { label: "Suite Resort – base doble", price: null, sortOrder: 2 },
            { label: "Suite Resort – base triple", price: null, sortOrder: 3 },
            { label: "Classic Estándar – base single", price: null, sortOrder: 4 },
            { label: "Classic Estándar – base doble", price: null, sortOrder: 5 },
            { label: "Classic Estándar – base triple", price: null, sortOrder: 6 },
          ],
        },
      },
    });
    console.log(`Experiencia "${slug}" creada en BORRADOR.`);
  }

  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
