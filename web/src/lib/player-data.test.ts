import { describe, expect, it } from "vitest";
import { buildPlayerUpdate, type PlayerFields } from "./player-data";

const base: PlayerFields = { firstName: "Ana", lastName: "Pérez", email: "ana@example.com", marketingConsent: true };
const now = new Date("2026-11-11T12:00:00Z");

describe("buildPlayerUpdate", () => {
  it("no pisa campos existentes con vacíos y no toca el email", () => {
    const data = buildPlayerUpdate({ ...base, city: undefined, club: "" , level: "Avanzado" }, true, now);
    expect(data).toEqual({ firstName: "Ana", lastName: "Pérez", level: "Avanzado" });
  });

  it("registra la fecha de consentimiento solo la primera vez", () => {
    expect(buildPlayerUpdate(base, false, now)).toMatchObject({ marketingConsent: true, marketingConsentAt: now });
    expect(buildPlayerUpdate(base, true, now)).not.toHaveProperty("marketingConsentAt");
  });

  it("nunca revoca el consentimiento desde un formulario público", () => {
    expect(buildPlayerUpdate({ ...base, marketingConsent: false }, true, now)).not.toHaveProperty("marketingConsent");
  });
});
