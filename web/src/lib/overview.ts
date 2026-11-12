/** Números de control por experiencia para el tablero del panel (puro, testeable). */
import { projectedResult, type CostItemLike } from "@/lib/pricing";
import { amountPaid, balanceDue, holdsSeat } from "@/lib/registration-admin-rules";

export type OverviewInput = {
  capacity: number;
  startDate: Date;
  registrationDeadline: Date | null;
  status: string;
  priceOptions: { id: string; price: number | null; cost: number | null }[];
  costItems: CostItemLike[];
  registrations: { status: string; priceOptionId: string | null; payments: { amount: number; status: string }[] }[];
};

export type Alert = { kind: "missingPrices" | "waitlistWithSeats" | "deadlineSoon" | "unpaid" | "losing"; count?: number };

const DAY = 86_400_000;

export function experienceOverview(e: OverviewInput, now = new Date()) {
  const optionById = new Map(e.priceOptions.map((o) => [o.id, o]));
  const seat = e.registrations.filter((r) => holdsSeat(r.status));
  const count = (s: string) => e.registrations.filter((r) => r.status === s).length;

  const priced = seat.map((r) => {
    const o = r.priceOptionId ? optionById.get(r.priceOptionId) : undefined;
    return { price: o?.price ?? null, optionCost: o?.cost ?? null, paid: amountPaid(r.payments) };
  });
  const result = projectedResult({ items: e.costItems, registrations: priced });
  // Lo cobrado incluye pagos de inscripciones canceladas: es plata que entró (los reintegros se registran aparte).
  const collected = e.registrations.reduce((s, r) => s + amountPaid(r.payments), 0);
  const toCollect = priced.reduce((s, r) => s + (balanceDue(r.price, r.paid) ?? 0), 0);
  const hasCosts = e.costItems.length > 0 || e.priceOptions.some((o) => o.cost != null);

  const taken = seat.length;
  const waitlist = count("LISTA_ESPERA");
  const daysToStart = Math.ceil((e.startDate.getTime() - now.getTime()) / DAY);
  const daysToDeadline = e.registrationDeadline ? Math.ceil((e.registrationDeadline.getTime() - now.getTime()) / DAY) : null;
  const upcoming = e.startDate > now && e.status !== "CANCELADA" && e.status !== "FINALIZADA";
  const missingPrices = e.priceOptions.filter((o) => o.price == null).length;

  const alerts: Alert[] = [];
  if (upcoming) {
    if (missingPrices > 0) alerts.push({ kind: "missingPrices", count: missingPrices });
    if (waitlist > 0 && taken < e.capacity) alerts.push({ kind: "waitlistWithSeats", count: e.capacity - taken });
    if (daysToDeadline != null && daysToDeadline >= 0 && daysToDeadline <= 7) alerts.push({ kind: "deadlineSoon", count: daysToDeadline });
    const unpaid = count("PENDIENTE");
    if (unpaid > 0) alerts.push({ kind: "unpaid", count: unpaid });
    if (hasCosts && taken > 0 && result.earnings < 0) alerts.push({ kind: "losing" });
  }

  return {
    taken,
    capacity: e.capacity,
    left: Math.max(0, e.capacity - taken),
    fillPercent: e.capacity > 0 ? Math.min(100, Math.round((taken / e.capacity) * 100)) : 0,
    waitlist,
    pending: count("PENDIENTE"),
    deposited: count("SENADA"),
    confirmed: count("CONFIRMADA"),
    revenue: result.revenue,
    collected,
    toCollect,
    costs: hasCosts ? Math.round(result.costs) : null,
    earnings: hasCosts ? Math.round(result.earnings) : null,
    marginPercent: hasCosts && result.revenue > 0 ? Math.round((result.earnings / result.revenue) * 100) : null,
    daysToStart,
    upcoming,
    alerts,
  };
}

export type Overview = ReturnType<typeof experienceOverview>;

/** Totales de varias experiencias (las ganancias solo suman las que tienen costos cargados). */
export function sumOverviews(list: Overview[]) {
  return list.reduce(
    (t, o) => ({
      taken: t.taken + o.taken,
      capacity: t.capacity + o.capacity,
      waitlist: t.waitlist + o.waitlist,
      revenue: t.revenue + o.revenue,
      collected: t.collected + o.collected,
      toCollect: t.toCollect + o.toCollect,
      earnings: o.earnings == null ? t.earnings : (t.earnings ?? 0) + o.earnings,
    }),
    { taken: 0, capacity: 0, waitlist: 0, revenue: 0, collected: 0, toCollect: 0, earnings: null as number | null },
  );
}
