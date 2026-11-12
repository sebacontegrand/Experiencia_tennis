import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "./db";
import { registerForExperience } from "./registrations";
import type { PlayerFields } from "./player-data";

const SLUG = "test-cupo";
const player = (i: number): PlayerFields => ({
  firstName: `Jugador${i}`,
  lastName: "Test",
  email: `jugador${i}@test.local`,
  whatsapp: "1123456789",
  marketingConsent: true,
});

async function reset({ capacity = 25, optionCapacity = null as number | null } = {}) {
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
      menuOptions: ["Clásico", "Vegetariano"],
      formatId: format.id,
      priceOptions: {
        create: [
          { label: "Doble", price: null, sortOrder: 1, capacity: optionCapacity },
          { label: "Single", price: 100000, sortOrder: 2 },
        ],
      },
    },
    include: { priceOptions: { orderBy: { sortOrder: "asc" } } },
  });
}

beforeEach(async () => {
  await reset();
});
afterAll(async () => {
  await db.$disconnect();
});

describe("registerForExperience (Postgres real)", () => {
  it("30 inscripciones simultáneas con cupo 25 → exactamente 25 con lugar y 5 en lista de espera", async () => {
    const exp = await reset({ capacity: 25 });
    const results = await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        registerForExperience({ experienceSlug: SLUG, player: player(i), priceOptionId: exp.priceOptions[1].id }),
      ),
    );
    const statuses = results.map((r) => (r.ok ? r.status : r.reason));
    expect(statuses.filter((s) => s === "PENDIENTE")).toHaveLength(25);
    expect(statuses.filter((s) => s === "LISTA_ESPERA")).toHaveLength(5);
    expect(results.filter((r) => r.ok && r.filledCapacity)).toHaveLength(1);

    const after = await db.experience.findUniqueOrThrow({ where: { slug: SLUG } });
    expect(after.status).toBe("CUPO_COMPLETO");
    expect(await db.player.count()).toBe(30); // todas las personas entran a la comunidad
  });

  it("respeta el cupo propio de una opción de precio, también en simultáneo", async () => {
    const exp = await reset({ capacity: 25, optionCapacity: 2 });
    const results = await Promise.all(
      Array.from({ length: 6 }, (_, i) =>
        registerForExperience({ experienceSlug: SLUG, player: player(i), priceOptionId: exp.priceOptions[0].id }),
      ),
    );
    const statuses = results.map((r) => (r.ok ? r.status : r.reason));
    expect(statuses.filter((s) => s === "PENDIENTE")).toHaveLength(2);
    expect(statuses.filter((s) => s === "LISTA_ESPERA")).toHaveLength(4);
    // La otra opción sigue disponible
    const other = await registerForExperience({
      experienceSlug: SLUG,
      player: player(99),
      priceOptionId: exp.priceOptions[1].id,
    });
    expect(other.ok && other.status).toBe("PENDIENTE");
  });

  it("el mismo email no se inscribe dos veces (ni en simultáneo)", async () => {
    const exp = await reset();
    const results = await Promise.all(
      [1, 2, 3].map(() =>
        registerForExperience({ experienceSlug: SLUG, player: player(1), priceOptionId: exp.priceOptions[1].id }),
      ),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok && r.reason === "DUPLICATE")).toHaveLength(2);
    expect(await db.registration.count()).toBe(1);
  });

  it("una inscripción cancelada libera el lugar y la persona puede volver a inscribirse", async () => {
    const exp = await reset({ capacity: 1 });
    const first = await registerForExperience({ experienceSlug: SLUG, player: player(1), priceOptionId: exp.priceOptions[1].id });
    const second = await registerForExperience({ experienceSlug: SLUG, player: player(2), priceOptionId: exp.priceOptions[1].id });
    expect(first.ok && first.status).toBe("PENDIENTE");
    expect(second.ok && second.status).toBe("LISTA_ESPERA");

    if (first.ok) await db.registration.update({ where: { id: first.registrationId }, data: { status: "CANCELADA" } });
    await db.experience.update({ where: { slug: SLUG }, data: { status: "PUBLICADA" } });

    const third = await registerForExperience({ experienceSlug: SLUG, player: player(3), priceOptionId: exp.priceOptions[1].id });
    expect(third.ok && third.status).toBe("PENDIENTE");
    const again = await registerForExperience({ experienceSlug: SLUG, player: player(1), priceOptionId: exp.priceOptions[1].id });
    expect(again.ok && again.status).toBe("LISTA_ESPERA"); // reutiliza su fila cancelada
  });

  it("valida opción y menú, y no acepta borradores", async () => {
    const exp = await reset();
    expect(await registerForExperience({ experienceSlug: SLUG, player: player(1) })).toMatchObject({
      ok: false,
      reason: "INVALID_OPTION",
    });
    expect(
      await registerForExperience({
        experienceSlug: SLUG,
        player: player(1),
        priceOptionId: exp.priceOptions[1].id,
        menuChoice: "Pizza",
      }),
    ).toMatchObject({ ok: false, reason: "INVALID_MENU" });
    await db.experience.update({ where: { slug: SLUG }, data: { status: "BORRADOR" } });
    expect(
      await registerForExperience({ experienceSlug: SLUG, player: player(1), priceOptionId: exp.priceOptions[1].id }),
    ).toMatchObject({ ok: false, reason: "NOT_OPEN" });
    expect(await registerForExperience({ experienceSlug: "no-existe", player: player(1) })).toMatchObject({
      ok: false,
      reason: "NOT_FOUND",
    });
  });
});
