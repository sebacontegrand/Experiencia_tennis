import { describe, expect, it } from "vitest";
import { experienceOverview, sumOverviews, type OverviewInput } from "./overview";

const now = new Date("2026-11-12T12:00:00-03:00");
const base: OverviewInput = {
  capacity: 4,
  startDate: new Date("2026-12-11T12:00:00-03:00"),
  registrationDeadline: new Date("2026-11-15T23:59:59-03:00"),
  status: "PUBLICADA",
  priceOptions: [
    { id: "a", price: 800_000, cost: 400_000 },
    { id: "b", price: null, cost: null },
  ],
  costItems: [{ amount: 400_000, kind: "TOTAL" }],
  registrations: [
    { status: "CONFIRMADA", priceOptionId: "a", payments: [{ amount: 800_000, status: "APROBADO" }] },
    { status: "SENADA", priceOptionId: "a", payments: [{ amount: 300_000, status: "APROBADO" }] },
    { status: "PENDIENTE", priceOptionId: "a", payments: [] },
    { status: "LISTA_ESPERA", priceOptionId: "a", payments: [] },
    { status: "CANCELADA", priceOptionId: "a", payments: [{ amount: 100_000, status: "APROBADO" }] },
  ],
};

describe("experienceOverview", () => {
  const o = experienceOverview(base, now);

  it("cupos y estados", () => {
    expect(o).toMatchObject({ taken: 3, left: 1, fillPercent: 75, waitlist: 1, pending: 1, deposited: 1, confirmed: 1 });
  });
  it("plata: ingresos, cobrado (incluye canceladas) y saldo a cobrar", () => {
    expect(o.revenue).toBe(2_400_000);
    expect(o.collected).toBe(1_200_000);
    expect(o.toCollect).toBe(500_000 + 800_000);
  });
  it("costos y ganancia con las inscripciones actuales", () => {
    expect(o.costs).toBe(400_000 + 3 * 400_000);
    expect(o.earnings).toBe(2_400_000 - 1_600_000);
    expect(o.marginPercent).toBe(33);
  });
  it("alertas: sin precio, lista de espera con lugar, fecha límite cerca, impagos", () => {
    expect(o.alerts.map((a) => a.kind)).toEqual(["missingPrices", "waitlistWithSeats", "deadlineSoon", "unpaid"]);
    expect(o.alerts.find((a) => a.kind === "deadlineSoon")?.count).toBe(4);
  });
  it("sin costos cargados no inventa ganancia", () => {
    const noCosts = experienceOverview(
      { ...base, costItems: [], priceOptions: base.priceOptions.map((p) => ({ ...p, cost: null })) },
      now,
    );
    expect(noCosts.earnings).toBeNull();
    expect(noCosts.marginPercent).toBeNull();
  });
  it("avisa si pierde plata", () => {
    const losing = experienceOverview({ ...base, costItems: [{ amount: 5_000_000, kind: "TOTAL" }] }, now);
    expect(losing.alerts.some((a) => a.kind === "losing")).toBe(true);
  });
  it("las pasadas no generan alertas", () => {
    const past = experienceOverview({ ...base, startDate: new Date("2026-01-01") }, now);
    expect(past.upcoming).toBe(false);
    expect(past.alerts).toEqual([]);
  });
});

describe("sumOverviews", () => {
  it("suma y deja ganancia en null si ninguna tiene costos", () => {
    const a = experienceOverview(base, now);
    const b = experienceOverview({ ...base, costItems: [], priceOptions: [{ id: "a", price: 100, cost: null }] }, now);
    const t = sumOverviews([a, b]);
    expect(t.taken).toBe(6);
    expect(t.earnings).toBe(a.earnings);
    expect(sumOverviews([b]).earnings).toBeNull();
  });
});
