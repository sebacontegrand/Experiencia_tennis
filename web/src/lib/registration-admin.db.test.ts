import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "./db";
import { registerForExperience } from "./registrations";
import { changeRegistrationStatus, recordPayment, waitlistSuggestion } from "./registration-admin";

const SLUG = "test-admin-cupo";
const player = (i: number) => ({
  firstName: `Persona${i}`,
  lastName: "Test",
  email: `persona${i}@test.local`,
  whatsapp: "1123456789",
  marketingConsent: false,
});

async function reset(capacity: number) {
  await db.payment.deleteMany();
  await db.registration.deleteMany();
  await db.priceOption.deleteMany();
  await db.experience.deleteMany();
  await db.player.deleteMany();
  const format = await db.experienceFormat.upsert({
    where: { slug: "black" },
    update: {},
    create: { slug: "black", name: "Black", tagline: "t", description: "d", benefits: [] },
  });
  return db.experience.create({
    data: {
      slug: SLUG,
      title: "Test",
      status: "PUBLICADA",
      startDate: new Date("2099-12-11T15:00:00Z"),
      endDate: new Date("2099-12-13T15:00:00Z"),
      destination: "Test",
      capacity,
      description: "d",
      formatId: format.id,
      priceOptions: { create: [{ label: "Doble", price: 800000, sortOrder: 1 }] },
    },
    include: { priceOptions: true },
  });
}

async function signUp(i: number, optionId: string) {
  const r = await registerForExperience({ experienceSlug: SLUG, player: player(i), priceOptionId: optionId });
  if (!r.ok) throw new Error(r.reason);
  return r;
}

const expStatus = async () => (await db.experience.findUniqueOrThrow({ where: { slug: SLUG } })).status;

let optionId = "";
beforeEach(async () => {
  optionId = (await reset(2)).priceOptions[0].id;
});
afterAll(async () => {
  await db.$disconnect();
});

describe("gestión de inscripciones (Postgres real)", () => {
  it("cancelar libera el lugar, reabre la experiencia y sugiere a la primera de la lista de espera", async () => {
    const a = await signUp(1, optionId);
    await signUp(2, optionId);
    const waiting = await signUp(3, optionId);
    expect(waiting.status).toBe("LISTA_ESPERA");
    expect(await expStatus()).toBe("CUPO_COMPLETO");

    // Con el cupo lleno no se le puede dar lugar desde el panel
    expect(await changeRegistrationStatus(waiting.registrationId, "PENDIENTE")).toMatchObject({ ok: false, reason: "FULL" });

    const cancel = await changeRegistrationStatus(a.registrationId, "CANCELADA");
    expect(cancel).toMatchObject({ ok: true, experienceStatus: "PUBLICADA" });
    expect(await waitlistSuggestion((await db.experience.findUniqueOrThrow({ where: { slug: SLUG } })).id, 2)).toMatchObject({
      free: 1,
      first: { id: waiting.registrationId },
    });

    // Ahora sí: pasa a pendiente y la experiencia vuelve a cupo completo
    const promote = await changeRegistrationStatus(waiting.registrationId, "PENDIENTE");
    expect(promote).toMatchObject({ ok: true, status: "PENDIENTE", experienceStatus: "CUPO_COMPLETO" });
  });

  it("dos personas de lista de espera compitiendo por un lugar: entra solo una", async () => {
    const a = await signUp(1, optionId);
    await signUp(2, optionId);
    const w1 = await signUp(3, optionId);
    const w2 = await signUp(4, optionId);
    await changeRegistrationStatus(a.registrationId, "CANCELADA");

    const results = await Promise.all([
      changeRegistrationStatus(w1.registrationId, "PENDIENTE"),
      changeRegistrationStatus(w2.registrationId, "PENDIENTE"),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok && r.reason === "FULL")).toHaveLength(1);
    expect(await db.registration.count({ where: { status: { in: ["PENDIENTE", "SENADA", "CONFIRMADA"] } } })).toBe(2);
  });

  it("no permite cambios fuera del circuito (confirmada → lista de espera)", async () => {
    const a = await signUp(1, optionId);
    await db.registration.update({ where: { id: a.registrationId }, data: { status: "CONFIRMADA" } });
    expect(await changeRegistrationStatus(a.registrationId, "LISTA_ESPERA")).toMatchObject({ ok: false, reason: "NOT_ALLOWED" });
  });

  it("pagos: parcial → señada, el resto → confirmada", async () => {
    const a = await signUp(1, optionId);
    const paidAt = new Date();
    const first = await recordPayment(a.registrationId, { amount: 300000, method: "TRANSFERENCIA", paidAt });
    expect(first).toMatchObject({ ok: true, status: "SENADA", statusChanged: true, paid: 300000 });
    const second = await recordPayment(a.registrationId, { amount: 500000, method: "EFECTIVO", paidAt });
    expect(second).toMatchObject({ ok: true, status: "CONFIRMADA", statusChanged: true, paid: 800000 });
    expect(await db.payment.count({ where: { registrationId: a.registrationId, status: "APROBADO" } })).toBe(2);
  });
});
