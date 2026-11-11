import { describe, expect, it } from "vitest";
import { formatDateRange, formatPrice } from "./format";

describe("formatDateRange", () => {
  it("mismo mes", () => {
    expect(formatDateRange(new Date("2026-12-11T15:00:00Z"), new Date("2026-12-13T15:00:00Z"))).toBe(
      "11 al 13 de diciembre de 2026",
    );
  });
  it("distinto mes", () => {
    expect(formatDateRange(new Date("2026-11-30T15:00:00Z"), new Date("2026-12-02T15:00:00Z"))).toBe(
      "30 de noviembre al 2 de diciembre de 2026",
    );
  });
  it("un solo día", () => {
    expect(formatDateRange(new Date("2027-03-05T15:00:00Z"), new Date("2027-03-05T20:00:00Z"))).toBe(
      "5 de marzo de 2027",
    );
  });
});

describe("formatPrice", () => {
  it("null → Consultar", () => expect(formatPrice(null)).toBe("Consultar"));
  it("formatea ARS sin decimales", () => expect(formatPrice(1250000).replace(/\s/g, " ")).toMatch(/\$ ?1\.250\.000/));
});
