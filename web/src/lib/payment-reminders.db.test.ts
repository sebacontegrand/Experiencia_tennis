import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "./db";
import { registerForExperience } from "./registrations";
import { recordPayment } from "./registration-admin";
import { sendPaymentReminders } from "./payment-reminders";

const SLUG = "test-recordatorios";
const deadline = new Date("2099-12-01T23:59:59-03:00");

async function reset() {
  await db.payment.deleteMany();
  await db.testimonial.deleteMany();
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
      title: "Test cuotas",
      status: "PUBLICADA",
      startDate: new Date("2099-12-11T15:00:00Z"),
      endDate: new Date("2099-12-13T15:00:00Z"),
      destination: "Test",
      capacity: 2,
      description: "d",
      formatId: format.id,
      installments: 3,
      paymentDeadline: deadline,
      priceOptions: { create: [{ label: "Doble", price: 600000, sortOrder: 1 }] },
    },
    include: { priceOptions: true },
  });
}

const signUp = async (i: number, optionId: string) => {
  const r = await registerForExperience({
    experienceSlug: SLUG,
    player: { firstName: `R${i}`, lastName: "Test", email: `r${i}@test.local`, whatsapp: "1123456789", marketingConsent: false },
    priceOptionId: optionId,
  });
  if (!r.ok) throw new Error(r.reason);
  return r;
};

let optionId = "";
beforeEach(async () => {
  optionId = (await reset()).priceOptions[0].id;
});
afterAll(async () => {
  await db.$disconnect();
});

describe("recordatorios de pago (Postgres real)", () => {
  it("solo a quien debe, dentro de los 7 días previos, una sola vez", async () => {
    const owes = await signUp(1, optionId);
    const paid = await signUp(2, optionId);
    await recordPayment(paid.registrationId, { amount: 600000, method: "TRANSFERENCIA", paidAt: new Date() });
    await signUp(3, optionId); // lista de espera (cupo 2): no recibe
    const sentTo: string[] = [];
    const fake = async ({ to }: { to: string | string[] }) => void sentTo.push(String(to));

    // Fuera de la ventana: nada.
    expect(await sendPaymentReminders(new Date("2099-11-20T12:00:00-03:00"), fake as never)).toEqual({ sent: 0 });
    // Dentro: solo a quien debe.
    expect(await sendPaymentReminders(new Date("2099-11-26T12:00:00-03:00"), fake as never)).toEqual({ sent: 1 });
    expect(sentTo).toEqual(["r1@test.local"]);
    // Al día siguiente no se repite.
    expect(await sendPaymentReminders(new Date("2099-11-27T12:00:00-03:00"), fake as never)).toEqual({ sent: 0 });
    expect((await db.registration.findUniqueOrThrow({ where: { id: owes.registrationId } })).paymentReminderSentAt).not.toBeNull();
  });
});
