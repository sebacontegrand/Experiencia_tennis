import { describe, expect, it } from "vitest";
import { earningsFor, parsePercent, projectedResult, sharedCostPerPerson, suggestedPrice } from "./pricing";

describe("sharedCostPerPerson", () => {
  it("reparte los totales entre la asistencia esperada y suma los por persona", () => {
    const items = [
      { amount: 1_000_000, kind: "TOTAL" as const }, // canchas
      { amount: 500_000, kind: "TOTAL" as const }, // profe
      { amount: 40_000, kind: "PER_PERSON" as const }, // cena
    ];
    expect(sharedCostPerPerson(items, 20)).toBe(75_000 + 40_000);
  });
  it("nunca divide por cero", () => {
    expect(sharedCostPerPerson([{ amount: 100, kind: "TOTAL" }], 0)).toBe(100);
  });
});

describe("suggestedPrice (margen sobre el precio final)", () => {
  it("30 % sobre el precio: costo 100.000 → precio 142.858 → redondeado 143.000", () => {
    expect(suggestedPrice(100_000, 30)).toBe(143_000);
  });
  it("el % real queda igual o por encima del pedido", () => {
    const cost = 612_345;
    const price = suggestedPrice(cost, 25)!;
    expect(earningsFor(price, cost)!.percent).toBeGreaterThanOrEqual(25);
  });
  it("no salta por errores de coma flotante", () => {
    expect(suggestedPrice(70_000, 30)).toBe(100_000);
  });
  it("sin % o sin costo → null; % fuera de rango → null", () => {
    expect(suggestedPrice(100_000, null)).toBeNull();
    expect(suggestedPrice(0, 30)).toBeNull();
    expect(suggestedPrice(100_000, 95)).toBeNull();
  });
  it("0 % → el costo redondeado", () => {
    expect(suggestedPrice(99_100, 0)).toBe(100_000);
  });
});

describe("earningsFor", () => {
  it("ganancia y % sobre el precio", () => {
    expect(earningsFor(200_000, 150_000)).toEqual({ amount: 50_000, percent: 25 });
  });
  it("sin precio → null", () => {
    expect(earningsFor(null, 100)).toBeNull();
  });
});

describe("projectedResult", () => {
  it("cuenta los costos totales completos aunque vengan menos personas", () => {
    const r = projectedResult({
      items: [
        { amount: 1_000_000, kind: "TOTAL" },
        { amount: 50_000, kind: "PER_PERSON" },
      ],
      registrations: [
        { price: 900_000, optionCost: 400_000 },
        { price: 800_000, optionCost: 300_000 },
        { price: null, optionCost: 300_000 },
      ],
    });
    expect(r).toEqual({ people: 3, revenue: 1_700_000, costs: 1_000_000 + 150_000 + 1_000_000, earnings: -450_000, missingPrices: 1 });
  });
});

describe("parsePercent", () => {
  it("acepta enteros con o sin %", () => {
    expect(parsePercent("30")).toBe(30);
    expect(parsePercent("30 %")).toBe(30);
    expect(parsePercent("")).toBeNull();
  });
  it("rechaza decimales, texto y más de 90", () => {
    expect(parsePercent("27,5")).toBeUndefined();
    expect(parsePercent("abc")).toBeUndefined();
    expect(parsePercent("95")).toBeUndefined();
  });
});
