import { z } from "zod";

/** Forma del campo `Experience.itinerary` (Json): cronograma por día. */
export const itinerarySchema = z.array(
  z.object({
    day: z.string(), // "Viernes 11"
    title: z.string().optional(), // "Llegada y descanso"
    items: z.array(z.object({ time: z.string().optional(), text: z.string() })),
  }),
);

export type Itinerary = z.infer<typeof itinerarySchema>;

/** Lee el Json de la base; si no tiene la forma esperada devuelve [] en vez de romper la página. */
export function parseItinerary(value: unknown): Itinerary {
  const r = itinerarySchema.safeParse(value);
  return r.success ? r.data : [];
}
