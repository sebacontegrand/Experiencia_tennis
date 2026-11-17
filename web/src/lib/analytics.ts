"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Conversiones (Vercel Analytics, sin cookies). Nunca mandar datos personales: solo el evento
 * y, como mucho, datos generales (estado o tipo). Sin Vercel (local) no hace nada.
 */
export type ConversionEvent =
  | "community_signup"
  | "registration"
  | "lead"
  | "checkout_click"
  | "testimonial_sent";

export function track(event: ConversionEvent, props?: Record<string, string>) {
  try {
    vercelTrack(event, props);
  } catch {
    // La analítica nunca rompe un formulario.
  }
}
