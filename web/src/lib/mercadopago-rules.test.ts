import { describe, expect, it } from "vitest";
import { installmentPlan, isPayToken, isPublicHttpsUrl, mapMercadoPagoStatus, payableAmount, reminderDue, toPesos } from "./mercadopago-rules";

describe("mapMercadoPagoStatus", () => {
  it("solo approved cuenta como aprobado", () => {
    expect(mapMercadoPagoStatus("approved")).toBe("APROBADO");
    for (const s of ["pending", "in_process", "authorized", "in_mediation", undefined, "algo-nuevo"]) {
      expect(mapMercadoPagoStatus(s)).toBe("PENDIENTE");
    }
  });
  it("rechazos y devoluciones", () => {
    expect(mapMercadoPagoStatus("rejected")).toBe("RECHAZADO");
    expect(mapMercadoPagoStatus("cancelled")).toBe("RECHAZADO");
    expect(mapMercadoPagoStatus("refunded")).toBe("REINTEGRADO");
    expect(mapMercadoPagoStatus("charged_back")).toBe("REINTEGRADO");
  });
});

describe("payableAmount", () => {
  const approved = (amount: number) => ({ amount, status: "APROBADO" });
  it("cobra el total si no pagó nada", () => {
    expect(payableAmount("PENDIENTE", 614000, [])).toEqual({ ok: true, amount: 614000 });
  });
  it("cobra el saldo después de una seña (los rechazados no cuentan)", () => {
    expect(payableAmount("SENADA", 614000, [approved(100000), { amount: 514000, status: "RECHAZADO" }])).toEqual({ ok: true, amount: 514000 });
  });
  it("no cobra si ya pagó todo, sin precio o sin lugar", () => {
    expect(payableAmount("CONFIRMADA", 50000, [approved(50000)])).toEqual({ ok: false, reason: "PAID" });
    expect(payableAmount("PENDIENTE", null, [])).toEqual({ ok: false, reason: "NO_PRICE" });
    expect(payableAmount("LISTA_ESPERA", 50000, [])).toEqual({ ok: false, reason: "NO_SEAT" });
    expect(payableAmount("CANCELADA", 50000, [])).toEqual({ ok: false, reason: "NO_SEAT" });
  });
});

describe("helpers", () => {
  it("toPesos redondea", () => {
    expect(toPesos(50000)).toBe(50000);
    expect(toPesos(49999.6)).toBe(50000);
    expect(toPesos(undefined)).toBe(0);
  });
  it("isPublicHttpsUrl", () => {
    expect(isPublicHttpsUrl("https://experiencia-tenis.vercel.app/api/x")).toBe(true);
    expect(isPublicHttpsUrl("http://localhost:3000/x")).toBe(false);
    expect(isPublicHttpsUrl("https://localhost/x")).toBe(false);
    expect(isPublicHttpsUrl("nada")).toBe(false);
  });
  it("isPayToken", () => {
    expect(isPayToken("a".repeat(32))).toBe(true);
    expect(isPayToken("a".repeat(31))).toBe(false);
    expect(isPayToken("../" + "a".repeat(29))).toBe(false);
  });
});

describe("installmentPlan", () => {
  const deadline = new Date("2026-12-01T23:59:59-03:00");
  const before = new Date("2026-11-20T12:00:00-03:00");
  const after = new Date("2026-12-02T12:00:00-03:00");
  it("3 cuotas iguales: primera, segunda y la última es el saldo", () => {
    expect(installmentPlan({ price: 600000, paid: 0, installments: 3, deadline, now: before })).toMatchObject({ balance: 600000, installment: 200000, next: 1, total: 3 });
    expect(installmentPlan({ price: 600000, paid: 200000, installments: 3, deadline, now: before })).toMatchObject({ installment: 200000, next: 2 });
    // Falta exactamente una cuota: se paga el saldo.
    expect(installmentPlan({ price: 600000, paid: 400000, installments: 3, deadline, now: before })).toMatchObject({ balance: 200000, installment: null, next: 3 });
  });
  it("redondea la cuota hacia arriba y nunca cobra de más", () => {
    const p = installmentPlan({ price: 614000, paid: 0, installments: 3, deadline, now: before });
    expect(p.installment).toBe(204667);
    expect(installmentPlan({ price: 614000, paid: 409334, installments: 3, deadline, now: before })).toMatchObject({ balance: 204666, installment: null });
  });
  it("sin cuotas, sin fecha límite o vencida: solo el total", () => {
    expect(installmentPlan({ price: 50000, paid: 0, installments: null, deadline, now: before }).installment).toBeNull();
    expect(installmentPlan({ price: 50000, paid: 0, installments: 1, deadline, now: before }).installment).toBeNull();
    expect(installmentPlan({ price: 600000, paid: 0, installments: 3, deadline: null, now: before }).installment).toBeNull();
    expect(installmentPlan({ price: 600000, paid: 200000, installments: 3, deadline, now: after })).toMatchObject({ balance: 400000, installment: null });
  });
  it("con una seña manual distinta a la cuota sigue contando bien", () => {
    expect(installmentPlan({ price: 600000, paid: 100000, installments: 3, deadline, now: before })).toMatchObject({ balance: 500000, installment: 200000, next: 1 });
  });
});

describe("reminderDue", () => {
  const deadline = new Date("2026-12-01T23:59:59-03:00");
  it("desde 7 días antes hasta la fecha límite", () => {
    expect(reminderDue(deadline, new Date("2026-11-20T12:00:00-03:00"))).toBe(false);
    expect(reminderDue(deadline, new Date("2026-11-25T12:00:00-03:00"))).toBe(true);
    expect(reminderDue(deadline, new Date("2026-12-01T20:00:00-03:00"))).toBe(true);
    expect(reminderDue(deadline, new Date("2026-12-02T08:00:00-03:00"))).toBe(false);
    expect(reminderDue(null)).toBe(false);
  });
});
