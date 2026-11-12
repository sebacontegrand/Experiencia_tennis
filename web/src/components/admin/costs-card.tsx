import { adminCopy } from "@/content/admin";
import { formatPrice } from "@/lib/format";
import { earningsFor, projectedResult, sharedCostPerPerson, suggestedPrice, type CostItemLike } from "@/lib/pricing";
import { ActionForm, AdminField } from "@/components/admin/action-form";
import { adminInputClass } from "@/components/admin/styles";
import { CollapsibleCard } from "@/components/admin/collapsible-card";
import { cn } from "@/lib/utils";
import {
  addCostItem,
  applySuggestedPrice,
  deleteCostItem,
  saveCostItem,
  saveOptionCost,
  saveProfitSettings,
} from "@/app/admin/(panel)/experiencias/costs-actions";

const c = adminCopy.costs;
const amountInput = (n: number | null | undefined) => (n == null ? "" : new Intl.NumberFormat("es-AR").format(n));

export type CostsCardData = {
  id: string;
  capacity: number;
  earningsPercent: number | null;
  expectedAttendance: number | null;
  costItems: (CostItemLike & { id: string; label: string })[];
  priceOptions: { id: string; label: string; price: number | null; cost: number | null }[];
  /** Una entrada por inscripción con lugar. */
  seatRegistrations: { price: number | null; optionCost: number | null }[];
  collected: number;
};

