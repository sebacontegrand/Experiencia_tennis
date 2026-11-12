/** Formato de fechas y precios para el sitio (es-AR, zona horaria de Buenos Aires). */

const TZ = "America/Argentina/Buenos_Aires";

const dayMonth = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: TZ });
const dayOnly = new Intl.DateTimeFormat("es-AR", { day: "numeric", timeZone: TZ });
const monthOnly = new Intl.DateTimeFormat("es-AR", { month: "long", timeZone: TZ });
const year = new Intl.DateTimeFormat("es-AR", { year: "numeric", timeZone: TZ });

/** "11 al 13 de diciembre de 2026", "30 de noviembre al 2 de diciembre de 2026", "5 de marzo de 2027". */
export function formatDateRange(start: Date, end: Date) {
  const sameDay = dayMonth.format(start) === dayMonth.format(end) && year.format(start) === year.format(end);
  if (sameDay) return `${dayMonth.format(start)} de ${year.format(start)}`;
  const sameMonth = monthOnly.format(start) === monthOnly.format(end) && year.format(start) === year.format(end);
  if (sameMonth) return `${dayOnly.format(start)} al ${dayMonth.format(end)} de ${year.format(end)}`;
  return `${dayMonth.format(start)} al ${dayMonth.format(end)} de ${year.format(end)}`;
}

const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

/** Precio entero en ARS; null → "Consultar". */
export function formatPrice(amount: number | null | undefined) {
  return amount == null ? "Consultar" : ars.format(amount);
}

const fullDate = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });

/** "25 de noviembre de 2026" */
export function formatDate(date: Date) {
  return fullDate.format(date);
}
