"use client";

import { useActionState } from "react";
import { startCheckout, type CheckoutState } from "@/app/(site)/pagar/[token]/actions";
import { paymentCopy } from "@/content/payments";
import { track } from "@/lib/analytics";

/** Botón que crea el pago en el servidor y lleva a Mercado Pago. */
export function CheckoutButton({
  token,
  label = paymentCopy.payCta,
  mode = "full",
  variant = "primary",
}: {
  token: string;
  label?: string;
  mode?: "installment" | "full";
  variant?: "primary" | "secondary";
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout.bind(null, token, mode), null);
  return (
    <form action={action} onSubmit={() => track("checkout_click", { mode })} className="flex flex-col gap-3 sm:items-start">
      <button
        type="submit"
        disabled={pending}
        className={
          variant === "primary"
            ? "btn-label inline-flex h-14 w-full items-center justify-center bg-ball px-8 text-forest-900 transition hover:bg-ball-light disabled:opacity-60 sm:w-auto"
            : "btn-label inline-flex h-14 w-full items-center justify-center px-8 text-white ring-1 ring-white/40 transition ring-inset hover:ring-ball-light disabled:opacity-60 sm:w-auto"
        }
      >
        {pending ? "Abriendo Mercado Pago…" : label}
      </button>
      <p aria-live="polite" className="text-sm text-red-300">
        {state?.error}
      </p>
    </form>
  );
}