/** Costos, % de ganancia, precio sugerido por opción y resultado con las inscripciones actuales. */
export function CostsCard({ data: e }: { data: CostsCardData }) {
  const attendance = e.expectedAttendance ?? e.capacity;
  const shared = sharedCostPerPerson(e.costItems, attendance);
  const result = projectedResult({ items: e.costItems, registrations: e.seatRegistrations });

  return (
    <CollapsibleCard
      title={c.title}
      summary={
        e.costItems.length === 0 && e.earningsPercent == null
          ? c.summaryEmpty
          : c.summary(e.earningsPercent, formatPrice(Math.round(result.earnings)), result.people)
      }
    >
      <p className="text-sm text-ink-muted">{c.hint}</p>

      {/* % y asistencia */}
      <ActionForm action={saveProfitSettings.bind(null, e.id)} submitLabel={adminCopy.edit.save} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label={c.percent} hint={c.percentHint} htmlFor="earningsPercent">
            <div className="relative">
              <input
                id="earningsPercent"
                name="earningsPercent"
                inputMode="numeric"
                defaultValue={e.earningsPercent ?? ""}
                className={`${adminInputClass} pr-9`}
              />
              <span aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-muted">
                %
              </span>
            </div>
          </AdminField>
          <AdminField label={c.attendance} hint={c.attendanceHint(e.capacity)} htmlFor="expectedAttendance">
            <input
              id="expectedAttendance"
              name="expectedAttendance"
              inputMode="numeric"
              defaultValue={e.expectedAttendance ?? ""}
              placeholder={String(e.capacity)}
              className={adminInputClass}
            />
          </AdminField>
        </div>
      </ActionForm>

      {/* Costos del grupo */}
      <h3 className="mt-10 text-lg font-semibold text-navy-900">{c.itemsTitle}</h3>
      <p className="mt-1 text-sm text-ink-muted">{c.itemsHint}</p>
      {e.costItems.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">{c.noItems}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {e.costItems.map((item) => (
            <li key={item.id} className="rounded-sm border border-border p-4">
              <ActionForm action={saveCostItem.bind(null, e.id, item.id)} submitLabel={adminCopy.edit.save}>
                <CostItemFields id={item.id} item={item} />
              </ActionForm>
              <ActionForm
                action={deleteCostItem.bind(null, e.id, item.id)}
                submitLabel={c.deleteItem}
                pendingLabel="Eliminando…"
                variant="danger"
                confirm={c.deleteItemConfirm(item.label)}
                className="mt-3"
              />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 rounded-sm border border-dashed border-input p-4">
        <h4 className="text-sm font-semibold text-navy-900">{c.addItemTitle}</h4>
        <ActionForm action={addCostItem.bind(null, e.id)} submitLabel={c.addItem} pendingLabel="Agregando…" className="mt-3">
          <CostItemFields id="new" />
        </ActionForm>
      </div>
      <p className="mt-4 flex flex-wrap justify-between gap-2 rounded-sm bg-cream px-4 py-3 text-sm text-ink">
        <span>{c.sharedPerPerson(attendance)}</span>
        <strong className="text-navy-900">{formatPrice(Math.round(shared))}</strong>
      </p>

      {/* Precio sugerido por opción */}
      <h3 className="mt-10 text-lg font-semibold text-navy-900">{c.optionsTitle}</h3>
      <p className="mt-1 text-sm text-ink-muted">{c.optionsHint}</p>
      {e.earningsPercent == null && <p className="mt-4 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">{c.noPercent}</p>}
      <ul className="mt-4 space-y-3">
        {e.priceOptions.map((o) => {
          const total = shared + (o.cost ?? 0);
          const suggested = suggestedPrice(total, e.earningsPercent);
          const current = earningsFor(o.price, total);
          return (
            <li key={o.id} className="rounded-sm border border-border p-4">
              <p className="font-semibold text-navy-900">{o.label}</p>
              <ActionForm action={saveOptionCost.bind(null, e.id, o.id)} submitLabel={adminCopy.edit.save} className="mt-3">
                <AdminField label={c.optionCost} htmlFor={`cost-${o.id}`}>
                  <MoneyInput id={`cost-${o.id}`} name="cost" defaultValue={o.cost} />
                </AdminField>
              </ActionForm>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Figure label={c.totalCost} value={formatPrice(Math.round(total))} />
                <Figure label={c.suggested} value={suggested == null ? "—" : formatPrice(suggested)} strong />
                <Figure label={c.current} value={formatPrice(o.price)} />
                <Figure
                  label={c.earnings}
                  value={current ? `${formatPrice(current.amount)} (${Math.round(current.percent)}\u00a0%)` : "—"}
                  tone={current ? (current.amount < 0 ? "bad" : "good") : undefined}
                />
              </dl>
              {suggested != null && (
                // Se queda montado aunque el precio ya sea el sugerido, para que el mensaje siga visible.
                <ActionForm
                  action={applySuggestedPrice.bind(null, e.id, o.id)}
                  submitLabel={suggested === o.price ? c.alreadySuggested : c.useSuggested}
                  pendingLabel="Aplicando…"
                  variant="secondary"
                  disabled={suggested === o.price}
                  confirm={c.useSuggestedConfirm(amountInput(suggested))}
                  className="mt-4"
                />
              )}
            </li>
          );
        })}
      </ul>

      {/* Resultado real */}
      <h3 className="mt-10 text-lg font-semibold text-navy-900">{c.resultTitle}</h3>
      <p className="mt-1 text-sm text-ink-muted">{c.resultHint}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label={c.people} value={String(result.people)} />
        <Stat label={c.revenue} value={formatPrice(result.revenue)} />
        <Stat label={c.totalCosts} value={formatPrice(Math.round(result.costs))} />
        <Stat label={c.result} value={formatPrice(Math.round(result.earnings))} tone={result.earnings < 0 ? "bad" : "good"} />
        <Stat label={c.collected} value={formatPrice(e.collected)} />
      </dl>
      {result.missingPrices > 0 && <p className="mt-3 text-sm text-amber-900">{c.missingPrices(result.missingPrices)}</p>}
    </CollapsibleCard>
  );
}

function MoneyInput({ id, name, defaultValue }: { id: string; name: string; defaultValue?: number | null }) {
  return (
    <div className="relative">
      <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted">
        $
      </span>
      {/* key con el valor: si cambia desde otra acción, el campo se remonta con el valor guardado. */}
      <input
        key={String(defaultValue)}
        id={id}
        name={name}
        inputMode="numeric"
        defaultValue={amountInput(defaultValue)}
        className={`${adminInputClass} pl-8`}
      />
    </div>
  );
}

function CostItemFields({ id, item }: { id: string; item?: { label: string; amount: number; kind: string } }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
      <AdminField label={c.itemLabel} htmlFor={`item-label-${id}`}>
        <input
          id={`item-label-${id}`}
          name="label"
          required
          defaultValue={item?.label}
          placeholder={item ? undefined : "Ej.: Canchas (3 días)"}
          className={adminInputClass}
        />
      </AdminField>
      <AdminField label={c.itemAmount} htmlFor={`item-amount-${id}`}>
        <MoneyInput id={`item-amount-${id}`} name="amount" defaultValue={item?.amount} />
      </AdminField>
      <AdminField label={c.itemKind} htmlFor={`item-kind-${id}`}>
        <select id={`item-kind-${id}`} name="kind" defaultValue={item?.kind ?? "TOTAL"} className={adminInputClass}>
          {c.kinds.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </AdminField>
    </div>
  );
}

function Figure({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "good" | "bad" }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 text-navy-900",
          strong && "text-base font-semibold",
          tone === "good" && "text-emerald-800",
          tone === "bad" && "font-semibold text-destructive",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-sm bg-cream p-3 sm:p-4">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-lg font-semibold text-navy-900",
          tone === "good" && "text-emerald-800",
          tone === "bad" && "text-destructive",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
