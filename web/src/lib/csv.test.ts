import { describe, expect, it } from "vitest";
import { csvCell, fileSlug, toCsv } from "./csv";

describe("csvCell", () => {
  it("escapa comillas, separador y saltos de línea", () => {
    expect(csvCell('Dice "hola"')).toBe('"Dice ""hola"""');
    expect(csvCell("a;b")).toBe('"a;b"');
    expect(csvCell("línea 1\nlínea 2")).toBe('"línea 1\nlínea 2"');
  });
  it("neutraliza fórmulas", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(csvCell("-cmd")).toBe("'-cmd");
  });
  it("deja intactos teléfonos y números", () => {
    expect(csvCell("+54 9 11 2345 6789")).toBe("+54 9 11 2345 6789");
    expect(csvCell(850000)).toBe("850000");
    expect(csvCell(null)).toBe("");
  });
});

describe("toCsv", () => {
  it("BOM, separador ; y CRLF", () => {
    expect(toCsv(["Nombre", "Precio"], [["Ana", 100]])).toBe("﻿Nombre;Precio\r\nAna;100\r\n");
  });
});

describe("fileSlug", () => {
  it("saca tildes y espacios", () => {
    expect(fileSlug("Experiencia Tenis Gesell — Diciembre")).toBe("experiencia-tenis-gesell-diciembre");
  });
});
