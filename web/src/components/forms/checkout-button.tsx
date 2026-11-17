"use client";

import { useActionState } from "react";
import { startCheckout, type CheckoutState } from "@/app/(site)/pagar/[token]/actions";
import { paymentCopy } from "@/content/payments";
import { track } from "@/lib/analytics";

/** Botón que crea el pago en el servidor y lleva a Mercado Pago. */
export function CheckoutButton({ token, label = paymentCopy.payCta }: { token: string; label?: string }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout.bind(null, token), null);
  return (
    <form action={action} onSubmit={() => track("checkout_click")} className="flex flex-col gap-3 sm:items-start">
      <button
        type="submit"
        disabled={pending}
        className="btn-label inline-flex h-14 w-full items-center justify-center bg-ball px-8 text-forest-900 transition hover:bg-ball-light disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Abriendo Mercado Pago…" : label}
      </button>
      <p aria-live="polite" className="text-sm text-red-300">
        {state?.error}
      </p>
    </form>
  );
}
