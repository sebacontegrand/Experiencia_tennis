"use client";

import { startTransition, useActionState } from "react";
import type { AdminActionState } from "@/app/admin/(panel)/experiencias/actions";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; confirm?: string; variant: "primary" | "secondary" | "danger" };

/**
 * Botones de cambio de estado en UN solo formulario: cuando el estado cambia, los botones cambian
 * pero el mensaje del resultado ("Listo: cancelada.") sigue visible.
 */
export function StatusActions({
  action,
  options,
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  options: Option[];
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const option = options.find((o) => o.value === submitter?.value);
        if (option?.confirm && !window.confirm(option.confirm)) return;
        const formData = new FormData(e.currentTarget, submitter);
        startTransition(() => formAction(formData));
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="submit"
            name="to"
            value={o.value}
            disabled={pending}
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-sm px-6 text-sm font-semibold transition disabled:opacity-60",
              o.variant === "primary" && "bg-navy-900 text-white hover:bg-navy-800",
              o.variant === "secondary" && "border border-navy-900 text-navy-900 hover:bg-cream",
              o.variant === "danger" && "border border-destructive/50 text-destructive hover:bg-destructive/5",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className={cn("text-sm", state?.ok ? "text-emerald-700" : "text-destructive")}>
        {pending ? "Guardando…" : state?.message}
      </p>
    </form>
  );
}
