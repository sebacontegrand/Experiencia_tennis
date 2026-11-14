/**
 * «Anatomía de una experiencia» (home). Cada pieza tiene un dato técnico general de una raqueta
 * de adulto (no de un modelo en particular), qué aporta al juego y lo que representa en la
 * experiencia. Lo de la experiencia sale de textos ya aprobados de la home; no sumar promesas acá.
 */
export type RacketPartId = "strings" | "sweetspot" | "frame" | "throat" | "grip" | "cap";

export type RacketTrait = "Potencia" | "Efecto" | "Control" | "Confort" | "Manejo";

export type RacketPart = {
  id: RacketPartId;
  name: string;
  spec: string;
  traits: RacketTrait[];
  /** Qué aporta al juego y quién lo valora. */
  play: string;
  title: string;
  text: string;
};

export type PlayerProfile = {
  id: string;
  label: string;
  wants: RacketTrait[];
  parts: RacketPartId[];
  text: string;
};

export const racketCopy = {
  title: "Anatomía de una experiencia",
  lead: "Una raqueta funciona porque cada pieza hace su parte. Una experiencia, también.",
  scrollHint: "Deslizá para desarmarla",
  stepLabel: "Pieza",
  of: "de",
  inExperience: "En la experiencia",
  lengthLabel: "68,5 cm",
  outro: {
    spec: "Rearmada · 68,5 cm",
    title: "Todo junto, en una sola experiencia.",
    cta: { href: "/calendario", label: "Ver las próximas fechas" },
  },
  parts: [
    {
      id: "strings",
      name: "Encordado",
      spec: "Patrón 16 × 19 · entre 22 y 26 kg de tensión",
      traits: ["Efecto", "Control"],
      play: "Un patrón abierto deja que las cuerdas muerdan la pelota y le den efecto; uno cerrado, más control. Con menos tensión sale más fuerte; con más, más precisa.",
      title: "El tenis",
      text: "Partidos organizados por nivel, con coordinación deportiva profesional.",
    },
    {
      id: "sweetspot",
      name: "Punto dulce",
      spec: "La zona donde la pelota sale sola",
      traits: ["Potencia", "Confort"],
      play: "Si le pegás ahí, la pelota sale con potencia y casi sin vibración. Las cabezas grandes lo agrandan: lo agradece quien empieza o vuelve al tenis.",
      title: "El encuentro",
      text: "Gente que juega, comparte la mesa y arma comunidad. Ese momento en que todo encaja.",
    },
    {
      id: "frame",
      name: "Marco",
      spec: "Cabeza de unos 630 cm² · grafito",
      traits: ["Potencia", "Control"],
      play: "Rígido y con cabeza grande, perdona errores y suma potencia. Más flexible y chico, da control: lo eligen quienes ya tienen el golpe armado y quieren ubicar la pelota.",
      title: "La organización",
      text: "Cuadros por nivel, alojamiento, comidas, horarios y plan de lluvia. La estructura que sostiene todo.",
    },
    {
      id: "throat",
      name: "Garganta",
      spec: "Une la cabeza con el mango",
      traits: ["Confort", "Control"],
      play: "Define cuánto se flexiona la raqueta y cuánta vibración llega al brazo. La valora quien juega muchas horas por semana o cuida el codo.",
      title: "El bienestar",
      text: "Descanso, spa y tiempo para vos en las escapadas. Lo que amortigua el ritmo de la semana.",
    },
    {
      id: "grip",
      name: "Empuñadura",
      spec: "Mango octogonal con cubregrip",
      traits: ["Control", "Manejo"],
      play: "El grosor justo da control sin apretar de más ni cargar la muñeca. En dobles, cerca de la red, se nota en cada volea rápida.",
      title: "El kit de bienvenida",
      text: "Bolsa exclusiva, botella, toalla, pelota Wilson, snack y tarjeta. Lo tenés en la mano apenas llegás.",
    },
    {
      id: "cap",
      name: "Tapón",
      spec: "Cierra el mango · 68,5 cm de largo total",
      traits: ["Manejo", "Potencia"],
      play: "Equilibra la raqueta: con más peso abajo se mueve rápido en la red; con más peso arriba, pega más fuerte desde el fondo.",
      title: "El seguimiento",
      text: "Un acompañamiento cercano antes, durante y después. Vos jugás; nosotros nos ocupamos del resto.",
    },
  ] satisfies RacketPart[],

  profiles: {
    title: "¿Qué buscás en la cancha?",
    lead: "Cada jugador valora algo distinto de su raqueta. Elegí cómo jugás y mirá qué piezas pesan más.",
    wantsLabel: "Valorás",
    closing: "Juegues como juegues, en cada experiencia los partidos se arman por nivel.",
    items: [
      {
        id: "fondo",
        label: "Pego fuerte desde el fondo",
        wants: ["Potencia", "Efecto"],
        parts: ["frame", "sweetspot", "cap"],
        text: "Un marco que acompañe el golpe, el punto dulce bien grande y algo de peso arriba para que la pelota llegue profunda.",
      },
      {
        id: "efecto",
        label: "Le doy mucho efecto",
        wants: ["Efecto", "Control"],
        parts: ["strings", "frame"],
        text: "Un encordado abierto que muerda la pelota y un marco que te deje acelerar sin perder el control.",
      },
      {
        id: "red",
        label: "Juego en la red y en dobles",
        wants: ["Manejo", "Control"],
        parts: ["grip", "cap", "strings"],
        text: "Una raqueta que se mueva rápido: el peso hacia el mango, la empuñadura justa y cuerdas un poco más tensas para ubicar la volea.",
      },
      {
        id: "confort",
        label: "Quiero jugar cómodo muchos años",
        wants: ["Confort", "Potencia"],
        parts: ["throat", "sweetspot", "strings"],
        text: "Poca vibración y una cabeza que perdone: la garganta y el punto dulce cuidan tu brazo, y una tensión más baja hace el resto.",
      },
    ] satisfies PlayerProfile[],
  },
} as const;
