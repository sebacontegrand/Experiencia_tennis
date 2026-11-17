import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, Lock } from "lucide-react";
import { CheckoutButton } from "@/components/forms/checkout-button";
import { WhatsappIcon } from "@/components/icons/brand-icons";
import { paymentCopy as c } from "@/content/payments";
import { getPayContext } from "@/lib/online-payments";
import { isMercadoPagoEnabled } from "@/lib/mercadopago";
import { amountPaid } from "@/lib/registration-admin-rules";
import { isPayToken, payableAmount } from "@/lib/mercadopago-rules";
import { whatsappLink } from "@/config/site";
import { formatDateRange, formatPrice } from "@/lib/format";

// Link personal: no se indexa.
// Los tokens son secretos: se prerenderiza solo un casco con un valor de relleno (no es un token válido).
export function generateStaticParams() {
  return [{ token: "__casco__" }];
}

export const metadata: Metadata = { title: c.page.title, robots: { index: false, follow: false } };

export default function PayPage({ params }: PageProps<"/pagar/[token]">) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-forest-900" />}>
      <Pay params={params} />
    </Suspense>
  );
}

async function Pay({ params }: Pick<PageProps<"/pagar/[token]">, "params">) {
  await connection();
  const { token } = await params;
  if (!isPayToken(token)) notFound();
  const reg = await getPayContext(token);
  if (!reg) notFound();

  const price = reg.priceOption?.price;
  const paid = amountPaid(reg.payments);
  const payable = payableAmount(reg.status, price, reg.payments);
  const enabled = isMercadoPagoEnabled();
  const name = `${reg.player.firstName} ${reg.player.lastName}`;
  const state = !payable.ok ? c.states[payable.reason] : !enabled ? c.states.DISABLED : null;

  return (
    <section className="bg-forest-900 px-5 pt-10 pb-20 text-white sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link href={`/experiencias/${reg.experience.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-white hover:text-ball-light">
          <ArrowLeft aria-hidden className="size-4" /> {reg.experience.title}
        </Link>
        <h1 className="mt-6 font-serif text-5xl leading-[1.02] font-light">{c.page.title}</h1>
        <div className="brand-rule mt-5" />
        <p className="mt-5 text-white/80">{c.page.lead}</p>

        <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
          <Row label={c.page.rows.experience} value={reg.experience.title} />
          <Row label={c.page.rows.dates} value={formatDateRange(reg.experience.startDate, reg.experience.endDate)} />
          {reg.priceOption && <Row label={c.page.rows.option} value={reg.priceOption.label} />}
          {price != null && <Row label={c.page.rows.price} value={formatPrice(price)} />}
          {paid > 0 && <Row label={c.page.rows.paid} value={formatPrice(paid)} />}
          {payable.ok && <Row label={c.page.rows.due} value={formatPrice(payable.amount)} strong />}
        </dl>

        {state ? (
          <div className="mt-8">
            <p className="font-serif text-2xl">{state.title}</p>
            <p className="mt-2 text-white/75">{state.text}</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <CheckoutButton token={token} />
            <p className="flex items-center gap-2 text-sm text-white/60">
              <Lock aria-hidden className="size-4" /> {c.page.secure}
            </p>
          </div>
        )}

        <a
          href={whatsappLink(c.page.transferMessage(reg.experience.title, name))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm text-white/80 underline-offset-4 hover:text-ball-light hover:underline"
        >
          <WhatsappIcon size={18} /> {c.page.transfer}
        </a>
      </div>
    </section>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3.5">
      <dt className="text-sm text-white/60">{label}</dt>
      <dd className={strong ? "font-serif text-2xl text-ball-light" : "text-right"}>{value}</dd>
    </div>
  );
}
