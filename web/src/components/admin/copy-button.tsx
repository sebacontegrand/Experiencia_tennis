"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copia un texto al portapapeles (p. ej. el link de pago). */
export function CopyButton({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      className="inline-flex h-12 items-center gap-2 rounded-sm border border-forest-900 px-5 text-sm font-semibold text-forest-900 hover:bg-cream"
    >
      {done ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
      <span aria-live="polite">{done ? doneLabel : label}</span>
    </button>
  );
}
