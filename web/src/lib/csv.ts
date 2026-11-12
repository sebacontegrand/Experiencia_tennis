/**
 * CSV pensado para abrir con doble clic en Excel en español (Argentina):
 * separador ";", BOM UTF-8 para que respete tildes y ñ, y fin de línea CRLF.
 */
export const CSV_SEPARATOR = ";";

/**
 * Escapa una celda. Además neutraliza "inyección de fórmulas": un texto que empieza con =, @, o +/- seguido
 * de algo que no es número (p. ej. "=HYPERLINK(...)") se antepone con ' para que Excel no lo ejecute.
 * Los teléfonos "+54 9 11…" quedan intactos.
 */
export function csvCell(value: string | number | null | undefined) {
  if (value == null) return "";
  let s = String(value);
  if (/^[=@\t\r]/.test(s) || /^[+-](?![\d\s(])/.test(s)) s = `'${s}`;
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(CSV_SEPARATOR));
  return "﻿" + lines.join("\r\n") + "\r\n";
}

/** "Experiencia Tenis Gesell" → "experiencia-tenis-gesell" (nombre de archivo seguro). */
export function fileSlug(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "export"
  );
}
