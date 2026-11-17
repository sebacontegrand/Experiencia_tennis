import "server-only";
import { MercadoPagoConfig, Payment, Preference, WebhookSignatureValidator } from "mercadopago";
import { absoluteUrl } from "@/config/site";
import { isPublicHttpsUrl, toPesos } from "@/lib/mercadopago-rules";

/**
 * Cliente de Mercado Pago (Checkout Pro). Credenciales en variables de entorno:
 * MP_ACCESS_TOKEN (de prueba o de producción) y MP_WEBHOOK_SECRET (clave secreta de Webhooks).
 */
export function isMercadoPagoEnabled() {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

function client() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN");
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
}

export const WEBHOOK_PATH = "/api/mercadopago/webhook";

export type CheckoutInput = {
  registrationId: string;
  payToken: string;
  itemId: string;
  title: string;
  amount: number;
  payer: { email: string; firstName: string; lastName: string };
};

/** Crea la preferencia de pago y devuelve la URL de Mercado Pago a la que hay que mandar al jugador. */
export async function createCheckout(input: CheckoutInput) {
  const result = absoluteUrl(`/pagar/${input.payToken}/resultado`);
  const webhook = absoluteUrl(WEBHOOK_PATH);
  const publicSite = isPublicHttpsUrl(result);
  const now = new Date();

  const pref = await new Preference(client()).create({
    body: {
      items: [{ id: input.itemId, title: input.title, quantity: 1, unit_price: input.amount, currency_id: "ARS" }],
      payer: { email: input.payer.email, name: input.payer.firstName, surname: input.payer.lastName },
      external_reference: input.registrationId,
      back_urls: { success: result, pending: result, failure: result },
      // Mercado Pago solo vuelve solo y avisa por webhook a URLs públicas por HTTPS.
      ...(publicSite ? { auto_return: "approved" } : {}),
      ...(isPublicHttpsUrl(webhook) ? { notification_url: webhook } : {}),
      statement_descriptor: "EXPTENIS",
      // El link vence en 24 h: si cambia el saldo, se genera otro.
      expires: true,
      expiration_date_from: now.toISOString(),
      expiration_date_to: new Date(now.getTime() + 24 * 3600_000).toISOString(),
      metadata: { registration_id: input.registrationId },
    },
  });
  // Con credenciales de prueba "TEST-" se usa el checkout de sandbox.
  const sandbox = process.env.MP_ACCESS_TOKEN?.startsWith("TEST-");
  const url = (sandbox ? pref.sandbox_init_point : undefined) ?? pref.init_point;
  if (!url) throw new Error("Mercado Pago no devolvió la URL de pago");
  return url;
}

export type MercadoPagoPayment = {
  id: string;
  status: string;
  statusDetail: string | null;
  amount: number;
  currency: string;
  externalReference: string | null;
  dateApproved: Date | null;
};

/** Lee el pago en Mercado Pago: la notificación solo trae el id, nunca confiamos en su contenido. */
export async function fetchPayment(id: string): Promise<MercadoPagoPayment> {
  const p = await new Payment(client()).get({ id });
  return {
    id: String(p.id ?? id),
    status: p.status ?? "unknown",
    statusDetail: p.status_detail ?? null,
    amount: toPesos(p.transaction_amount),
    currency: p.currency_id ?? "",
    externalReference: p.external_reference ?? null,
    dateApproved: p.date_approved ? new Date(p.date_approved) : null,
  };
}

/** Verifica la firma (x-signature) de una notificación con la clave secreta. Tira si no es válida. */
export function verifyWebhookSignature(args: { xSignature: string | null; xRequestId: string | null; dataId: string | null }) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) throw new Error("Falta MP_WEBHOOK_SECRET");
  // Sin tolerancia de tiempo: el formato de `ts` varía entre ejemplos (segundos o milisegundos) y una
  // notificación repetida no hace daño: el pago se vuelve a leer en la API y se aplica una sola vez.
  WebhookSignatureValidator.validate({ xSignature: args.xSignature, xRequestId: args.xRequestId, dataId: args.dataId, secret });
}
