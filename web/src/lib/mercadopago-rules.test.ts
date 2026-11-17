import { describe, expect, it } from "vitest";
import { isPayToken, isPublicHttpsUrl, mapMercadoPagoStatus, payableAmount, toPesos } from "./mercadopago-rules";

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
