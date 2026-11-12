"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { adminCopy } from "@/content/admin";
import type { Itinerary } from "@/lib/itinerary";
import { adminInputClass } from "./styles";

const c = adminCopy.edit;

type Item = { key: string; time: string; text: string };
type Day = { key: string; day: string; title: string; items: Item[] };

let seq = 0;
const k = () => `k${++seq}`;
const emptyItem = (): Item => ({ key: k(), time: "", text: "" });
const emptyDay = (): Day => ({ key: k(), day: "", title: "", items: [emptyItem()] });

/**
 * Editor del cronograma día por día. Vive dentro de un ActionForm: manda todo como JSON en un
 * campo oculto `itinerary`; el servidor lo valida y limpia (renglones vacíos, días vacíos).
 */
export function ItineraryEditor({ initial }: { initial: Itinerary }) {
  const id = useId();
  const [days, setDays] = useState<Day[]>(() =>
    initial.map((d) => ({
      key: k(),
      day: d.day,
      title: d.title ?? "",
      items: d.items.length ? d.items.map((it) => ({ key: k(), time: it.time ?? "", text: it.text })) : [emptyItem()],
    })),
  );

  const updateDay = (key: string, patch: Partial<Day>) => setDays((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const updateItem = (dayKey: string, itemKey: string, patch: Partial<Item>) =>
    setDays((ds) =>
      ds.map((d) => (d.key === dayKey ? { ...d, items: d.items.map((it) => (it.key === itemKey ? { ...it, ...patch } : it)) } : d)),
    );

  const json = JSON.stringify(
    days.map((d) => ({ day: d.day, title: d.title, items: d.items.map((it) => ({ time: it.time, text: it.text })) })),
  );

  return (
    <div className="space-y-5">
      <input type="hidden" name="itinerary" value={json} />
      {days.length === 0 && <p className="text-sm text-ink-muted">{c.itineraryEmpty}</p>}

      {days.map((d, di) => (
        <fieldset key={d.key} className="rounded-sm border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-navy-900">
            {c.day} {di + 1}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={c.day} htmlFor={`${id}-${d.key}-day`}>
              <input
                id={`${id}-${d.key}-day`}
                value={d.day}
                maxLength={60}
                placeholder={c.dayPlaceholder}
                onChange={(e) => updateDay(d.key, { day: e.target.value })}
                className={adminInputClass}
              />
            </Field>
            <Field label={c.dayTitle} htmlFor={`${id}-${d.key}-title`}>
              <input
                id={`${id}-${d.key}-title`}
                value={d.title}
                maxLength={120}
                placeholder={c.dayTitlePlaceholder}
                onChange={(e) => updateDay(d.key, { title: e.target.value })}
                className={adminInputClass}
              />
            </Field>
          </div>

          <ul className="mt-4 space-y-4">
            {d.items.map((it, ii) => (
              <li key={it.key} className="grid grid-cols-[6.5rem_1fr_auto] items-end gap-2 sm:grid-cols-[8rem_1fr_auto]">
                <Field label={c.time} htmlFor={`${id}-${it.key}-time`} hideLabel={ii > 0}>
                  <input
                    id={`${id}-${it.key}-time`}
                    value={it.time}
                    maxLength={40}
                    placeholder={c.timePlaceholder}
                    onChange={(e) => updateItem(d.key, it.key, { time: e.target.value })}
                    className={adminInputClass}
                  />
                </Field>
                <Field label={c.text} htmlFor={`${id}-${it.key}-text`} hideLabel={ii > 0}>
                  <input
                    id={`${id}-${it.key}-text`}
                    value={it.text}
                    maxLength={500}
                    onChange={(e) => updateItem(d.key, it.key, { text: e.target.value })}
                    className={adminInputClass}
                  />
                </Field>
                <button
                  type="button"
                  aria-label={`${c.removeItem} ${ii + 1}`}
                  onClick={() => updateDay(d.key, { items: d.items.length > 1 ? d.items.filter((x) => x.key !== it.key) : [emptyItem()] })}
                  className="inline-flex size-12 items-center justify-center rounded-sm text-ink-muted hover:bg-cream hover:text-destructive"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => updateDay(d.key, { items: [...d.items, emptyItem()] })}
              className="inline-flex h-11 items-center gap-2 rounded-sm border border-border px-4 text-sm font-semibold text-navy-900 hover:border-navy-900"
            >
              <Plus aria-hidden className="size-4" /> {c.addItem}
            </button>
            <button
              type="button"
              onClick={() => {
                if (d.items.some((it) => it.text.trim()) && !window.confirm(`¿${c.removeDay} ${di + 1}?`)) return;
                setDays((ds) => ds.filter((x) => x.key !== d.key));
              }}
              className="inline-flex h-11 items-center gap-2 rounded-sm px-4 text-sm font-semibold text-destructive hover:bg-destructive/5"
            >
              <Trash2 aria-hidden className="size-4" /> {c.removeDay}
            </button>
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => setDays((ds) => [...ds, emptyDay()])}
        className="inline-flex h-12 items-center gap-2 rounded-sm border border-dashed border-navy-900/40 px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
      >
        <Plus aria-hidden className="size-4" /> {c.addDay}
      </button>
    </div>
  );
}

function Field({ label, htmlFor, hideLabel, children }: { label: string; htmlFor: string; hideLabel?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className={hideLabel ? "sr-only" : "text-sm font-medium text-navy-900"}>
        {label}
      </label>
      {children}
    </div>
  );
}
