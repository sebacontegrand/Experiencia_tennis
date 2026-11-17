import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InvalidWebhookSignatureError } from "mercadopago";
import { verifyWebhookSignature } from "./mercadopago";

const SECRET = "clave-de-prueba";
const sign = (dataId: string, requestId: string, ts: string, secret = SECRET) =>
  createHmac("sha256", secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");

describe("verifyWebhookSignature", () => {
  beforeEach(() => {
    process.env.MP_WEBHOOK_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.MP_WEBHOOK_SECRET;
  });

  it("acepta una firma válida", () => {
    const ts = "1742505638683";
    const xSignature = `ts=${ts},v1=${sign("123456", "req-1", ts)}`;
    expect(() => verifyWebhookSignature({ xSignature, xRequestId: "req-1", dataId: "123456" })).not.toThrow();
  });

  it("rechaza firma con otra clave, otro pago o sin header", () => {
    const ts = "1742505638683";
    const bad = `ts=${ts},v1=${sign("123456", "req-1", ts, "otra")}`;
    expect(() => verifyWebhookSignature({ xSignature: bad, xRequestId: "req-1", dataId: "123456" })).toThrow(InvalidWebhookSignatureError);
    const good = `ts=${ts},v1=${sign("123456", "req-1", ts)}`;
    expect(() => verifyWebhookSignature({ xSignature: good, xRequestId: "req-1", dataId: "999" })).toThrow(InvalidWebhookSignatureError);
    expect(() => verifyWebhookSignature({ xSignature: null, xRequestId: "req-1", dataId: "123456" })).toThrow(InvalidWebhookSignatureError);
  });

  it("sin clave configurada no acepta nada", () => {
    delete process.env.MP_WEBHOOK_SECRET;
    expect(() => verifyWebhookSignature({ xSignature: "ts=1,v1=x", xRequestId: "r", dataId: "1" })).toThrow();
  });
});
