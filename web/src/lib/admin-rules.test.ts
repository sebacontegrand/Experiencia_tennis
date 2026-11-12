import { describe, expect, it } from "vitest";
import { parsePrice, statusAfterCapacityChange, statusOnPublish } from "./admin-rules";

describe("parsePrice", () => {
  it("vacío → null (Consultar)", () => {
    expect(parsePrice("")).toBeNull();
    expect(parsePrice("   ")).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
  });
  it("acepta con y sin puntos de miles, con $", () => {
    expect(parsePrice("850000")).toBe(850000);
    expect(parsePrice("850.000")).toBe(850000);
    expect(parsePrice("$ 1.250.000")).toBe(1250000);
  });
  it("rechaza centavos, texto, negativos y cero", () => {
    for (const v of ["850.000,50", "850,5", "abc", "-100", "0", "85.00"]) expect(parsePrice(v), v).toBeUndefined();
  });
});

describe("estado según cupo", () => {
  it("bajar el cupo por debajo de los ocupados completa la experiencia", () =>
    expect(statusAfterCapacityChange("PUBLICADA", 20, 20)).toBe("CUPO_COMPLETO"));
  it("subir el cupo reabre una completa", () => expect(statusAfterCapacityChange("CUPO_COMPLETO", 25, 30)).toBe("PUBLICADA"));
  it("no toca borradores", () => expect(statusAfterCapacityChange("BORRADOR", 0, 25)).toBe("BORRADOR"));
  it("publicar", () => {
    expect(statusOnPublish(0, 25)).toBe("PUBLICADA");
    expect(statusOnPublish(25, 25)).toBe("CUPO_COMPLETO");
  });
});
