import { describe, expect, it } from "vitest";
import {
  amountPaid,
  balanceDue,
  needsSeat,
  nextStatuses,
  seatBlocker,
  statusAfterPayment,
  waNumber,
} from "./registration-admin-rules";

describe("nextStatuses / needsSeat", () => {
  it("no ofrece el estado actual", () => {
    for (const s of ["PENDIENTE", "SENADA", "CONFIRMADA", "LISTA_ESPERA", "CANCELADA"] as const) {
      expect(nextStatuses(s)).not.toContain(s);
    }
  });
  it("desde lista de espera se puede pasar a pendiente o cancelar", () => {
    expect(nextStatuses("LISTA_ESPERA")).toEqual(["PENDIENTE", "CANCELADA"]);
  });
  it("entrar al cupo desde afuera necesita lugar; moverse adentro no", () => {
    expect(needsSeat("LISTA_ESPERA", "PENDIENTE")).toBe(true);
    expect(needsSeat("CANCELADA", "PENDIENTE")).toBe(true);
    expect(needsSeat("PENDIENTE", "CONFIRMADA")).toBe(false);
    expect(needsSeat("CONFIRMADA", "CANCELADA")).toBe(false);
  });
});

describe("seatBlocker", () => {
  it("bloquea si el cupo total está lleno", () => {
    expect(seatBlocker({ taken: 25, capacity: 25 })).toBe("FULL");
  });
  it("bloquea si la opción está llena", () => {
    expect(seatBlocker({ taken: 10, capacity: 25, optionTaken: 4, optionCapacity: 4 })).toBe("OPTION_FULL");
  });
  it("deja pasar si hay lugar", () => {
    expect(seatBlocker({ taken: 24, capacity: 25, optionTaken: 3, optionCapacity: 4 })).toBeNull();
  });
});

describe("pagos", () => {
  const payments = [
    { amount: 300000, status: "APROBADO" },
    { amount: 100000, status: "RECHAZADO" },
    { amount: 200000, status: "APROBADO" },
    { amount: 50000, status: "REINTEGRADO" },
  ];
  it("suma solo los aprobados", () => {
    expect(amountPaid(payments)).toBe(500000);
  });
  it("saldo nunca negativo; sin precio → null", () => {
    expect(balanceDue(850000, 500000)).toBe(350000);
    expect(balanceDue(400000, 500000)).toBe(0);
    expect(balanceDue(null, 500000)).toBeNull();
  });
});

describe("statusAfterPayment", () => {
  it("pago parcial → señada; total → confirmada", () => {
    expect(statusAfterPayment("PENDIENTE", 850000, 300000)).toBe("SENADA");
    expect(statusAfterPayment("PENDIENTE", 850000, 850000)).toBe("CONFIRMADA");
    expect(statusAfterPayment("SENADA", 850000, 850000)).toBe("CONFIRMADA");
  });
  it("sin precio cargado, cualquier pago cuenta como seña", () => {
    expect(statusAfterPayment("PENDIENTE", null, 1000)).toBe("SENADA");
  });
  it("nunca baja el estado", () => {
    expect(statusAfterPayment("CONFIRMADA", 850000, 100)).toBe("CONFIRMADA");
  });
  it("no toca lista de espera ni canceladas", () => {
    expect(statusAfterPayment("LISTA_ESPERA", 850000, 850000)).toBe("LISTA_ESPERA");
    expect(statusAfterPayment("CANCELADA", 850000, 850000)).toBe("CANCELADA");
  });
});

describe("waNumber", () => {
  it("agrega 549 a celulares argentinos locales", () => {
    expect(waNumber("11 2345-6789")).toBe("5491123456789");
    expect(waNumber("011 2345 6789")).toBe("5491123456789");
  });
  it("respeta números con código de país", () => {
    expect(waNumber("+54 9 11 2345 6789")).toBe("5491123456789");
    expect(waNumber("+598 99 123 456")).toBe("59899123456");
  });
  it("vacío → null", () => {
    expect(waNumber("")).toBeNull();
    expect(waNumber(null)).toBeNull();
  });
});
