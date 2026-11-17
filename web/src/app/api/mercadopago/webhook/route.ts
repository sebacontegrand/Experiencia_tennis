import { NextResponse, type NextRequest } from "next/server";
import { InvalidWebhookSignatureError } from "mercadopago";
import { isMercadoPagoEnabled, verifyWebhookSignature } from "@/lib/mercadopago";
import { syncMercadoPagoPayment } from "@/lib/payment-sync";

/**
 * Notificaciones de Mercado Pago (Webhooks, evento "payment").
 * 1. Verifica la firma x-signature con la clave secreta → 401 si no es válida.
 * 2. Ignora otros eventos (200).
 * 3. Lee el pago en la API y lo aplica de forma idempotente (reintentos y duplicados no cambian nada).
 * Si algo falla del lado nuestro responde 500 para que Mercado Pago reintente.
 */
export async function POST(request: NextRequest) {
  if (!isMercadoPagoEnabled()) return NextResponse.json({ error: "disabled" }, { status: 503 });

  const url = request.nextUrl;
  const body = (await request.json().catch(() => null)) as { type?: string; data?: { id?: string | number } } | null;
  const type = url.searchParams.get("type") ?? body?.type ?? null;
  const dataId = url.searchParams.get("data.id") ?? (body?.data?.id != null ? String(body.data.id) : null);

  try {
    verifyWebhookSignature({ xSignature: request.headers.get("x-signature"), xRequestId: request.headers.get("x-request-id"), dataId });
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    throw err;
  }

  if (type !== "payment" || !dataId || !/^\d+$/.test(dataId)) return NextResponse.json({ ignored: true });

  try {
    const result = await syncMercadoPagoPayment(dataId);
    if (!result.ok) console.warn("[mercadopago] pago no aplicado", dataId, result.reason);
    // Pagos de otra integración o sin referencia: 200 igual, reintentar no los arregla.
    return NextResponse.json({ ok: result.ok });
  } catch (err) {
    console.error("[mercadopago] error al procesar", dataId, err);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
}
