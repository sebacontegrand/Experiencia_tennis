"use server";

import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/spam";
import { createCheckout, isMercadoPagoEnabled } from "@/lib/mercadopago";
import { getPayContext } from "@/lib/online-payments";
import { isPayToken, payableAmount } from "@/lib/mercadopago-rules";
import { paymentCopy } from "@/content/payments";

export type CheckoutState = { error: string } | null;

/** Crea la preferencia con el saldo calculado en el servidor (nunca lo manda el navegador) y redirige. */
export async function startCheckout(token: string, _prev: CheckoutState, _formData: FormData): Promise<CheckoutState> {
  void _formData;
  if (!isPayToken(token) || !isMercadoPagoEnabled()) return { error: paymentCopy.errors.generic };
  if (!(await checkRateLimit("checkout", { limit: 10, windowMs: 30 * 60 * 1000 }))) return { error: paymentCopy.errors.rateLimited };

  const reg = await getPayContext(token);
  if (!reg) return { error: paymentCopy.errors.generic };
  const payable = payableAmount(reg.status, reg.priceOption?.price, reg.payments);
  if (!payable.ok) return { error: paymentCopy.states[payable.reason].title };

  let url: string;
  try {
    url = await createCheckout({
      registrationId: reg.id,
      payToken: token,
      itemId: reg.priceOptionId ?? reg.id,
      title: reg.priceOption ? `${reg.experience.title} · ${reg.priceOption.label}` : reg.experience.title,
      amount: payable.amount,
      payer: { email: reg.player.email, firstName: reg.player.firstName, lastName: reg.player.lastName },
    });
  } catch (err) {
    console.error("[mercadopago] no se pudo crear la preferencia", err);
    return { error: paymentCopy.errors.generic };
  }
  redirect(url);
}
