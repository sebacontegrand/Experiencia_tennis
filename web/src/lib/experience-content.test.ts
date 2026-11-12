import { describe, expect, it } from "vitest";
import { checkDates, cleanItinerary, dateFromInput, dateToInput, isValidSlug, linesToList, slugify, uniqueSlug } from "./experience-content";

describe("slugify / uniqueSlug / isValidSlug", () => {
  it("saca tildes y símbolos y agrega el año", () => {
    expect(slugify("Experiencia Tenis Gesell", 2026)).toBe("experiencia-tenis-gesell-2026");
    expect(slugify("  Clínica  & Asado — Pilar! ")).toBe("clinica-asado-pilar");
    expect(slugify("Gesell 2026", 2026)).toBe("gesell-2026");
    expect(slugify("¡¡¡")).toBe("experiencia");
  });
  it("evita repetidos", () => {
    expect(uniqueSlug("gesell-2026", ["gesell-2026", "gesell-2026-2"])).toBe("gesell-2026-3");
    expect(uniqueSlug("pilar", [])).toBe("pilar");
  });
  it("valida el formato", () => {
    expect(isValidSlug("gesell-2026")).toBe(true);
    expect(isValidSlug("Gesell 2026")).toBe(false);
    expect(isValidSlug("-gesell")).toBe(false);
    expect(isValidSlug("a--b")).toBe(false);
  });
});

describe("linesToList", () => {
  it("un renglón por ítem, sin viñetas, vacíos ni repetidos", () => {
    expect(linesToList("- Kit Wilson\n\n• Cena del sábado \n1. Traslados\nkit wilson\n  ")).toEqual(["Kit Wilson", "Cena del sábado", "Traslados"]);
  });
  it("no confunde un horario con una viñeta", () => {
    expect(linesToList("10.30 desayuno")).toEqual(["10.30 desayuno"]);
  });
});

describe("cleanItinerary", () => {
  it("limpia días e ítems vacíos", () => {
    const json = JSON.stringify([
      { day: " Viernes 11 ", title: "", items: [{ time: " 13:00 ", text: " Check-in " }, { time: "", text: "  " }] },
      { day: "", title: "", items: [] },
      { day: "", items: [{ text: "Algo" }] },
    ]);
    expect(cleanItinerary(json)).toEqual([
      { day: "Viernes 11", items: [{ time: "13:00", text: "Check-in" }] },
      { day: "Día", items: [{ text: "Algo" }] },
    ]);
  });
  it("rechaza JSON roto o con otra forma", () => {
    expect(cleanItinerary("{")).toBeNull();
    expect(cleanItinerary('[{"day":1}]')).toBeNull();
    expect(cleanItinerary("")).toEqual([]);
  });
});

describe("fechas", () => {
  it("input date ↔ mediodía de Buenos Aires", () => {
    const d = dateFromInput("2026-12-11")!;
    expect(d.toISOString()).toBe("2026-12-11T15:00:00.000Z");
    expect(dateToInput(d)).toBe("2026-12-11");
    expect(dateFromInput("11/12/2026")).toBeNull();
  });
  it("fin no puede ser antes del inicio ni durar más de 30 días", () => {
    const a = dateFromInput("2026-12-11"),
      b = dateFromInput("2026-12-13");
    expect(checkDates(a, b)).toBeNull();
    expect(checkDates(a, a)).toBeNull();
    expect(checkDates(b, a)).toBe("END_BEFORE_START");
    expect(checkDates(a, dateFromInput("2027-02-01"))).toBe("TOO_LONG");
    expect(checkDates(null, b)).toBe("INVALID");
  });
});
