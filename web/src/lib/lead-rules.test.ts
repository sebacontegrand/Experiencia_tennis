import { describe, expect, it } from "vitest";
import { leadFiltersQuery, leadNextStatuses, parseLeadFilters } from "./lead-rules";

describe("lead rules", () => {
  it("se puede mover a cualquier otro estado", () => {
    expect(leadNextStatuses("NUEVO")).toEqual(["CONTACTADO", "EN_CONVERSACION", "CERRADO"]);
    expect(leadNextStatuses("CERRADO")).not.toContain("CERRADO");
  });
  it("lee filtros válidos e ignora el resto", () => {
    expect(parseLeadFilters({ estado: "NUEVO", tipo: "HOTEL" })).toEqual({ estado: "NUEVO", tipo: "HOTEL" });
    expect(parseLeadFilters({ estado: "x", tipo: ["HOTEL"] })).toEqual({ estado: null, tipo: null });
  });
  it("arma la query", () => {
    expect(leadFiltersQuery({ estado: "NUEVO", tipo: null })).toBe("?estado=NUEVO");
    expect(leadFiltersQuery({ estado: null, tipo: null })).toBe("");
  });
});
