import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { paymentCopy as c } from "@/content/payments";
import { getPayContext } from "@/lib/online-payments";
import { isMercadoPagoEnabled } from "@/lib/mercadopago";
import { syncMercadoPagoPayment } from "@/lib/payment-sync";
import { isPayToken, payableAmount } from "@/lib/mercadopago-rules";
import { formatPrice } from "@/lib/format";

// Los tokens son secretos: se prerenderiza solo un casco con un valor de relleno (no es un token válido).
export function generateStaticParams() {
  return [{ token: "__casco__" }];
}

export const metadata: Metadata = { title: c.page.title, robots: { index: false, follow: false } };

export default function PayResultPage(props: PageProps<"/pagar/[token]/resultado">) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-forest-900" />}>
      <Result {...props} />
    </Suspense>
  );
}

/**
 * Vuelta de Mercado Pago. No confiamos en los parámetros de la URL: si trae payment_id,
 * leemos ese pago en la API y lo aplicamos (igual que el webhook; sirve también en local).
 */
async function Result({ params, searchParams }: PageProps<"/pagar/[token]/resultado">) {
  await connection();
  const { token } = await params;
  if (!isPayToken(token)) notFound();
  const reg = await getPayContext(token);
  if (!reg) notFound();

  const sp = await searchParams;
  const paymentId = typeof sp.payment_id === "string" && /^\d+$/.test(sp.payment_id) ? sp.payment_id : null;
  let outcome: "approved" | "pending" | "rejected" | "unknown" = "unknown";
  if (paymentId && isMercadoPagoEnabled()) {
    try {
      const result = await syncMercadoPagoPayment(paymentId);
      if (result.ok && result.registrationId === reg.id) {
        outcome = result.paymentStatus === "APROBADO" ? "approved" : result.paymentStatus === "PENDIENTE" ? "pending" : "rejected";
      }
    } catch (err) {
      console.error("[mercadopago] no se pudo leer el pago de la vuelta", paymentId, err);
    }
  }

  const fresh = (await getPayContext(token)) ?? reg;
  const due = payableAmount(fresh.status, fresh.priceOption?.price, fresh.payments);
  const stillPayable = isMercadoPagoEnabled() && due.ok;
  // Aprobado pero con saldo (cuota o seña): no está confirmado todavía.
  const r = outcome === "approved" && due.ok ? c.result.approvedPartial : c.result[outcome];
  const Icon = outcome === "approved" ? CheckCircle2 : outcome === "rejected" ? XCircle : Clock;

  return (
    <section className="bg-forest-900 px-5 pt-16 pb-24 text-white sm:px-8">
      <div className="mx-auto max-w-xl">
        <Icon aria-hidden className={outcome === "approved" ? "size-12 text-ball-light" : "size-12 text-white/70"} />
        <h1 className="mt-6 font-serif text-5xl leading-[1.02] font-light">{r.title}</h1>
        <div className="brand-rule mt-5" />
        <p className="mt-5 text-lg text-white/80">{r.text}</p>
        <p className="mt-2 text-white/60">{fresh.experience.title}</p>
        {outcome === "approved" && due.ok && <p className="mt-2 text-white/80">{c.result.remaining(formatPrice(due.amount))}</p>}
        <div className="mt-10 flex flex-col gap-4">
          {outcome !== "pending" && stillPayable && (
            <Link
              href={`/pagar/${token}`}
              className="btn-label inline-flex h-14 w-full items-center justify-center bg-ball px-8 text-forest-900 transition hover:bg-ball-light sm:w-auto sm:self-start"
            >
              {outcome === "approved" ? c.result.payNext : c.result.retry}
            </Link>
          )}
          <Link href={`/experiencias/${fresh.experience.slug}`} className="inline-flex min-h-11 items-center text-sm text-white/80 underline-offset-4 hover:text-ball-light hover:underline">
            {c.result.back}
          </Link>
        </div>
      </div>
    </section>
  );
}
