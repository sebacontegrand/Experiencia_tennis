import { describe, expect, it } from "vitest";
import { distinctOptions, hasActiveFilters, parsePlayerFilters, playerFiltersQuery, playerWhere } from "./player-filters";

describe("parsePlayerFilters / playerFiltersQuery", () => {
  it("lee la URL e ignora valores raros", () => {
    const f = parsePlayerFilters({ q: "  ana ", ciudad: "Pilar", club: ["a", "b"], consentimiento: "1" });
    expect(f).toEqual({ q: "ana", city: "Pilar", club: "", level: "", consent: true });
    expect(hasActiveFilters(f)).toBe(true);
    expect(hasActiveFilters(parsePlayerFilters({}))).toBe(false);
  });
  it("arma la query sin vacíos y permite quitar un filtro", () => {
    const f = parsePlayerFilters({ q: "ana", ciudad: "Pilar", consentimiento: "1" });
    expect(playerFiltersQuery(f)).toBe("q=ana&ciudad=Pilar&consentimiento=1");
    expect(playerFiltersQuery(f, { city: null })).toBe("q=ana&consentimiento=1");
    expect(playerFiltersQuery(f, { consent: false, q: null })).toBe("ciudad=Pilar");
  });
});

describe("playerWhere", () => {
  it("sin filtros no filtra", () => {
    expect(playerWhere(parsePlayerFilters({}))).toEqual({});
  });
  it("el export siempre exige consentimiento", () => {
    expect(playerWhere(parsePlayerFilters({}), { onlyConsent: true })).toEqual({ AND: [{ marketingConsent: true }] });
  });
  it("busca por teléfono solo con 3 dígitos o más, y por nombre + apellido", () => {
    const short = JSON.stringify(playerWhere(parsePlayerFilters({ q: "11" })));
    expect(short).not.toContain("whatsapp");
    const phone = JSON.stringify(playerWhere(parsePlayerFilters({ q: "11 5736" })));
    expect(phone).toContain('"whatsapp":{"contains":"115736"}');
    const full = JSON.stringify(playerWhere(parsePlayerFilters({ q: "Ana García" })));
    expect(full).toContain('"lastName":{"contains":"García"');
  });
});

describe("distinctOptions", () => {
  it("unifica mayúsculas y espacios, saca vacíos y ordena", () => {
    expect(distinctOptions(["Pilar", "pilar ", null, "", "  Nordelta", "PILAR", "Ávila"])).toEqual(["Ávila", "Nordelta", "Pilar"]);
  });
});
