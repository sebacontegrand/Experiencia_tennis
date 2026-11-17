import { randomBytes } from "node:crypto";

/** Token nuevo para el link de pago (/pagar/<token>): 32 caracteres URL-safe. */
export function newPayToken() {
  return randomBytes(24).toString("base64url");
}
