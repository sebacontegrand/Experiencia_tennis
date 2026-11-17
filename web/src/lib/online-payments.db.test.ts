import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "./db";
import { registerForExperience } from "./registrations";
import { recordPayment } from "./registration-admin";
import { applyMercadoPagoPayment } from "./online-payments";
import type { MercadoPagoPayment } from "./mercadopago";

const SLUG = "test-mercadopago";
const PRICE = 50000;

async function reset(capacity = 2) {
  await db.payment.deleteMany();
  await db.registration.deleteMany();
  await db.priceOption.deleteMany();
  await db.experience.deleteMany();
  await db.player.deleteMany();
  const format = await db.experienceFormat.upsert({
    where: { slug: "classic" },
    update: {},
    create: { slug: "classic", name: "Classic", tagline: "t", description: "d", benefits: [] },
  });
  return db.experience.create({
    data: {
      slug: SLUG,
      title: "Test MP",
      status: "PUBLICADA",
      startDate: new Date("2099-11-28T15:00:00Z"),
      endDate: new Date("2099-11-28T22:00:00Z"),
      destination: "Test",
      capacity,
      description: "d",
      formatId: format.id,
      priceOptions: { create: [{ label: "Inscripción", price: PRICE, sortOrder: 1 }] },
    },
    include: { priceOptions: true },
  });
}

async function signUp(i: number, optionId: string) {
  const r = await registerForExperience({
    experienceSlug: SLUG,
    player: { firstName: `P${i}`, lastName: "Test", email: `p${i}@test.local`, whatsapp: "1123456789", marketingConsent: false },
    priceOptionId: optionId,
  });
  if (!r.ok) throw new Error(r.reason);
  return r;
}

const mp = (over: Partial<MercadoPagoPayment>): MercadoPagoPayment => ({
  id: "1001",
  status: "approved",
  statusDetail: "accredited",
  amount: PRICE,
  currency: "ARS",
  externalReference: null,
  dateApproved: new Date(),
  ...over,
});

const regStatus = async (id: string) => (await db.registration.findUniqueOrThrow({ where: { id } })).status;

let optionId = "";
beforeEach(async () => {
  optionId = (await reset()).priceOptions[0].id;
});
afterAll(async () => {
  await db.$disconnect();
});

describe("pagos de Mercado Pago (Postgres real)", () => {
  it("la inscripción nace con link de pago", async () => {
    const r = await signUp(1, optionId);
    expect(r.payToken).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it("pendiente → aprobado confirma; la misma notificación repetida no duplica nada", async () => {
    const r = await signUp(1, optionId);
    const pending = await applyMercadoPagoPayment(mp({ externalReference: r.registrationId, status: "in_process", dateApproved: null }));
    expect(pending).toMatchObject({ ok: true, changed: true, paymentStatus: "PENDIENTE", statusChanged: false });
    expect(await regStatus(r.registrationId)).toBe("PENDIENTE");

    const approved = await applyMercadoPagoPayment(mp({ externalReference: r.registrationId }));
    expect(approved).toMatchObject({ ok: true, changed: true, newlyApproved: true, registrationStatus: "CONFIRMADA", attention: null });

    // Mercado Pago reintenta: misma operación, mismo estado.
    const again = await applyMercadoPagoPayment(mp({ externalReference: r.registrationId }));
    expect(again).toMatchObject({ ok: true, changed: false, newlyApproved: false });
    // Y en paralelo: el candado evita dos filas.
    await Promise.all([1, 2, 3].map(() => applyMercadoPagoPayment(mp({ externalReference: r.registrationId }))));

    expect(await db.payment.count({ where: { registrationId: r.registrationId } })).toBe(1);
    expect(await regStatus(r.registrationId)).toBe("CONFIRMADA");
  });

  it("pago del saldo después de una seña manual confirma", async () => {
    const r = await signUp(1, optionId);
    await recordPayment(r.registrationId, { amount: 20000, method: "TRANSFERENCIA", paidAt: new Date() });
    expect(await regStatus(r.registrationId)).toBe("SENADA");
    const res = await applyMercadoPagoPayment(mp({ externalReference: r.registrationId, amount: 30000 }));
    expect(res).toMatchObject({ ok: true, registrationStatus: "CONFIRMADA" });
  });

  it("rechazado no cambia el estado; devolución avisa sin bajar el estado", async () => {
    const r = await signUp(1, optionId);
    expect(await applyMercadoPagoPayment(mp({ id: "2001", externalReference: r.registrationId, status: "rejected" }))).toMatchObject({
      ok: true,
      paymentStatus: "RECHAZADO",
      statusChanged: false,
    });
    expect(await regStatus(r.registrationId)).toBe("PENDIENTE");

    await applyMercadoPagoPayment(mp({ id: "2002", externalReference: r.registrationId }));
    const refund = await applyMercadoPagoPayment(mp({ id: "2002", externalReference: r.registrationId, status: "refunded" }));
    expect(refund).toMatchObject({ ok: true, paymentStatus: "REINTEGRADO", attention: "REFUND" });
    expect(await regStatus(r.registrationId)).toBe("CONFIRMADA");
  });

  it("pago de alguien en lista de espera: se registra y se marca para revisar", async () => {
    await reset(1).then((e) => (optionId = e.priceOptions[0].id));
    await signUp(1, optionId);
    const waiting = await signUp(2, optionId);
    expect(waiting.status).toBe("LISTA_ESPERA");
    const res = await applyMercadoPagoPayment(mp({ id: "3001", externalReference: waiting.registrationId }));
    expect(res).toMatchObject({ ok: true, attention: "NO_SEAT", registrationStatus: "LISTA_ESPERA" });
  });

  it("rechaza referencia inexistente, otra moneda y operaciones ajenas", async () => {
    const r = await signUp(1, optionId);
    const other = await signUp(2, optionId);
    expect(await applyMercadoPagoPayment(mp({ externalReference: null }))).toEqual({ ok: false, reason: "NO_REFERENCE" });
    expect(await applyMercadoPagoPayment(mp({ externalReference: "no-existe" }))).toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(await applyMercadoPagoPayment(mp({ externalReference: r.registrationId, currency: "USD" }))).toEqual({ ok: false, reason: "CURRENCY" });
    await applyMercadoPagoPayment(mp({ id: "4001", externalReference: r.registrationId }));
    expect(await applyMercadoPagoPayment(mp({ id: "4001", externalReference: other.registrationId }))).toEqual({ ok: false, reason: "CONFLICT" });
  });
});
