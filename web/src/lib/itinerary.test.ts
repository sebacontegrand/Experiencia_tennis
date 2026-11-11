import { describe, expect, it } from "vitest";
import { parseItinerary } from "./itinerary";

describe("parseItinerary", () => {
  it("acepta el cronograma por día con horarios opcionales", () => {
    const value = [{ day: "Sábado 12", title: "Torneo", items: [{ time: "10:00", text: "Inicio" }, { text: "Libre" }] }];
    expect(parseItinerary(value)).toEqual(value);
  });
  it("devuelve [] si el Json no tiene la forma esperada", () => {
    expect(parseItinerary(null)).toEqual([]);
    expect(parseItinerary([{ day: "Viernes", items: ["texto suelto"] }])).toEqual([]);
  });
});
