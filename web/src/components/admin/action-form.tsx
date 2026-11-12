"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import type { AdminActionState } from "@/app/admin/(panel)/experiencias/actions";
import { cn } from "@/lib/utils";

/**
 * Formulario del panel: ejecuta una Server Action y muestra el resultado ("Guardado." o el error)
 * al lado del botón, anunciado a lectores de pantalla.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Guardando…",
  variant = "primary",
  confirm,
  className,
  children,
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  /** Texto de confirmación antes de enviar (acciones que cambian lo que se ve en el sitio). */
  confirm?: string;
  className?: string;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // Enviamos a mano para que React no vacíe el formulario: si hay un error, lo escrito queda.
        e.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className={cn("flex flex-col gap-4", className)}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-sm px-6 text-sm font-semibold transition disabled:opacity-60",
            variant === "primary" && "bg-navy-900 text-white hover:bg-navy-800",
            variant === "secondary" && "border border-navy-900 text-navy-900 hover:bg-cream",
            variant === "danger" && "border border-destructive/50 text-destructive hover:bg-destructive/5",
          )}
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        <p aria-live="polite" className={cn("text-sm", state?.ok ? "text-emerald-700" : "text-destructive")}>
          {!pending && state?.message}
        </p>
      </div>
    </form>
  );
}

export function AdminField({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-navy-900">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
