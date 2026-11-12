/**
 * Clases compartidas del panel. Viven fuera de los módulos "use client": un valor que no es componente
 * importado de un módulo de cliente llega a los Server Components como referencia, no como texto.
 */
export const adminInputClass =
  "h-12 w-full rounded-sm border border-input bg-white px-3.5 text-base text-ink outline-none focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/30";
