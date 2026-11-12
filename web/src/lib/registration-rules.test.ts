import { describe, expect, it } from "vitest";
import { decideStatus, fillsCapacity, registrationClosedReason, seatsLeft } from "./registration-rules";

describe("decideStatus", () => {
  it("con lugar → PENDIENTE", () => expect(decideStatus({ taken: 24, capacity: 25 })).toBe("PENDIENTE"));
  it("cupo completo → LISTA_ESPERA", () => expect(decideStatus({ taken: 25, capacity: 25 })).toBe("LISTA_ESPERA"));
  it("opción con cupo propio completo → LISTA_ESPERA aunque quede lugar general", () =>
    expect(decideStatus({ taken: 3, capacity: 25, optionTaken: 2, optionCapacity: 2 })).toBe("LISTA_ESPERA"));
  it("opción sin cupo propio no limita", () =>
    expect(decideStatus({ taken: 3, capacity: 25, optionTaken: 99, optionCapacity: null })).toBe("PENDIENTE"));
});

describe("fillsCapacity / seatsLeft", () => {
  it("la inscripción 25 de 25 completa el cupo", () => {
    expect(fillsCapacity(24, 25)).toBe(true);
    expect(fillsCapacity(23, 25)).toBe(false);
  });
  it("nunca negativo", () => expect(seatsLeft(30, 25)).toBe(0));
});

describe("registrationClosedReason", () => {
  const now = new Date("2026-11-20T12:00:00Z");
  const base = { status: "PUBLICADA", startDate: new Date("2026-12-11T15:00:00Z"), registrationDeadline: null };
  it("publicada y a futuro → abierta", () => expect(registrationClosedReason(base, now)).toBeNull());
  it("con cupo completo sigue abierta (lista de espera)", () =>
    expect(registrationClosedReason({ ...base, status: "CUPO_COMPLETO" }, now)).toBeNull());
  it("borrador, finalizada o cancelada → cerrada", () => {
    for (const status of ["BORRADOR", "FINALIZADA", "CANCELADA"])
      expect(registrationClosedReason({ ...base, status }, now)).toBe("NOT_OPEN");
  });
  it("vencida la fecha límite", () =>
    expect(registrationClosedReason({ ...base, registrationDeadline: new Date("2026-11-19T00:00:00Z") }, now)).toBe(
      "DEADLINE_PASSED",
    ));
  it("ya empezó", () =>
    expect(registrationClosedReason({ ...base, startDate: new Date("2026-11-20T10:00:00Z") }, now)).toBe(
      "ALREADY_STARTED",
    ));
});
