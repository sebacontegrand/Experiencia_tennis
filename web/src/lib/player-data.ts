/** Lógica pura de datos de jugador (sin acceso a la base), para poder testearla. */

export type PlayerFields = {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp?: string;
  city?: string;
  club?: string;
  level?: string;
  gender?: "FEMENINO" | "MASCULINO" | "OTRO" | "PREFIERO_NO_DECIR";
  referralSource?: string;
  marketingConsent: boolean;
};

/**
 * Datos de actualización para un jugador existente:
 * - los campos vacíos (undefined) no pisan lo guardado;
 * - el consentimiento solo se otorga (nunca se revoca desde un formulario público)
 *   y la fecha se registra la primera vez;
 * - `source` no se toca: queremos saber por dónde entró originalmente.
 */
export function buildPlayerUpdate(input: PlayerFields, hadConsent: boolean, now: Date) {
  const { email: _email, marketingConsent, ...fields } = input;
  void _email;
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== "") data[key] = value;
  }
  if (marketingConsent && !hadConsent) {
    data.marketingConsent = true;
    data.marketingConsentAt = now;
  }
  return data;
}
